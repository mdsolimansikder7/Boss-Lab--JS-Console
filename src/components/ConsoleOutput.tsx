import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Terminal,
  Trash2,
  Search,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  XCircle,
  Info,
  Table as TableIcon,
  Download,
  Clock,
  Sparkles,
  ArrowDown,
  X,
} from 'lucide-react';
import { LanguageId, LogEntry, ThemeConfig } from '../types';
import { withAlpha } from '../utils/theme';
import { copyText } from '../utils/clipboard';
import { logContentToText, safeStringify } from '../utils/format';
import { LANGUAGES } from '../utils/languages';

interface ConsoleOutputProps {
  logs: LogEntry[];
  onClear: () => void;
  theme: ThemeConfig;
  executionTime?: number;
  fontSize: number;
  language: LanguageId;
}

type FilterType = 'all' | 'log' | 'warn' | 'error' | 'table';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'log', label: 'Logs' },
  { id: 'warn', label: 'Warn' },
  { id: 'error', label: 'Errors' },
  { id: 'table', label: 'Tables' },
];

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  logs,
  onClear,
  theme,
  executionTime,
  fontSize,
  language,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [showJump, setShowJump] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const copiedTimer = useRef<number | undefined>(undefined);
  const rowCopiedTimer = useRef<number | undefined>(undefined);

  const isLight = theme.id === 'light';

  useEffect(() => {
    return () => {
      window.clearTimeout(copiedTimer.current);
      window.clearTimeout(rowCopiedTimer.current);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const counts = useMemo(() => {
    const next = { all: 0, log: 0, warn: 0, error: 0, table: 0 };
    for (const log of logs) {
      if (log.type === 'clear') continue;
      next.all += 1;
      if (log.type === 'log' || log.type === 'info' || log.type === 'result') next.log += 1;
      if (log.type === 'warn') next.warn += 1;
      if (log.type === 'error') next.error += 1;
      if (log.type === 'table') next.table += 1;
    }
    return next;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return logs.filter((log) => {
      if (log.type === 'clear') return false;

      if (filterType !== 'all') {
        const isLogLike = log.type === 'log' || log.type === 'info' || log.type === 'result';
        if (filterType === 'log' ? !isLogLike : log.type !== filterType) return false;
      }

      if (!query) return true;

      const contentStr = logContentToText(log.content).toLowerCase();
      return contentStr.includes(query);
    });
  }, [logs, filterType, searchQuery]);

  // Auto-scroll to the newest entry while the user is already at the bottom.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
      setShowJump(false);
    } else {
      setShowJump(true);
    }
  }, [filteredLogs.length, logs.length]);

  useEffect(() => {
    if (logs.length === 0) {
      stickToBottom.current = true;
      setShowJump(false);
      setExpandedKeys({});
    }
  }, [logs.length]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    stickToBottom.current = atBottom;
    setShowJump(!atBottom && el.scrollHeight > el.clientHeight + 24);
  };

  const scrollToLatest = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottom.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setShowJump(false);
  };

  const logsAsText = () =>
    logs
      .filter((log) => log.type !== 'clear')
      .map((log) => `[${log.timestamp}] [${log.type.toUpperCase()}] ${logContentToText(log.content)}`)
      .join('\n');

  const handleCopyLogs = async () => {
    const ok = await copyText(logsAsText());
    if (!ok) return;
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const handleCopyOne = async (log: LogEntry) => {
    const ok = await copyText(logContentToText(log.content));
    if (!ok) return;
    setCopiedId(log.id);
    window.clearTimeout(rowCopiedTimer.current);
    rowCopiedTimer.current = window.setTimeout(() => setCopiedId(null), 1400);
  };

  const handleDownloadLogs = () => {
    const text = logsAsText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bosslab-console-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render individual Object/Array node inspectably.
  const renderObjectTree = (
    data: any,
    path: string = 'root',
    depth: number = 0,
    ancestors: object[] = []
  ): React.ReactNode => {
    if (data === null) return <span style={{ color: theme.textMuted }} className="italic">null</span>;
    if (data === undefined) return <span style={{ color: theme.textMuted }} className="italic">undefined</span>;
    if (typeof data === 'boolean')
      return <span className={isLight ? 'font-semibold text-purple-700' : 'font-semibold text-purple-400'}>{String(data)}</span>;
    if (typeof data === 'number')
      return <span className={isLight ? 'font-semibold text-amber-700' : 'font-semibold text-amber-400'}>{data}</span>;
    if (typeof data === 'bigint')
      return <span className={isLight ? 'font-semibold text-amber-700' : 'font-semibold text-amber-400'}>{String(data)}n</span>;
    if (typeof data === 'string')
      return <span className={isLight ? 'font-medium text-emerald-700' : 'font-medium text-emerald-400'}>&quot;{data}&quot;</span>;
    if (typeof data === 'function')
      return (
        <span className={isLight ? 'italic text-sky-700' : 'italic text-sky-300'}>
          ƒ {data.name || 'anonymous'}()
        </span>
      );
    if (typeof data === 'symbol') return <span className="italic" style={{ color: theme.textMuted }}>{String(data)}</span>;

    if (data instanceof Date) {
      return <span className={isLight ? 'text-sky-700' : 'text-sky-300'}>{data.toISOString()}</span>;
    }
    if (data instanceof RegExp) {
      return <span className={isLight ? 'text-rose-700' : 'text-rose-300'}>{String(data)}</span>;
    }
    if (data instanceof Error) {
      return (
        <span className={isLight ? 'font-medium text-red-700' : 'font-medium text-red-300'}>
          {data.name}: {data.message}
        </span>
      );
    }

    if (ancestors.includes(data)) {
      return <span className="italic" style={{ color: theme.textMuted }}>[Circular]</span>;
    }

    if (depth > 8) {
      return <span className="italic" style={{ color: theme.textMuted }}>…</span>;
    }

    const isArray = Array.isArray(data);
    const isMap = data instanceof Map;
    const isSet = data instanceof Set;

    let keys: string[] = [];
    try {
      keys = isMap
        ? Array.from(data.keys()).map((key: unknown) => String(key))
        : isSet
          ? Array.from(data as Set<unknown>).map((value) => String(value))
          : Object.keys(data);
    } catch {
      return <span className="italic" style={{ color: theme.textMuted }}>[Unreadable object]</span>;
    }

    const isExpanded = expandedKeys[path];
    const nextAncestors = [...ancestors, data];

    if (keys.length === 0) {
      return (
        <span style={{ color: theme.textMuted }}>
          {isArray ? '[]' : isMap ? 'Map(0)' : isSet ? 'Set(0)' : '{}'}
        </span>
      );
    }

    const label = isArray
      ? `Array(${keys.length})`
      : isMap
        ? `Map(${keys.length})`
        : isSet
          ? `Set(${keys.length})`
          : 'Object';

    const previewEntries = isSet
      ? Array.from(data as Set<unknown>).slice(0, 3)
      : isMap
        ? Array.from((data as Map<unknown, unknown>).values()).slice(0, 3)
        : keys.slice(0, 3).map((key) => data[key]);

    return (
      <div className="inline-block font-mono text-xs">
        <button
          type="button"
          onClick={() => toggleExpand(path)}
          className="inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:bg-[var(--hover)]"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" style={{ color: theme.accent }} />
          ) : (
            <ChevronRight className="h-3 w-3" style={{ color: theme.accent }} />
          )}
          <span className="font-semibold" style={{ color: theme.accent }}>
            {label}
          </span>
          {!isExpanded && (
            <span className="max-w-[16rem] truncate text-[11px]" style={{ color: theme.textMuted }}>
              {isArray || isSet ? '[ ' : '{ '}
              {previewEntries.map((value, index) => (
                <span key={index}>
                  {index > 0 ? ', ' : ''}
                  {safeStringify(value, 0).slice(0, 40)}
                </span>
              ))}
              {keys.length > 3 ? '…' : ''}
              {isArray || isSet ? ' ]' : ' }'}
            </span>
          )}
        </button>

        {isExpanded && (
          <div
            className="my-1 space-y-0.5 border-l pl-4"
            style={{ borderColor: withAlpha(theme.accent, 0.25) }}
          >
            {(isMap
              ? Array.from((data as Map<unknown, unknown>).entries()).map(([key, value], index) => ({
                  key: `${String(key)}#${index}`,
                  value,
                }))
              : isSet
                ? Array.from(data as Set<unknown>).map((value, index) => ({
                    key: String(index),
                    value,
                  }))
                : keys.map((key) => ({ key, value: data[key] }))
            ).map(({ key, value }) => (
              <div key={key} className="flex items-start gap-1">
                <span className={isLight ? 'font-medium text-purple-800' : 'font-medium text-purple-300'}>
                  {key}:
                </span>
                {renderObjectTree(value, `${path}.${key}`, depth + 1, nextAncestors)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTableData = (data: any) => {
    if (!data || typeof data !== 'object') {
      return <div>{String(data)}</div>;
    }

    let rows: any[] = [];
    let columns: string[] = [];

    try {
      if (Array.isArray(data)) {
        rows = data;
        if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
          columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
        } else {
          columns = ['Value'];
          rows = data.map((value) => ({ Value: value }));
        }
      } else {
        rows = Object.entries(data).map(([key, value]) => {
          if (value && typeof value === 'object') {
            return { '(index)': key, ...value };
          }
          return { '(index)': key, Value: value };
        });
        columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
      }
    } catch {
      return <div className="italic" style={{ color: theme.textMuted }}>[Unreadable table]</div>;
    }

    return (
      <div
        className="my-1 overflow-x-auto rounded-md border"
        style={{ borderColor: theme.border, backgroundColor: withAlpha(theme.bg, 0.5) }}
      >
        <table className="min-w-full divide-y text-left text-xs font-mono" style={{ borderColor: theme.border }}>
          <thead>
            <tr>
              <th
                className="border-r px-2 py-1 font-medium"
                style={{ borderColor: theme.border, color: theme.textMuted }}
              >
                #
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className="border-r px-2 py-1 font-semibold"
                  style={{ borderColor: theme.border, color: theme.accent }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="transition-colors hover:bg-[var(--hover)]">
                <td
                  className="border-r px-2 py-1"
                  style={{ borderColor: theme.border, color: theme.textMuted }}
                >
                  {index}
                </td>
                {columns.map((column) => (
                  <td key={column} className="border-r px-2 py-1" style={{ borderColor: theme.border }}>
                    {renderObjectTree(row?.[column], `table-${index}-${column}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: theme.consoleBg, color: theme.text }}
    >
      {/* Console toolbar */}
      <div
        className="flex shrink-0 select-none items-center gap-2 border-b px-3 py-1.5 font-mono text-xs"
        style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
          <span className="text-[11px] font-semibold tracking-wide">Console</span>
          {counts.all > 0 && (
            <span
              className="rounded-full px-1.5 py-px text-[10px] font-semibold"
              style={{ backgroundColor: 'var(--accent-soft)', color: theme.accent }}
            >
              {counts.all}
            </span>
          )}
          {executionTime !== undefined && (
            <span
              className="hidden items-center gap-1 rounded-full px-1.5 py-px text-[10px] lg:flex"
              style={{ backgroundColor: 'rgba(52, 211, 153, 0.12)', color: '#34d399' }}
            >
              <Clock className="h-2.5 w-2.5" />
              {executionTime} ms
            </span>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2"
              style={{ color: theme.textMuted }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search…"
              aria-label="Filter console output"
              className="ui-input h-7 w-24 pr-6 pl-7 text-[11px] lg:w-36"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-[var(--hover)]"
                aria-label="Clear filter text"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleCopyLogs()}
            className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
            title="Copy all output"
            aria-label="Copy all output"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadLogs}
            className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
            title="Download output as .txt"
            aria-label="Download output"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onClear}
            className="ui-btn ui-btn--ghost ui-btn--icon ui-btn--danger h-7 w-7"
            title="Clear console"
            aria-label="Clear console"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter row */}
      <div
        className="no-scrollbar flex shrink-0 select-none items-center gap-2 overflow-x-auto border-b px-3 py-1"
        style={{ borderColor: withAlpha(theme.border, 0.7) }}
      >
        <div className="ui-segment shrink-0" role="group" aria-label="Filter console output">
          {FILTERS.map((filter) => {
            const count = counts[filter.id];
            if (filter.id !== 'all' && count === 0) return null;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setFilterType(filter.id)}
                data-active={filterType === filter.id}
                aria-pressed={filterType === filter.id}
              >
                {filter.label}
                {count > 0 && <span className="opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>

        <span className="ml-auto hidden shrink-0 text-[10px] lg:inline" style={{ color: theme.textMuted }}>
          {filteredLogs.length === counts.all
            ? `${counts.all} ${counts.all === 1 ? 'entry' : 'entries'}`
            : `${filteredLogs.length} of ${counts.all} entries`}
        </span>
      </div>

      {/* Output list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 select-text overflow-y-auto py-1 font-mono"
        style={{ fontSize: `${fontSize}px` }}
        role="log"
        aria-live="polite"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center select-none">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl"
              style={{ backgroundColor: 'var(--accent-soft)', color: theme.accent }}
            >
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                {logs.length === 0 ? 'Nothing logged yet' : 'No matching output'}
              </p>
              <p className="mt-1 max-w-[17rem] text-xs leading-relaxed" style={{ color: theme.textMuted }}>
                {logs.length === 0
                  ? language === 'javascript'
                    ? 'Run your code with Ctrl + Enter, or type a quick expression in the REPL below.'
                    : `Press Run (Ctrl + Enter) to compile and execute your ${LANGUAGES[language].label} code in the sandbox.`
                  : 'Try clearing the search or choosing a different filter.'}
              </p>
            </div>
            {logs.length === 0 && language === 'javascript' && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {['console.log("hi")', 'console.table(data)', 'console.time()'].map((hint) => (
                  <code
                    key={hint}
                    className="rounded-md border px-2 py-1 text-[10px]"
                    style={{
                      borderColor: theme.border,
                      color: theme.textMuted,
                      backgroundColor: withAlpha(theme.bg, 0.6),
                    }}
                  >
                    {hint}
                  </code>
                ))}
              </div>
            )}
          </div>
        ) : (
          filteredLogs.map((log) => {
            let icon: React.ReactNode = null;
            let background = 'transparent';
            let contentColor = theme.text;

            if (log.type === 'warn') {
              icon = <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#f59e0b' }} />;
              background = 'rgba(245, 158, 11, 0.08)';
              contentColor = isLight ? '#92400e' : '#fcd34d';
            } else if (log.type === 'error') {
              icon = <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#f87171' }} />;
              background = 'rgba(248, 113, 113, 0.08)';
              contentColor = isLight ? '#991b1b' : '#fca5a5';
            } else if (log.type === 'info') {
              icon = <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />;
            } else if (log.type === 'table') {
              icon = <TableIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#a78bfa' }} />;
            } else if (log.type === 'result') {
              icon = <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#34d399' }} />;
              contentColor = isLight ? '#065f46' : '#6ee7b7';
            }

            return (
              <div
                key={log.id}
                className="log-row group flex items-start gap-2 border-b px-3 py-1.5"
                style={{
                  background,
                  borderColor: withAlpha(theme.border, 0.55),
                }}
              >
                {icon ?? (
                  <span className="mt-0.5 shrink-0 select-none font-bold" style={{ color: theme.accent }}>
                    ›
                  </span>
                )}

                {log.type === 'error' && log.line !== undefined && (
                  <span
                    className="mt-0.5 shrink-0 rounded border px-1.5 py-px text-[10px] font-bold"
                    style={{
                      borderColor: 'rgba(248, 113, 113, 0.4)',
                      backgroundColor: 'rgba(248, 113, 113, 0.12)',
                      color: isLight ? '#991b1b' : '#fca5a5',
                    }}
                  >
                    Line {log.line}
                  </span>
                )}

                <div className="min-w-0 flex-1 overflow-x-auto leading-relaxed" style={{ color: contentColor }}>
                  {log.type === 'table' ? (
                    renderTableData(log.content)
                  ) : log.content !== null && typeof log.content === 'object' ? (
                    renderObjectTree(log.content, log.id)
                  ) : (
                    <span className="whitespace-pre-wrap">{String(log.content)}</span>
                  )}

                  {log.stack && (
                    <details className="mt-1">
                      <summary
                        className="cursor-pointer select-none text-[10px] hover:underline"
                        style={{ color: isLight ? '#b91c1c' : 'rgba(252, 165, 165, 0.85)' }}
                      >
                        View stack trace
                      </summary>
                      <pre
                        className="mt-1 overflow-x-auto whitespace-pre-wrap rounded p-2 text-[10px]"
                        style={{
                          backgroundColor: withAlpha(theme.bg, 0.65),
                          color: isLight ? '#7f1d1d' : 'rgba(252, 165, 165, 0.85)',
                        }}
                      >
                        {log.stack}
                      </pre>
                    </details>
                  )}
                </div>

                <div className="mt-0.5 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                  <span className="hidden text-[10px] sm:inline" style={{ color: theme.textMuted }}>
                    {log.timestamp}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleCopyOne(log)}
                    className="rounded p-1 hover:bg-[var(--hover)]"
                    title="Copy this entry"
                    aria-label="Copy this entry"
                  >
                    {copiedId === log.id ? (
                      <Check className="h-3 w-3" style={{ color: '#34d399' }} />
                    ) : (
                      <Copy className="h-3 w-3" style={{ color: theme.textMuted }} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Jump to latest */}
      {showJump && filteredLogs.length > 0 && (
        <button
          type="button"
          onClick={scrollToLatest}
          className="ui-btn absolute bottom-3 right-4 z-10 h-7 rounded-full px-2.5 text-[11px] shadow-lg"
          style={{ backgroundColor: theme.panelBg }}
        >
          <ArrowDown className="h-3 w-3" />
          Latest
        </button>
      )}
    </div>
  );
};
