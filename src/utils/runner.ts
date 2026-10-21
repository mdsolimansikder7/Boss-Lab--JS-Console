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

const timestamp = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
};

const id = () => Math.random().toString(36).substring(2, 9);

const clip = (text: string): string =>
  text.length > MAX_OUTPUT_CHARS
    ? `${text.slice(0, MAX_OUTPUT_CHARS)}\n… output truncated (${text.length - MAX_OUTPUT_CHARS} more characters)`
    : text;

/**
 * Compile & run C / C++ / Python through the Wandbox sandbox.
 * Wandbox sends permissive CORS headers, so this works from a static build too.
 */
async function runRemote(
  language: LanguageId,
  code: string,
  onLog: (entry: LogEntry) => void
): Promise<RunResult> {
  const config = LANGUAGES[language];
  const started = performance.now();

  const push = (type: LogEntry['type'], content: unknown, extra: Partial<LogEntry> = {}) => {
    onLog({
      id: id(),
      type,
      content,
      timestamp: timestamp(),
      ...extra,
    });
  };

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  push('info', `Compiling and running ${config.fileName} in the ${config.label} sandbox…`);

  try {
    const response = await fetch(WANDBOX_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        compiler: config.wandboxCompiler,
        code,
        stdin: '',
        'compiler-option-raw': config.compilerOptions ?? '',
        'runtime-option-raw': '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Runner responded with HTTP ${response.status}`);
    }

    const data = (await response.json()) as WandboxResponse;
    const executionTimeMs = Number((performance.now() - started).toFixed(2));

    const compilerError = (data.compiler_error || data.compiler_message || '').trim();
    const compilerWarnings = (data.compiler_output || '').trim();
    const stdout = (data.program_output || '').trimEnd();
    const stderr = (data.program_error || '').trimEnd();

    if (compilerError) {
      push('error', `Compilation failed\n\n${clip(compilerError)}`);
    } else if (compilerWarnings) {
      push('warn', clip(compilerWarnings));
    }

    if (stdout) push('log', clip(stdout));
    if (stderr) push('error', clip(stderr));

    if (!compilerError && !stdout && !stderr) {
      push('info', 'Program finished with no output.');
    }

    const exitCode = data.status ?? '0';
    const success = exitCode === '0' && !compilerError;

    if (!success && !compilerError && !stderr) {
      push(
        'error',
        exitCode === '124' || data.signal
          ? `Program was stopped (${data.signal || 'timeout'}).`
          : `Program exited with status ${exitCode}.`
      );
    }

    return { success, executionTimeMs };
  } catch (error) {
    const executionTimeMs = Number((performance.now() - started).toFixed(2));
    const aborted = controller.signal.aborted;

    push(
      'error',
      aborted
        ? 'The code runner took too long to respond. Try a smaller program.'
        : 'Could not reach the code runner. Python, C and C++ run in a secure online sandbox — check your internet connection and try again.'
    );

    return {
      success: false,
      executionTimeMs,
      error: String(error),
    };
  } finally {
    window.clearTimeout(timer);
  }
}

export function runCode(
  language: LanguageId,
  code: string,
  onLog: (entry: LogEntry) => void
): Promise<RunResult> {
  if (!isRemoteLanguage(language)) {
    return evaluateJavaScript(code, onLog);
  }
  return runRemote(language, code, onLog);
}
