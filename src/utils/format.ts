/**
 * JSON.stringify that survives circular references, BigInt and throwing
 * getters. Used by the console copy/download actions — the previous code threw
 * on any circular object logged by the user.
 */
export function safeStringify(value: unknown, indent = 2): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') return `[Function: ${(value as Function).name || 'anonymous'}]`;
  if (typeof value !== 'object') return String(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;

  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(value, (_key, val) => {
      if (typeof val === 'bigint') return `${val}n`;
      if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
      if (val && typeof val === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    }, indent);
  } catch {
    try {
      return String(value);
    } catch {
      return '[Unserializable value]';
    }
  }
}

/** Plain-text representation of a single console entry. */
export function logContentToText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content === undefined || content === null) return String(content);
  if (typeof content !== 'object') return String(content);
  return safeStringify(content);
}
