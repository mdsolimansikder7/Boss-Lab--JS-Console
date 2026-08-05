import React from 'react';
import { 
  Play, 
  Trash2, 
  Code2, 
  Settings, 
  Share2, 
  Download, 
  Sparkles, 
  Palette, 
  Columns, 
  SquareCode, 
  Terminal, 
  Rows,
  BookOpen,
  Copy,
  Check,
  FlaskConical,
  Crown
} from 'lucide-react';
import { LayoutMode, Snippet, ThemeId } from '../types';
import { THEMES } from '../utils/theme';

interface HeaderProps {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (m: LayoutMode) => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  onRun: () => void;
  onClear: () => void;
  onOpenSnippetsModal: () => void;
  onOpenSettingsModal: () => void;
  onDownloadCode: () => void;
  onCopyShareLink: () => void;
  isCopiedShare: boolean;
  isRunning: boolean;
  mobileTab?: 'editor' | 'console';
  setMobileTab?: (tab: 'editor' | 'console') => void;
  logsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  setTheme,
  layoutMode,
  setLayoutMode,
  snippets,
  onSelectSnippet,
  onRun,
  onClear,
  onOpenSnippetsModal,
  onOpenSettingsModal,
  onDownloadCode,
  onCopyShareLink,
  isCopiedShare,
  isRunning,
  mobileTab,
  setMobileTab,
  logsCount = 0
}) => {
  const currentTheme = THEMES[theme];

  return (
    <header 
      className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 px-3 md:px-4 py-2 border-b select-none transition-colors duration-200"
      style={{
        backgroundColor: currentTheme.panelBg,
        borderColor: currentTheme.border,
        color: currentTheme.text
      }}
    >
      {/* Top Row on Mobile / Left Section on Desktop */}
      <div className="flex items-center justify-between gap-2 w-full md:w-auto">
        {/* Brand & Title */}
        <div className="flex items-center gap-2">
          <div 
            className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-xl font-mono font-bold text-sm shadow-md transition-all relative shrink-0"
            style={{
              backgroundColor: `${currentTheme.accent}20`,
              color: currentTheme.accent,
              border: `1.5px solid ${currentTheme.accent}55`
            }}
          >
            <FlaskConical className="w-4 h-4 md:w-5 md:h-5 text-current animate-pulse" />
            <Crown className="w-3 h-3 absolute -top-1.5 -right-1.5 text-amber-400 fill-amber-400 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight flex items-center">
                <span style={{ color: currentTheme.text }}>Boss</span>
                <span style={{ color: currentTheme.accent }}>Lab</span>
              </h1>
              <span 
                className="text-[9px] md:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded font-mono border"
                style={{
                  backgroundColor: `${currentTheme.accent}15`,
                  color: currentTheme.accent,
                  borderColor: `${currentTheme.accent}33`
                }}
              >
                JS Playground
              </span>
            </div>
          </div>
        </div>

        {/* Primary Run & Clear Buttons on Mobile Header Right */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 touch-manipulation"
            style={{
              backgroundColor: currentTheme.accent,
              color: theme === 'light' ? '#ffffff' : '#000000'
            }}
            title="Run JavaScript Code"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Run...' : 'Run'}</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 rounded-lg border text-xs flex items-center justify-center hover:bg-red-500/10 transition-all touch-manipulation"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              color: currentTheme.textMuted
            }}
            title="Clear Console Output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Controls: Snippets & Quick Run (Desktop) */}
      <div className="flex items-center gap-2 flex-1 max-w-xl justify-center w-full md:w-auto overflow-x-auto py-0.5 no-scrollbar">
        {/* Preset Snippets Dropdown */}
        <div className="relative flex-1 min-w-[130px] max-w-xs">
          <select
            aria-label="Load Example Snippet"
            onChange={(e) => {
              const selected = snippets.find(s => s.id === e.target.value);
              if (selected) onSelectSnippet(selected);
              e.target.value = '';
            }}
            defaultValue=""
            className="w-full text-xs py-1.5 pl-2.5 pr-7 rounded-md outline-none cursor-pointer border transition-all appearance-none truncate"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              color: currentTheme.text
            }}
          >
            <option value="" disabled>⚡ Examples...</option>
            {snippets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">
            ▼
          </div>
        </div>

        {/* Snippets Library Modal Button */}
        <button
          onClick={onOpenSnippetsModal}
          className="px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-1.5 hover:opacity-80 transition-all shrink-0 touch-manipulation"
          style={{
            backgroundColor: currentTheme.bg,
            borderColor: currentTheme.border,
            color: currentTheme.text
          }}
          title="Open Code Snippets Library"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs">Snippets</span>
        </button>

        {/* Primary Run Button (Desktop only) */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-md font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0"
          style={{
            backgroundColor: currentTheme.accent,
            color: theme === 'light' ? '#ffffff' : '#000000',
            boxShadow: `0 2px 10px ${currentTheme.accent}33`
          }}
          title="Run JavaScript Code (Ctrl + Enter)"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          <span className="hidden lg:inline text-[10px] opacity-75 font-mono ml-1 px-1 py-0.2 rounded bg-black/10">
            Ctrl+↵
          </span>
        </button>

        {/* Clear Button (Desktop only) */}
        <button
          onClick={onClear}
          className="hidden md:flex p-1.5 rounded-md border text-xs items-center gap-1 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all shrink-0"
          style={{
            backgroundColor: currentTheme.bg,
            borderColor: currentTheme.border,
            color: currentTheme.textMuted
          }}
          title="Clear Output Console"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="text-xs">Clear</span>
        </button>
      </div>

      {/* Right Controls: Theme, Layout, Settings, Share */}
      <div className="flex items-center justify-between md:justify-end gap-1.5 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-1.5 md:pt-0" style={{ borderColor: `${currentTheme.border}66` }}>
        {/* Mobile Tab Switcher Toggle */}
        {setMobileTab && (
          <div 
            className="flex md:hidden items-center p-0.5 rounded-lg border text-xs"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border
            }}
          >
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-3 py-1 rounded-md flex items-center gap-1 font-semibold transition-all ${
                mobileTab === 'editor'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <SquareCode className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMobileTab('console')}
              className={`px-3 py-1 rounded-md flex items-center gap-1 font-semibold transition-all ${
                mobileTab === 'console'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-400'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
              {logsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-400 text-black">
                  {logsCount}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Theme Selector */}
          <div className="relative">
            <select
              aria-label="Select Theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeId)}
              className="text-xs py-1.5 pl-6 pr-2 rounded-md outline-none cursor-pointer border appearance-none transition-all max-w-[100px] sm:max-w-none"
              style={{
                backgroundColor: currentTheme.bg,
                borderColor: currentTheme.border,
                color: currentTheme.text
              }}
            >
              {Object.values(THEMES).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <Palette className="w-3.5 h-3.5 absolute left-1.5 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />
          </div>

          {/* Desktop Layout Switcher */}
          <div 
            className="hidden lg:flex items-center p-0.5 rounded-md border"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border
            }}
          >
            <button
              onClick={() => setLayoutMode('split')}
              className={`p-1 rounded ${layoutMode === 'split' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
              title="Split Layout (50/50)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('editor-only')}
              className={`p-1 rounded ${layoutMode === 'editor-only' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
              title="Editor Focus"
            >
              <SquareCode className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('console-only')}
              className={`p-1 rounded ${layoutMode === 'console-only' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
              title="Console Focus"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('stacked')}
              className={`p-1 rounded ${layoutMode === 'stacked' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
              title="Stacked Layout"
            >
              <Rows className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Share Link */}
          <button
            onClick={onCopyShareLink}
            className="p-1.5 rounded-md border text-xs flex items-center gap-1 hover:opacity-80 transition-all touch-manipulation"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              color: currentTheme.text
            }}
            title="Share Snippet URL Link"
          >
            {isCopiedShare ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Download JS File */}
          <button
            onClick={onDownloadCode}
            className="p-1.5 rounded-md border text-xs flex items-center gap-1 hover:opacity-80 transition-all touch-manipulation"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              color: currentTheme.text
            }}
            title="Download script.js"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-md border text-xs flex items-center gap-1 hover:opacity-80 transition-all touch-manipulation"
            style={{
              backgroundColor: currentTheme.bg,
              borderColor: currentTheme.border,
              color: currentTheme.text
            }}
            title="Editor Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
