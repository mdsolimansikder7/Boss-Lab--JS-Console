import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Loader2,
  Settings as SettingsIcon,
  Share2,
  Download,
  BookOpen,
  Columns2,
  SquareCode,
  Terminal,
  Rows3,
  Sun,
  Moon,
  ChevronDown,
  Search,
  Check,
  FlaskConical,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LayoutMode, LanguageId, Snippet, ThemeId } from '../types';
import { isLightTheme, THEMES, withAlpha } from '../utils/theme';
import { LANGUAGE_ORDER, LANGUAGES } from '../utils/languages';

interface HeaderProps {
  theme: ThemeId;
  onToggleAppearance: () => void;
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
  fileName: string;
  layoutMode: LayoutMode;
  setLayoutMode: (m: LayoutMode) => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  onRun: () => void;
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

const LAYOUTS: { id: LayoutMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'split', label: 'Split view', icon: Columns2 },
  { id: 'editor-only', label: 'Editor focus', icon: SquareCode },
  { id: 'console-only', label: 'Console focus', icon: Terminal },
  { id: 'stacked', label: 'Stacked view', icon: Rows3 },
];

const ExamplesMenu: React.FC<{
  snippets: Snippet[];
  language: LanguageId;
  onSelectSnippet: (snippet: Snippet) => void;
  onOpenSnippetsModal: () => void;
  className?: string;
}> = ({ snippets, language, onSelectSnippet, onOpenSnippetsModal, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const languageSnippets = snippets.filter(
      (snippet) => !snippet.isCustom && (snippet.language ?? 'javascript') === language
    );
    const q = query.trim().toLowerCase();
    if (!q) return languageSnippets;
    return languageSnippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [snippets, language, query]);

  const languageConfig = LANGUAGES[language];

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Examples"
        className="ui-btn w-full justify-between gap-2"
        title={`Load a ${languageConfig.label} example`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="inline truncate lg:hidden xl:inline">Examples</span>
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fadeIn fixed inset-x-3 top-[9rem] z-50 flex max-h-[calc(100dvh-10rem)] w-auto flex-col overflow-hidden rounded-xl border shadow-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[min(23rem,calc(100vw-1.5rem))]"
          style={{
            background: 'var(--panel-bg)',
            borderColor: 'var(--border)',
            boxShadow: '0 24px 60px -24px rgba(0,0,0,0.7)',
          }}
        >
          <div className="border-b p-2" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${languageConfig.short} examples…`}
                className="ui-input h-8 w-full pl-8 pr-2 text-xs"
                aria-label={`Search ${languageConfig.label} example snippets`}
              />
            </div>
          </div>

          <div className="max-h-[19rem] min-h-0 flex-1 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                {query
                  ? `No ${languageConfig.label} examples match “${query}”.`
                  : `No ${languageConfig.label} examples yet.`}
              </p>
            ) : (
              filtered.map((snippet) => (
                <button
                  key={snippet.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectSnippet(snippet);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[var(--hover)]"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: languageConfig.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {snippet.title}
                    </span>
                    <span
                      className="mt-0.5 block truncate text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {snippet.category} · {snippet.description}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery('');
              onOpenSnippetsModal();
            }}
            className="flex w-full items-center justify-between border-t px-3 py-2 text-[11px] font-semibold transition-colors hover:bg-[var(--hover)]"
            style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
          >
            Browse the full snippets library
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const LanguageNav: React.FC<{
  language: LanguageId;
  setLanguage: (language: LanguageId) => void;
  className?: string;
}> = ({ language, setLanguage, className = '' }) => (
  <div
    className={`ui-lang-nav ${className}`}
    role="tablist"
    aria-label="Choose language"
  >
    {LANGUAGE_ORDER.map((id) => {
      const option = LANGUAGES[id];
      const active = id === language;

      return (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active}
          aria-label={`${option.label} — ${option.hint}`}
          title={`${option.label} · ${option.hint}`}
          data-active={active}
          onClick={() => setLanguage(id)}
          className="ui-lang-tab"
          style={{ '--lang': option.color } as React.CSSProperties}
        >
          <span className="ui-lang-dot" aria-hidden="true" />
          <span className="xl:hidden">{option.short}</span>
          <span className="hidden xl:inline">{option.label}</span>
        </button>
      );
    })}
  </div>
);

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleAppearance,
  language,
  setLanguage,
  fileName,
  layoutMode,
  setLayoutMode,
  snippets,
  onSelectSnippet,
  onRun,
  onOpenSnippetsModal,
  onOpenSettingsModal,
  onDownloadCode,
  onCopyShareLink,
  isCopiedShare,
  isRunning,
  mobileTab,
  setMobileTab,
  logsCount = 0,
}) => {
  const currentTheme = THEMES[theme];
  const light = isLightTheme(theme);

  return (
    <header
      role="banner"
      className="relative z-30 shrink-0 border-b"
      style={{ backgroundColor: currentTheme.panelBg, borderColor: currentTheme.border }}
    >
      {/* Primary bar */}
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        {/* Brand */}
        <div className="flex shrink-0 select-none items-center gap-2.5">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: `linear-gradient(140deg, ${withAlpha(currentTheme.accent, 0.24)}, ${withAlpha(
                currentTheme.accent,
                0.05
              )})`,
              border: `1px solid ${withAlpha(currentTheme.accent, 0.35)}`,
              color: currentTheme.accent,
            }}
          >
            <FlaskConical className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-extrabold tracking-tight" style={{ color: currentTheme.text }}>
                Boss<span style={{ color: currentTheme.accent }}>Lab</span>
              </span>
              <span
                className="hidden rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:inline-block"
                style={{
                  borderColor: withAlpha(currentTheme.accent, 0.25),
                  backgroundColor: withAlpha(currentTheme.accent, 0.1),
                  color: currentTheme.accent,
                }}
              >
                Play
              </span>
            </div>
            <p
              className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.16em] sm:block"
              style={{ color: currentTheme.textMuted }}
            >
              Multi-language Playground
            </p>
          </div>
        </div>

        <div
          className="mx-1 hidden h-7 w-px shrink-0 sm:block"
          style={{ backgroundColor: currentTheme.border }}
        />

        {/* Desktop: language, examples + library */}
        <div className="hidden min-w-0 items-center gap-1.5 lg:flex">
          <LanguageNav language={language} setLanguage={setLanguage} />
          <ExamplesMenu
            snippets={snippets}
            language={language}
            onSelectSnippet={onSelectSnippet}
            onOpenSnippetsModal={onOpenSnippetsModal}
            className="shrink-0"
          />
          <button
            type="button"
            onClick={onOpenSnippetsModal}
            className="ui-btn shrink-0"
            title="Open snippets library (Ctrl + K)"
            aria-label="Open snippets library"
          >
            <BookOpen className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
            <span className="hidden xl:inline">Snippets</span>
          </button>
        </div>

        <div className="flex-1" />

        {/* Desktop actions */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="ui-btn ui-btn--primary h-8 px-3.5"
            title={`Run ${LANGUAGES[language].label} (Ctrl + Enter)`}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Running' : 'Run'}</span>
            <kbd className="ui-kbd ml-0.5 hidden lg:inline-flex">Ctrl ↵</kbd>
          </button>

          <div className="mx-0.5 h-6 w-px" style={{ backgroundColor: currentTheme.border }} />

          <button
            type="button"
            onClick={onToggleAppearance}
            className="ui-btn ui-btn--icon"
            title={light ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          <div className="ui-segment hidden lg:inline-flex" role="group" aria-label="Layout">
            {LAYOUTS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setLayoutMode(id)}
                data-active={layoutMode === id}
                title={label}
                aria-label={label}
                aria-pressed={layoutMode === id}
                className="w-6 px-0"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onCopyShareLink}
            className="ui-btn ui-btn--icon"
            title="Copy shareable link"
            aria-label="Copy shareable link"
          >
            {isCopiedShare ? (
              <Check className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onDownloadCode}
            className="ui-btn ui-btn--icon"
            title={`Download ${fileName}`}
            aria-label={`Download ${fileName}`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="ui-btn ui-btn--icon"
            title="Settings (Ctrl + ,)"
            aria-label="Open settings"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile primary actions */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            type="button"
            onClick={onToggleAppearance}
            className="ui-btn ui-btn--icon shrink-0"
            aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {light ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="ui-btn ui-btn--primary h-8 shrink-0 px-3"
            title={`Run ${LANGUAGES[language].label}`}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Running' : 'Run'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="ui-btn ui-btn--icon shrink-0"
            aria-label="Open settings"
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile secondary bar */}
      <div className="flex items-center gap-1.5 px-3 pb-2.5 lg:hidden">
        <LanguageNav language={language} setLanguage={setLanguage} className="shrink-0" />

        <div className="hidden min-w-0 shrink-0 sm:block">
          <ExamplesMenu
            snippets={snippets}
            language={language}
            onSelectSnippet={onSelectSnippet}
            onOpenSnippetsModal={onOpenSnippetsModal}
            className="w-40"
          />
        </div>

        <div className="flex-1" />

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSnippetsModal}
            className="ui-btn ui-btn--icon"
            title="Snippets library"
            aria-label="Open snippets library"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onCopyShareLink}
            className="ui-btn ui-btn--icon"
            title="Copy shareable link"
            aria-label="Copy shareable link"
          >
            {isCopiedShare ? (
              <Check className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onDownloadCode}
            className="ui-btn ui-btn--icon"
            title={`Download ${fileName}`}
            aria-label={`Download ${fileName}`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile editor/console switcher */}
      {setMobileTab && mobileTab && (
        <div
          className="flex items-center gap-1 border-t px-3 py-1.5 md:hidden"
          style={{ borderColor: currentTheme.border }}
        >
          <div className="ui-segment w-full">
            <button
              type="button"
              onClick={() => setMobileTab('editor')}
              data-active={mobileTab === 'editor'}
              aria-pressed={mobileTab === 'editor'}
              className="flex-1"
            >
              <SquareCode className="h-3.5 w-3.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('console')}
              data-active={mobileTab === 'console'}
              aria-pressed={mobileTab === 'console'}
              className="flex-1"
            >
              <Terminal className="h-3.5 w-3.5" />
              Console
              {logsCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-px text-[9px] font-bold"
                  style={{
                    backgroundColor: withAlpha(currentTheme.accent, 0.2),
                    color: currentTheme.accent,
                  }}
                >
                  {logsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
