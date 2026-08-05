import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { LogEntry, LogType, ThemeConfig } from '../types';

interface ConsoleOutputProps {
  logs: LogEntry[];
  onClear: () => void;
  theme: ThemeConfig;
  executionTime?: number;
  fontSize: number;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  logs,
  onClear,
  theme,
  executionTime,
  fontSize
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  // Toggle JSON tree node expansion
  const toggleExpand = (id: string) => {
    setExpandedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter logs based on category and search text
  const filteredLogs = logs.filter(log => {
    if (log.type === 'clear') return false;
    
    // Category filter
    if (filterType !== 'all' && log.type !== filterType) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const searchLower = searchQuery.toLowerCase();
      const contentStr = typeof log.content === 'object' 
        ? JSON.stringify(log.content).toLowerCase() 
        : String(log.content).toLowerCase();
      return contentStr.includes(searchLower);
    }

    return true;
  });

  // Copy full log content as plain text
  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${
      typeof l.content === 'object' ? JSON.stringify(l.content, null, 2) : String(l.content)
    }`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Download log output
  const handleDownloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${
      typeof l.content === 'object' ? JSON.stringify(l.content, null, 2) : String(l.content)
    }`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `js-console-output-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLight = theme.id === 'light';

  // Render individual Object/Array node inspectably
  const renderObjectTree = (data: any, path: string = 'root', depth: number = 0) => {
    if (data === null) return <span className={isLight ? "text-slate-500 italic" : "text-gray-400 italic"}>null</span>;
    if (data === undefined) return <span className={isLight ? "text-slate-500 italic" : "text-gray-400 italic"}>undefined</span>;
    if (typeof data === 'boolean') return <span className={isLight ? "text-purple-700 font-bold" : "text-purple-400 font-bold"}>{String(data)}</span>;
    if (typeof data === 'number') return <span className={isLight ? "text-amber-700 font-bold" : "text-amber-400 font-bold"}>{data}</span>;
    if (typeof data === 'string') return <span className={isLight ? "text-emerald-700 font-semibold" : "text-emerald-400 font-semibold"}>"{data}"</span>;
    if (typeof data === 'function') return <span className={isLight ? "text-sky-700 italic font-medium" : "text-sky-300 italic"}>[Function: {data.name || 'anonymous'}]</span>;

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isExpanded = expandedKeys[path];

    if (keys.length === 0) {
      return <span className={isLight ? "text-slate-500" : "text-gray-400"}>{isArray ? '[]' : '{}'}</span>;
    }

    return (
      <div className="inline-block font-mono text-xs">
        <button
          onClick={() => toggleExpand(path)}
          className={`inline-flex items-center gap-1 px-1 py-0.5 rounded transition-colors ${
            isLight ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-white/10 text-gray-300'
          }`}
        >
          {isExpanded ? <ChevronDown className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} /> : <ChevronRight className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />}
          <span className={`font-semibold ${isLight ? 'text-sky-700' : 'text-sky-300'}`}>
            {isArray ? `Array(${keys.length})` : `Object`}
          </span>
          {!isExpanded && (
            <span className={`text-[11px] truncate max-w-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              {isArray ? `[ ${keys.slice(0, 3).map(k => JSON.stringify(data[k])).join(', ')}${keys.length > 3 ? '...' : ''} ]`
                       : `{ ${keys.slice(0, 3).map(k => `${k}: ${JSON.stringify(data[k])}`).join(', ')}${keys.length > 3 ? '...' : ''} }`}
            </span>
          )}
        </button>

        {isExpanded && (
          <div className={`pl-4 border-l my-1 space-y-0.5 ${isLight ? 'border-slate-300' : 'border-white/10'}`}>
            {keys.map((key) => (
              <div key={key} className="flex items-start gap-1">
                <span className={`font-mono font-medium ${isLight ? 'text-purple-800' : 'text-purple-300'}`}>{key}:</span>
                {renderObjectTree(data[key], `${path}.${key}`, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Table format
  const renderTableData = (data: any) => {
    if (!data || typeof data !== 'object') {
      return <div>{String(data)}</div>;
    }

    let rows: any[] = [];
    let columns: string[] = [];

    if (Array.isArray(data)) {
      rows = data;
      if (rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null) {
        columns = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
      } else {
        columns = ['Value'];
        rows = data.map(v => ({ Value: v }));
      }
    } else {
      rows = Object.entries(data).map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return { '(index)': k, ...v };
        }
        return { '(index)': k, Value: v };
      });
      columns = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    }

    return (
      <div className={`overflow-x-auto my-1 border rounded-md ${isLight ? 'border-slate-300 bg-white' : 'border-white/10 bg-black/10'}`}>
        <table className={`min-w-full text-xs font-mono text-left divide-y ${isLight ? 'divide-slate-200' : 'divide-white/10'}`}>
          <thead className={isLight ? 'bg-slate-100' : 'bg-black/30'}>
            <tr>
              <th className={`px-2 py-1 border-r font-medium ${isLight ? 'text-slate-600 border-slate-200' : 'text-gray-400 border-white/10'}`}>#</th>
              {columns.map(col => (
                <th key={col} className={`px-2 py-1 border-r font-semibold ${isLight ? 'text-sky-800 border-slate-200' : 'text-sky-300 border-white/10'}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isLight ? 'divide-slate-200 bg-white' : 'divide-white/5 bg-black/10'}`}>
            {rows.map((row, idx) => (
              <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                <td className={`px-2 py-1 border-r ${isLight ? 'text-slate-500 border-slate-200' : 'text-gray-500 border-white/10'}`}>{idx}</td>
                {columns.map(col => (
                  <td key={col} className={`px-2 py-1 border-r ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                    {renderObjectTree(row[col], `table-${idx}-${col}`)}
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
      className="flex flex-col h-full w-full overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: theme.consoleBg,
        color: theme.text
      }}
    >
      {/* Console Top Header */}
      <div 
        className="flex flex-wrap items-center justify-between px-3 py-1.5 border-b text-xs font-mono select-none gap-2"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.border,
          color: theme.textMuted
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-xs tracking-wide">Output Console</span>

          {/* Execution Time Badge */}
          {executionTime !== undefined && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-3 h-3" />
              {executionTime} ms
            </span>
          )}
        </div>

        {/* Console Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Search Logs */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-24 sm:w-32 py-0.5 pl-6 pr-2 rounded text-[11px] outline-none border focus:border-sky-400 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-black/20 border-white/10 text-white'
              }`}
            />
            <Search className={`w-3 h-3 absolute left-1.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
          </div>

          {/* Type Filter Buttons */}
          <div className={`hidden sm:flex items-center rounded p-0.5 border text-[10px] ${
            isLight ? 'bg-slate-100 border-slate-300' : 'bg-black/20 border-white/10'
          }`}>
            {['all', 'log', 'warn', 'error', 'table'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-1.5 py-0.5 rounded capitalize transition-all ${
                  filterType === t 
                    ? (isLight ? 'bg-sky-600 text-white font-bold' : 'bg-sky-500/30 text-sky-300 font-bold') 
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200')
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-gray-300'}`}
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-gray-300'}`}
            title="Download Logs File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Console */}
          <button
            onClick={onClear}
            className={`p-1 rounded transition-colors ${isLight ? 'hover:bg-red-100 text-slate-500 hover:text-red-600' : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'}`}
            title="Clear Console Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Console Output List */}
      <div 
        className="flex-1 p-3 overflow-y-auto font-mono space-y-1.5"
        style={{ fontSize: `${fontSize}px` }}
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12 select-none">
            <Terminal className={`w-12 h-12 mb-2 stroke-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
            <p className="text-sm font-semibold">Console Output is Empty</p>
            <p className="text-xs max-w-xs mt-1">
              Run your JavaScript code or type quick commands in the REPL below.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            // Determine styling per log type
            let icon = null;
            let bgClass = isLight ? 'border-b border-slate-200 py-1 text-slate-900' : 'border-b border-white/5 py-1 text-slate-100';

            if (log.type === 'warn') {
              icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
              bgClass += isLight 
                ? ' bg-amber-50 border-amber-200 px-2 rounded text-amber-950' 
                : ' bg-amber-500/10 border-amber-500/20 px-2 rounded text-amber-200';
            } else if (log.type === 'error') {
              icon = <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
              bgClass += isLight 
                ? ' bg-red-50 border-red-200 px-2 rounded text-red-950 font-medium' 
                : ' bg-red-500/10 border-red-500/20 px-2 rounded text-red-200';
            } else if (log.type === 'info') {
              icon = <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />;
              bgClass += isLight 
                ? ' bg-sky-50 border-sky-200 px-2 rounded text-sky-950' 
                : ' bg-sky-500/10 border-sky-500/20 px-2 rounded text-sky-200';
            } else if (log.type === 'table') {
              icon = <TableIcon className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />;
              bgClass += isLight 
                ? ' bg-purple-50 border-purple-200 px-2 rounded' 
                : ' bg-purple-500/5 border-purple-500/20 px-2 rounded';
            } else if (log.type === 'result') {
              icon = <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
              bgClass += isLight 
                ? ' bg-emerald-50 border-emerald-200 px-2 rounded text-emerald-950 font-semibold' 
                : ' bg-emerald-500/10 border-emerald-500/20 px-2 rounded font-semibold';
            }

            return (
              <div key={log.id} className={`${bgClass} flex items-start gap-2 group transition-all`}>
                {/* Type Icon */}
                {icon}

                {/* Error Line Badge */}
                {log.type === 'error' && log.line && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 select-none flex items-center gap-1 ${
                    isLight 
                      ? 'bg-red-100 text-red-800 border-red-300' 
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    Line {log.line}
                  </span>
                )}

                {/* Prompt symbol for normal log */}
                {!icon && (
                  <span className={`font-bold shrink-0 select-none ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>&gt;</span>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-x-auto leading-relaxed">
                  {log.type === 'table' ? (
                    renderTableData(log.content)
                  ) : typeof log.content === 'object' && log.content !== null ? (
                    renderObjectTree(log.content, log.id)
                  ) : (
                    <span>{String(log.content)}</span>
                  )}

                  {/* Optional Error Stack Trace */}
                  {log.stack && (
                    <details className="mt-1">
                      <summary className={`text-[10px] cursor-pointer hover:underline select-none ${isLight ? 'text-red-700 font-medium' : 'text-red-400/80'}`}>
                        View Stack Trace
                      </summary>
                      <pre className={`text-[10px] p-2 rounded mt-1 overflow-x-auto font-mono whitespace-pre-wrap ${
                        isLight ? 'bg-red-100/70 text-red-950 border border-red-200' : 'bg-black/40 text-red-300/80'
                      }`}>
                        {log.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
