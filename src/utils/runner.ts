
import { LanguageId, LogEntry } from '../types';
import { evaluateJavaScript } from './evaluator';
import { LANGUAGES, isRemoteLanguage } from './languages';

export interface RunResult {
  success: boolean;
  executionTimeMs: number;
  error?: string;
}

const WANDBOX_ENDPOINT = 'https://wandbox.org/api/compile.json';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_OUTPUT_CHARS = 40_000;

interface WandboxResponse {
  status?: string;
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
}

const timestamp = (): string => {
  const now = new Date();
  return (
    now.toTimeString().split(' ')[0] +
    '.' +
    String(now.getMilliseconds()).padStart(3, '0')
  );
};

const createId = (): string =>
  Math.random().toString(36).substring(2, 9);

const clip = (value: string): string =>
  value.length > MAX_OUTPUT_CHARS
    ? `${value.slice(0, MAX_OUTPUT_CHARS)}\n… output truncated (${value.length - MAX_OUTPUT_CHARS} more characters)`
    : value;

/**
 * Extract simple, literal prompts associated with input operations.
 * Supports common Python input(), C printf()/scanf(), and
 * C++ cout/cin patterns. This is not a full language parser.
 */
function extractPrompts(
  language: LanguageId,
  code: string
): string[] {
  const prompts: string[] = [];

  if (language === 'python') {
    const regex =
      /\binput\s*\(\s*(["'])(.*?)\1\s*\)/g;

    for (const match of code.matchAll(regex)) {
      prompts.push(match[2]);
    }
  }

  if (language === 'c') {
    const regex =
      /printf\s*\(\s*"((?:\\.|[^"\\])*)"\s*\)\s*;[\s\S]*?\bscanf\s*\(/g;

    for (const match of code.matchAll(regex)) {
      prompts.push(
        match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
      );
    }
  }

  if (language === 'cpp') {
    const regex =
      /cout\s*<<\s*"((?:\\.|[^"\\])*)"[\s\S]*?;\s*[\s\S]*?\bcin\s*>>/g;

    for (const match of code.matchAll(regex)) {
      prompts.push(
        match[1]
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
      );
    }
  }

  return prompts;
}

/**
 * Echo pre-supplied stdin next to recognized prompts.
 * The actual program still executes on Wandbox with stdin supplied
 * before execution; this function only formats the returned display.
 */
function formatTerminalOutput(
  language: LanguageId,
  code: string,
  stdout: string,
  stdin: string
): string {
  if (!stdout || !stdin) return stdout;

  const prompts = extractPrompts(language, code);
  if (prompts.length === 0) return stdout;

  const inputLines = stdin.split(/\r?\n/);
  let output = stdout;
  let inputIndex = 0;
  let searchFrom = 0;

  for (const prompt of prompts) {
    if (inputIndex >= inputLines.length) break;

    const promptIndex = output.indexOf(prompt, searchFrom);

    if (promptIndex === -1) {
      inputIndex++;
      continue;
    }

    const insertAt = promptIndex + prompt.length;
    const inputValue = inputLines[inputIndex];

    // Echo the submitted input and separate the following output.
    const insertion = `${inputValue}\n`;

    output =
      output.slice(0, insertAt) +
      insertion +
      output.slice(insertAt);

    searchFrom = insertAt + insertion.length;
    inputIndex++;
  }

  return output;
}

async function runRemote(
  language: LanguageId,
  code: string,
  onLog: (entry: LogEntry) => void,
  stdin = ''
): Promise<RunResult> {
  const config = LANGUAGES[language];
  const started = performance.now();

  const push = (
    type: LogEntry['type'],
    content: unknown,
    extra: Partial<LogEntry> = {}
  ) => {
    onLog({
      id: createId(),
      type,
      content,
      timestamp: timestamp(),
      ...extra,
    });
  };

  const controller = new AbortController();
  const timer = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  push(
    'info',
    `Compiling and running ${config.fileName} in the ${config.label} sandbox…`
  );

  try {
    const response = await fetch(WANDBOX_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        compiler: config.wandboxCompiler,
        code,
        stdin,
        'compiler-option-raw': config.compilerOptions ?? '',
        'runtime-option-raw': '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Runner responded with HTTP ${response.status}`);
    }

    const data = (await response.json()) as WandboxResponse;
    const executionTimeMs = Number(
      (performance.now() - started).toFixed(2)
    );

    const compilerError = (
      data.compiler_error ||
      data.compiler_message ||
      ''
    ).trim();

    const compilerWarnings = (
      data.compiler_output || ''
    ).trim();

    const rawStdout = data.program_output || '';
    const stderr = (data.program_error || '').trimEnd();

    const stdout = formatTerminalOutput(
      language,
      code,
      rawStdout,
      stdin
    ).trimEnd();

    if (compilerError) {
      push('error', `Compilation failed\n\n${clip(compilerError)}`);
    }

    if (!compilerError && compilerWarnings) {
      push('warn', clip(compilerWarnings));
    }

    if (stdout) {
      push('log', clip(stdout));
    }

    if (stderr) {
      push('error', clip(stderr));
    }

    if (!compilerError && !stdout && !stderr) {
      push('info', 'Program finished with no output.');
    }

    const exitCode = data.status ?? '0';
    const success = exitCode === '0' && !compilerError;

    if (!success && !compilerError && !stderr) {
      push(
        'error',
        exitCode === '124' || Boolean(data.signal)
          ? `Program was stopped (${data.signal || 'timeout'}).`
          : `Program exited with status ${exitCode}.`
      );
    }

    return {
      success,
      executionTimeMs,
      ...(!success
        ? {
            error:
              compilerError ||
              stderr ||
              `Program exited with status ${exitCode}.`,
          }
        : {}),
    };
  } catch (error) {
    const executionTimeMs = Number(
      (performance.now() - started).toFixed(2)
    );

    const message = controller.signal.aborted
      ? 'The code runner timed out. Try a smaller program.'
      : error instanceof Error
        ? error.message
        : 'Unknown execution error';

    push('error', message);

    return {
      success: false,
      executionTimeMs,
      error: message,
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export function runCode(
  language: LanguageId,
  code: string,
  onLog: (entry: LogEntry) => void,
  stdin = ''
): Promise<RunResult> {
  if (!isRemoteLanguage(language)) {
    return evaluateJavaScript(code, onLog);
  }

  return runRemote(language, code, onLog, stdin);
}
