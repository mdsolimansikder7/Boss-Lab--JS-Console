import { LogEntry, LogType } from '../types';

export interface ExecutionResult {
  success: boolean;
  executionTimeMs: number;
  error?: string;
  returnValue?: any;
}

// The runner wraps user code like this before executing it via `new Function(...)`:
//
//   function anonymous(console,fetch,setTimeout,setInterval,clearTimeout,clearInterval,performance
//   ) {
//   return (async () => {
//     <user code line 1>
//     <user code line 2>
//     ...
//   })();
//   }
//
// V8 always adds 2 header lines for the function signature, plus our own
// "return (async () => {" wrapper line — so user code line N always starts
// at internal line (N + 3). This offset is what lets us map a runtime error's
// internal line number back to the exact line the user actually wrote.
const WRAPPER_LINE_OFFSET = 3;

// Helper to extract the exact line number from an error
export function extractErrorLine(err: any, code: string): number | undefined {
  if (!err) return undefined;

  const totalLines = code.split('\n').length;

  // Direct line number property (Firefox / Safari / V8 extensions)
  if (typeof err.lineNumber === 'number' && err.lineNumber > 0) {
    const line = err.lineNumber - WRAPPER_LINE_OFFSET;
    if (line >= 1 && line <= totalLines) return line;
  }

  // Parse stack trace
  const stack = err?.stack;
  if (typeof stack === 'string') {
    // Pattern 1: <anonymous>:L:C in V8
    const anonMatches = [...stack.matchAll(/<anonymous>:(\d+):(\d+)/g)];
    for (const match of anonMatches) {
      const rawLine = parseInt(match[1], 10);
      const userLine = rawLine - WRAPPER_LINE_OFFSET;
      if (userLine >= 1 && userLine <= totalLines) {
        return userLine;
      }
    }

    // Pattern 2: eval / Function:L:C
    const fnMatches = [...stack.matchAll(/(?:eval|Function):(\d+):(\d+)/gi)];
    for (const match of fnMatches) {
      const rawLine = parseInt(match[1], 10);
      const userLine = rawLine - WRAPPER_LINE_OFFSET;
      if (userLine >= 1 && userLine <= totalLines) {
        return userLine;
      }
    }

    // Pattern 3: Line X or line X in error message/stack
    const lineMsgMatch = stack.match(/line\s+(\d+)/i) || (err?.message && err.message.match(/line\s+(\d+)/i));
    if (lineMsgMatch) {
      const parsedLine = parseInt(lineMsgMatch[1], 10);
      if (parsedLine >= 1 && parsedLine <= totalLines) {
        return parsedLine;
      }
    }
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

    // Helper to format timestamps
    const getTimestamp = () => {
      const now = new Date();
      return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    };

    // Safe id generator
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Custom console methods
    const customConsole = {
      log: (...args: any[]) => {
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

    // Save window console
    const originalConsole = window.console;

    try {
      // Allow top-level await by wrapping in an async function body
      // We pass customConsole as console
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
        })();`
      );

      // Execute
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

          // If function returned a non-undefined value, log it as result
          if (val !== undefined) {
            onLog({
              id: generateId(),
              type: 'result',
              content: val,
              timestamp: getTimestamp()
            });
          }

          resolve({
            success: true,
            executionTimeMs,
            returnValue: val
          });
        })
        .catch((err: any) => {
          const endTime = performance.now();
          const executionTimeMs = Number((endTime - startTime).toFixed(2));
          const errorMessage = err?.message || String(err);
          const stack = err?.stack;
          const errorLine = extractErrorLine(err, code);

          onLog({
            id: generateId(),
            type: 'error',
            content: errorMessage,
            stack,
            line: errorLine,
            timestamp: getTimestamp()
          });

          resolve({
            success: false,
            executionTimeMs,
            error: errorMessage
          });
        });
    } catch (err: any) {
      const endTime = performance.now();
      const executionTimeMs = Number((endTime - startTime).toFixed(2));
      const errorMessage = err?.message || String(err);
      const stack = err?.stack;
      const errorLine = extractErrorLine(err, code);

      onLog({
        id: generateId(),
        type: 'error',
        content: errorMessage,
        stack,
        line: errorLine,
        timestamp: getTimestamp()
      });

      resolve({
        success: false,
        executionTimeMs,
        error: errorMessage
      });
    }
  });
}

// Function to format JS objects into clean strings or inspectable structures
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