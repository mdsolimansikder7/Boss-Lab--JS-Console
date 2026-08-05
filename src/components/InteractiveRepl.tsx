import React, { useState } from 'react';
import { Terminal, Send } from 'lucide-react';
import { ThemeConfig } from '../types';

interface InteractiveReplProps {
  onEvaluate: (expr: string) => void;
  theme: ThemeConfig;
  fontSize: number;
}

export const InteractiveRepl: React.FC<InteractiveReplProps> = ({
  onEvaluate,
  theme,
  fontSize
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isLight = theme.id === 'light';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add to history
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Evaluate
    onEvaluate(trimmed);

    // Reset input
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-3 py-2 border-t select-none transition-colors duration-200"
      style={{
        backgroundColor: theme.panelBg,
        borderColor: theme.border,
        color: theme.text
      }}
    >
      <div className={`flex items-center gap-1.5 font-mono font-bold shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
        <Terminal className="w-3.5 h-3.5" />
        <span className="text-sm">&gt;</span>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a JavaScript expression and press Enter (e.g. 2 + 2, Math.PI, console.log('hi'))..."
        className={`flex-1 bg-transparent border-none outline-none font-mono text-xs ${
          isLight ? 'placeholder:text-slate-400' : 'placeholder:text-gray-500'
        }`}
        style={{
          color: theme.text,
          fontSize: `${fontSize}px`
        }}
      />

      <button
        type="submit"
        disabled={!input.trim()}
        className={`p-1 rounded transition-all disabled:opacity-30 ${
          isLight ? 'text-sky-600 hover:bg-sky-100' : 'text-sky-400 hover:bg-sky-500/20'
        }`}
        title="Execute REPL Expression"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
