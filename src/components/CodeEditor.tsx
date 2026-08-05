import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as MonacoTypes from 'monaco-editor';
import { FileCode, Search, Wand2, Copy, Check } from 'lucide-react';
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
  // Holds the live Monaco editor instance (replaces the old textareaRef)
  const editorInstanceRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const lines = code.split('\n');
  const lineCount = lines.length;

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorInstanceRef.current?.focus();
    },
    formatCode: () => {
      formatJSCode();
    }
  }));

  // Basic JS Code Formatter — unchanged from before, still works on the code string
  const formatJSCode = () => {
    let indentLevel = 0;
    const tab = ' '.repeat(settings.tabSize);
    const codeLines = code.split('\n');

    const formattedLines = codeLines.map(line => {
      let trimmed = line.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = tab.repeat(indentLevel);
      const result = indent + trimmed;

      const openBrackets = (trimmed.match(/[\{\[\(]/g) || []).length;
      const closeBrackets = (trimmed.match(/[\}\]\)]/g) || []).length;
      indentLevel += (openBrackets - closeBrackets);
      if (indentLevel < 0) indentLevel = 0;

      return result;
    });

    setCode(formattedLines.join('\n'));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Drag & drop file loader — unchanged
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

  // Runs once when Monaco finishes mounting.
  // This is where we wire up Ctrl+Enter to run, and cursor-line tracking —
  // both of which the old textarea did manually, Monaco gives us hooks for instead.
  const handleEditorMount: OnMount = (editorInstance, monaco) => {
    editorInstanceRef.current = editorInstance;

    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    editorInstance.onDidChangeCursorPosition((e) => {
      setCursorLine(e.position.lineNumber);
    });
  };

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
      {/* Editor Top Bar — unchanged */}
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

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 rounded transition-colors ${
              isLight ? 'hover:bg-slate-200' : 'hover:bg-white/10'
            } ${showSearch ? 'text-sky-500 font-bold' : ''}`}
            title="Search Code (Ctrl+F also works inside the editor)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

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

      {/* Optional Search Bar — unchanged */}
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

      {/* Main Code Editing Canvas — now Monaco instead of a plain textarea */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          onMount={handleEditorMount}
          theme={isLight ? 'light' : 'vs-dark'}
          options={{
            fontSize: settings.fontSize,
            tabSize: settings.tabSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            renderLineHighlight: settings.showLineHighlight ? 'line' : 'none',
            autoClosingBrackets: settings.autoCloseBrackets ? 'always' : 'never',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
});
