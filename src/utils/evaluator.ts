import { LogEntry } from '../types';

export interface ExecutionResult {
  success: boolean;
  executionTimeMs: number;
  error?: string;
  returnValue?: any;
}

// The runner wraps user code like this before executing it via `new Function(...)`:
//
//   function anonymous(console, fetch, setTimeout, ...) {
//   return (async () => {
//     <user code line 1>
//     <user code line 2>
//     ...
//   })();
//   }
//
// V8 always adds 3 header lines, so user code line N starts at internal line
// (N + 3). The sourceURL comment below makes stack frames report
// `bosslab-user-code.js:L:C`, which is far more reliable to parse than the old
// `eval at <anonymous>` frames.
const WRAPPER_LINE_OFFSET = 3;
const SOURCE_URL = 'bosslab-user-code.js';

/** Helper to extract the exact line number from an error. */
export function extractErrorLine(err: any, code: string): number | undefined {
  if (!err) return undefined;

  const totalLines = code.split('\n').length;
  const toUserLine = (raw: number) => raw - WRAPPER_LINE_OFFSET;
  const valid = (line: number) => line >= 1 && line <= totalLines;

  // Direct line number property (Firefox / Safari / V8 extensions)
  if (typeof err.lineNumber === 'number' && err.lineNumber > 0) {
    const line = toUserLine(err.lineNumber);
    if (valid(line)) return line;
  }

  const stack = err?.stack;
  if (typeof stack !== 'string') return undefined;

  // Best case: frames named through the sourceURL comment.
  const ownFile = new RegExp(`${SOURCE_URL.replace('.', '\\.')}:(\\d+):(\\d+)`, 'g');
  const ownMatches = [...stack.matchAll(ownFile)];
  for (const match of ownMatches) {
    const rawLine = parseInt(match[1], 10);
    const userLine = toUserLine(rawLine);
    if (valid(userLine)) return userLine;
  }

  // Fallback: read the LAST location of the FIRST anonymous frame. The first
  // match is often the `eval at <anonymous> (:5:16)` call-site, which pointed at
  // the wrong user line before.
  const firstFrame = stack.split('\n').find((line) => line.includes('<anonymous>:'));
  if (firstFrame) {
    const matches = [...firstFrame.matchAll(/<anonymous>:(\d+):(\d+)/g)];
    for (const match of matches.reverse()) {
      const userLine = toUserLine(parseInt(match[1], 10));
      if (valid(userLine)) return userLine;
    }
  }

  const anonMatches = [...stack.matchAll(/<anonymous>:(\d+):(\d+)/g)];
  for (const match of anonMatches) {
    const userLine = toUserLine(parseInt(match[1], 10));
    if (valid(userLine)) return userLine;
  }

  // Last resort: "line 12" inside the message/stack.
  const lineMsgMatch =
    stack.match(/line\s+(\d+)/i) || (err?.message && String(err.message).match(/line\s+(\d+)/i));
  if (lineMsgMatch) {
    const parsedLine = parseInt(lineMsgMatch[1], 10);
    const userLine = toUserLine(parsedLine);
    if (valid(userLine)) return userLine;
    if (valid(parsedLine)) return parsedLine;
  }

  return undefined;
}

export function evaluateJavaScript(
  code: string,
  onLog: (entry: LogEntry) => void
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const timers = new Map<string, number>();
    const counters = new Map<string, number>();

    const getTimestamp = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    };

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const customConsole = {
      log: (...args: any[]) => {
        onLog({
          id: generateId(),
          type: 'log',
          content: args.length === 1 ? args[0] : args,
          timestamp: getTimestamp()
        });
      },
      debug: (...args: any[]) => {
        onLog({
          id: generateId(),
          type: 'log',
          content: args.length === 1 ? args[0] : args,
          timestamp: getTimestamp()
        });
      },
      warn: (...args: any[]) => {
        onLog({
          id: generateId(),
          type: 'warn',
          content: args.length === 1 ? args[0] : args,
          timestamp: getTimestamp()
        });
      },
      error: (...args: any[]) => {
        onLog({
          id: generateId(),
          type: 'error',
          content: args.length === 1 ? args[0] : args,
          timestamp: getTimestamp()
        });
      },
      info: (...args: any[]) => {
        onLog({
          id: generateId(),
          type: 'info',
          content: args.length === 1 ? args[0] : args,
          timestamp: getTimestamp()
        });
      },
      table: (data: any) => {
        onLog({
          id: generateId(),
          type: 'table',
          content: data,
          timestamp: getTimestamp()
        });
      },
      clear: () => {
        onLog({
          id: generateId(),
          type: 'clear',
          content: 'Console was cleared',
          timestamp: getTimestamp()
        });
      },
      dir: (obj: any) => {
        onLog({
          id: generateId(),
          type: 'info',
          content: obj,
          timestamp: getTimestamp()
        });
      },
      trace: (...args: any[]) => {
        const stack = new Error(args.join(' ')).stack;
        onLog({
          id: generateId(),
          type: 'info',
          content: args.length ? args : ['Trace'],
          stack,
          timestamp: getTimestamp()
        });
      },
      assert: (condition: boolean, ...args: any[]) => {
        if (!condition) {
          const message = args.length > 0 ? args.join(' ') : 'Assertion failed';
          onLog({
            id: generateId(),
            type: 'error',
            content: `Assertion failed: ${message}`,
            timestamp: getTimestamp()
          });
        }
      },
      time: (label: string = 'default') => {
        timers.set(label, performance.now());
      },
      timeLog: (label: string = 'default') => {
        const start = timers.get(label);
        if (start === undefined) {
          onLog({
            id: generateId(),
            type: 'warn',
            content: `Timer '${label}' does not exist`,
            timestamp: getTimestamp()
          });
          return;
        }
        const duration = performance.now() - start;
        onLog({
          id: generateId(),
          type: 'info',
          content: `${label}: ${duration.toFixed(3)} ms`,
          timestamp: getTimestamp()
        });
      },
      timeEnd: (label: string = 'default') => {
        const start = timers.get(label);
        if (start !== undefined) {
          const duration = performance.now() - start;
          timers.delete(label);
          onLog({
            id: generateId(),
            type: 'info',
            content: `${label}: ${duration.toFixed(3)} ms`,
            timestamp: getTimestamp(),
            duration,
            label
          });
        } else {
          onLog({
            id: generateId(),
            type: 'warn',
            content: `Timer '${label}' does not exist`,
            timestamp: getTimestamp()
          });
        }
      },
      count: (label: string = 'default') => {
        const current = (counters.get(label) || 0) + 1;
        counters.set(label, current);
        onLog({
          id: generateId(),
          type: 'log',
          content: `${label}: ${current}`,
          timestamp: getTimestamp(),
          countKey: label,
          countVal: current
        });
      },
      countReset: (label: string = 'default') => {
        counters.delete(label);
      }
    };

    try {
      const runnerFn = new Function(
        'console',
        'fetch',
        'setTimeout',
        'setInterval',
        'clearTimeout',
        'clearInterval',
        'performance',
        `return (async () => {
${code}
})();
//# sourceURL=${SOURCE_URL}`
      );

      const resultPromise = runnerFn(
        customConsole,
        window.fetch.bind(window),
        window.setTimeout.bind(window),
        window.setInterval.bind(window),
        window.clearTimeout.bind(window),
        window.clearInterval.bind(window),
        performance
      );

      resultPromise
        .then((val: any) => {
          const endTime = performance.now();
          const executionTimeMs = Number((endTime - startTime).toFixed(2));

          if (val !== undefined) {
            onLog({
              id: generateId(),
              type: 'result',
              content: val,
              timestamp: getTimestamp()
            });
          }

          resolve({ success: true, executionTimeMs, returnValue: val });
        })
        .catch((err: any) => {
          const endTime = performance.now();
          const executionTimeMs = Number((endTime - startTime).toFixed(2));
          const errorMessage = err?.message || String(err);

          onLog({
            id: generateId(),
            type: 'error',
            content: `${err?.name || 'Error'}: ${errorMessage}`,
            stack: err?.stack,
            line: extractErrorLine(err, code),
            timestamp: getTimestamp()
          });

          resolve({ success: false, executionTimeMs, error: errorMessage });
        });
    } catch (err: any) {
      const endTime = performance.now();
      const executionTimeMs = Number((endTime - startTime).toFixed(2));
      const errorMessage = err?.message || String(err);

      onLog({
        id: generateId(),
        type: 'error',
        content: `${err?.name || 'Error'}: ${errorMessage}`,
        stack: err?.stack,
        line: extractErrorLine(err, code),
        timestamp: getTimestamp()
      });

      resolve({ success: false, executionTimeMs, error: errorMessage });
    }
  });
}

/** Format a value as a compact display string. */
export function formatValueForDisplay(val: any): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'function') return val.toString();
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}
