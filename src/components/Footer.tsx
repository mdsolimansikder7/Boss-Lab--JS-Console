import React, { useEffect, useState } from 'react';
import { LanguageId, ThemeConfig } from '../types';
import { LANGUAGES } from '../utils/languages';

interface FooterProps {
  status: string;
  cursorLine: number;
  theme: ThemeConfig;
  isRunning: boolean;
  charCount: number;
  lineCount: number;
  language: LanguageId;
  fileName: string;
}

export const Footer: React.FC<FooterProps> = ({
  status,
  cursorLine,
  theme,
  isRunning,
  charCount,
  lineCount,
  language,
  fileName,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour12: false }));
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const isError = /error|failed/i.test(status);

  return (
    <footer
      className="flex h-7 shrink-0 select-none items-center justify-between gap-3 border-t px-3 font-mono text-[11px]"
      style={{ backgroundColor: theme.panelBg, borderColor: theme.border, color: theme.textMuted }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          {isRunning && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
          )}
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: isRunning ? '#fbbf24' : isError ? '#f87171' : '#34d399' }}
          />
        </span>
        <span className="truncate font-semibold" style={{ color: theme.text }}>
          {status}
        </span>
      </div>

      <div className="hidden items-center gap-2.5 sm:flex">
        <span>{fileName}</span>
        <span style={{ color: theme.border }}>|</span>
        <span>Ln {cursorLine}</span>
        <span style={{ color: theme.border }}>|</span>
        <span>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount} chars
        </span>
        <span style={{ color: theme.border }}>|</span>
        <span>UTF-8 · {LANGUAGES[language].label}</span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden items-center gap-1 md:flex">
          <kbd className="ui-kbd">Ctrl ↵</kbd>
          <span>Run</span>
        </span>
        <span className="font-semibold" style={{ color: theme.accent }}>
          {time}
        </span>
      </div>
    </footer>
  );
};
