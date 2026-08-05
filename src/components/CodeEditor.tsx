import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FileCode, Search, Wand2, Copy, Check, Upload, Hash } from 'lucide-react';
import { EditorSettings, ThemeConfig } from '../types';

interface CodeEditorProps {
  code: string;
  setCode: (c: string) => void;
  onRun: () => void;
  settings: EditorSettings;
  theme: ThemeConfig;
  cursorLine: number;
  setCursorLine: (line: number) => void;
}

export interface CodeEditorRef {
  focus: () => void;
  formatCode: () => void;
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
  code,
  setCode,
  onRun,
  settings,
  theme,
  cursorLine,
  setCursorLine
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Calculate lines
  const lines = code.split('\n');
  const lineCount = lines.length;

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    formatCode: () => {
      formatJSCode();
    }
  }));

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Sync cursor position and active line
  const updateCursorLine = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = code.substring(0, pos);
    const lineNumber = textBefore.split('\n').length;
    setCursorLine(lineNumber);
  };

  // Smart keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 1. Ctrl + Enter or Cmd + Enter -> Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }

    // 2. Tab Key -> Insert Spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabSpaces = ' '.repeat(settings.tabSize);

      if (start !== end) {
        // Multi-line indent/unindent
        const before = code.substring(0, start);
        const selected = code.substring(start, end);
        const after = code.substring(end);

        if (e.shiftKey) {
          // Unindent
          const unindented = selected.replace(new RegExp(`^${tabSpaces}`, 'gm'), '');
          setCode(before + unindented + after);
        } else {
          // Indent
          const indented = selected.replace(/^/gm, tabSpaces);
          setCode(before + indented + after);
        }
      } else {
        // Single cursor indent
        setCode(code.substring(0, start) + tabSpaces + code.substring(end));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + settings.tabSize;
        }, 0);
      }
      return;
    }

    // 3. Enter Key -> Auto Indent
    if (e.key === 'Enter') {
      const pos = textarea.selectionStart;
      const lineStart = code.lastIndexOf('\n', pos - 1) + 1;
      const currentLine = code.substring(lineStart, pos);
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : '';

      // Check if last char is opening brace/bracket
      const lastChar = currentLine.trim().slice(-1);
      const extraIndent = ['{', '[', '('].includes(lastChar) ? ' '.repeat(settings.tabSize) : '';

      e.preventDefault();
      const newIndent = '\n' + indent + extraIndent;
      const newCode = code.substring(0, pos) + newIndent + code.substring(pos);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + newIndent.length;
      }, 0);
      return;
    }

    // 4. Auto-close brackets/quotes
    if (settings.autoCloseBrackets) {
      const pairs: Record<string, string> = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'",
        '`': '`'
      };

      if (pairs[e.key]) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start === end) {
          e.preventDefault();
          const closeChar = pairs[e.key];
          const newCode = code.substring(0, start) + e.key + closeChar + code.substring(end);
          setCode(newCode);

          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          }, 0);
          return;
        }
      }
    }
  };

  // Basic JS Code Formatter (cleans indentation and spacing)
  const formatJSCode = () => {
    let indentLevel = 0;
    const tab = ' '.repeat(settings.tabSize);
    const lines = code.split('\n');

    const formattedLines = lines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';

      // Check closing bracket at start
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = tab.repeat(indentLevel);
      const result = indent + trimmed;

      // Count open/close brackets for next line
      const openBrackets = (trimmed.match(/[\{\[\(]/g) || []).length;
      const closeBrackets = (trimmed.match(/[\}\]\)]/g) || []).length;
      indentLevel += (openBrackets - closeBrackets);
      if (indentLevel < 0) indentLevel = 0;

      return result;
    });

    setCode(formattedLines.join('\n'));
  };

  // Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Drag & drop file loader
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCode(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  const isLight = theme.id === 'light';

  return (
    <div 
      className="flex flex-col h-full w-full overflow-hidden border-r transition-colors duration-200"
      style={{
        backgroundColor: theme.editorBg,
        borderColor: theme.border,
        color: theme.text
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Editor Top Bar */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 border-b text-xs font-mono select-none"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.border,
          color: theme.textMuted
        }}
      >
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${
            isLight ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-black/20 text-sky-400'
          }`}>
            <FileCode className="w-3.5 h-3.5" />
            <span>script.js</span>
          </div>
          <span className="text-[11px] opacity-75">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'}, {code.length} chars
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 rounded transition-colors ${
              isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
            } ${showSearch ? 'text-sky-500 font-bold' : ''}`}
            title="Search Code"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Format Code */}
          <button
            onClick={formatJSCode}
            className={`p-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
              isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
            }`}
            title="Format Code Spacing & Indents"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Format</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
              isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
            }`}
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div 
          className="flex items-center gap-2 px-3 py-1.5 border-b text-xs"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Find in code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 font-mono text-xs"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <span className="text-[10px] text-gray-400">
              {(code.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length} matches
            </span>
          )}
        </div>
      )}

      {/* Main Code Editing Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        {settings.lineNumbers && (
          <div
            ref={lineNumbersRef}
            className="py-3 px-2 text-right font-mono text-xs select-none overflow-hidden"
            style={{
              backgroundColor: theme.lineNumBg,
              color: theme.lineNumText,
              width: '42px',
              fontSize: `${settings.fontSize}px`,
              lineHeight: '1.5'
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => {
              const isActive = num === cursorLine;
              return (
                <div
                  key={num}
                  className={`transition-colors ${
                    isActive ? (isLight ? 'font-bold text-sky-600' : 'font-bold text-sky-400') : ''
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea Code Area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          onClick={updateCursorLine}
          onKeyUp={updateCursorLine}
          spellCheck={false}
          placeholder="// Type or paste JavaScript code here... (Ctrl + Enter to run)"
          className="flex-1 p-3 bg-transparent border-none outline-none font-mono resize-none leading-relaxed overflow-auto transition-all"
          style={{
            color: theme.text,
            fontSize: `${settings.fontSize}px`,
            whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
            lineHeight: '1.5',
            tabSize: settings.tabSize
          }}
        />
      </div>
    </div>
  );
});
