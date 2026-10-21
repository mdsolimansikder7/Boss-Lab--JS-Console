import React, { useState } from 'react';
import { ChevronRight, CornerDownLeft } from 'lucide-react';
import { ThemeConfig } from '../types';

interface InteractiveReplProps {
  onEvaluate: (expr: string) => void;
  theme: ThemeConfig;
  fontSize: number;
}

export const InteractiveRepl: React.FC<InteractiveReplProps> = ({
  onEvaluate,
  theme,
  fontSize,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);
    onEvaluate(trimmed);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t px-3 py-2"
      style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}
    >
      <div
        className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all"
        style={{
          backgroundColor: theme.bg,
          borderColor: focused ? theme.accent : theme.border,
          boxShadow: focused ? `0 0 0 3px ${theme.accent}22` : 'none',
        }}
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="REPL expression"
          placeholder="Evaluate an expression… e.g. 2 + 2, Math.PI, console.log('hi')"
          className="min-w-0 flex-1 border-none bg-transparent font-mono outline-none"
          style={{ color: theme.text, fontSize: `${fontSize}px` }}
        />

        <span
          className="hidden shrink-0 text-[10px] sm:inline"
          style={{ color: theme.textMuted }}
        >
          ↑↓ history
        </span>

        <button
          type="submit"
          disabled={!input.trim()}
          className="ui-btn ui-btn--primary h-7 shrink-0 gap-1 px-2 text-[11px]"
          title="Evaluate expression"
        >
          <CornerDownLeft className="h-3 w-3" />
          <span className="hidden sm:inline">Run</span>
        </button>
      </div>
    </form>
  );
};
