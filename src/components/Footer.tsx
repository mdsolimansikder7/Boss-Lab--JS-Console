import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface FooterProps {
  status: string;
  cursorLine: number;
  theme: ThemeConfig;
  isRunning: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  status,
  cursorLine,
  theme,
  isRunning
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer 
      className="flex items-center justify-between px-4 py-1.5 border-t text-[11px] font-mono select-none transition-colors duration-200"
      style={{
        backgroundColor: theme.panelBg,
        borderColor: theme.border,
        color: theme.textMuted
      }}
    >
      {/* Left: Status */}
      <div className="flex items-center gap-2">
        <span 
          className={`w-2 h-2 rounded-full ${
            isRunning 
              ? 'bg-amber-400 animate-ping' 
              : status.includes('Error') || status.includes('Failed')
              ? 'bg-red-400'
              : 'bg-emerald-400'
          }`} 
        />
        <span className="font-semibold text-gray-300">{status}</span>
      </div>

      {/* Center: Cursor Line */}
      <div className="hidden sm:flex items-center gap-3 text-gray-400">
        <span>Line {cursorLine}</span>
        <span>•</span>
        <span>UTF-8</span>
        <span>•</span>
        <span>JavaScript (ES6+)</span>
      </div>

      {/* Right: Clock & Shortcut */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline opacity-75">Ctrl + Enter to Run</span>
        <span className="text-sky-400 font-semibold">{time}</span>
      </div>
    </footer>
  );
};
