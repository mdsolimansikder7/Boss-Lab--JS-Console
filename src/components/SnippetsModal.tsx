import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, BookOpen, Plus, Trash2, Code2, Check, Sparkles, FolderOpen } from 'lucide-react';
import { Snippet, ThemeConfig, LanguageId } from '../types';
import { withAlpha } from '../utils/theme';
import { LANGUAGE_ORDER, LANGUAGES } from '../utils/languages';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  onSaveCurrentAsSnippet: (title: string, description: string) => void;
  onDeleteSnippet: (id: string) => void;
  currentCode: string;
  currentLanguage: LanguageId;
  theme: ThemeConfig;
}

const CATEGORIES = ['All', 'Saved', 'Beginner', 'Data Structures', 'Async & Fetch', 'Algorithms', 'Fun & Utility'];

const snippetLanguage = (snippet: Snippet) => LANGUAGES[snippet.language ?? 'javascript'];

export const SnippetsModal: React.FC<SnippetsModalProps> = ({
  isOpen,
  onClose,
  snippets,
  onSelectSnippet,
  onSaveCurrentAsSnippet,
  onDeleteSnippet,
  currentCode,
  currentLanguage,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'save'>('browse');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | LanguageId>(currentLanguage);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const successTimer = useRef<number | undefined>(undefined);
  const isLight = theme.id === 'light';

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 80);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  // Start on the language the user is currently writing in.
  useEffect(() => {
    if (!isOpen) return;
    setSelectedLanguage(currentLanguage);
    setSelectedCategory('All');
  }, [isOpen, currentLanguage]);

  useEffect(() => {
    return () => window.clearTimeout(successTimer.current);
  }, []);

  const languageSnippets = useMemo(
    () =>
      selectedLanguage === 'all'
        ? snippets
        : snippets.filter((snippet) => (snippet.language ?? 'javascript') === selectedLanguage),
    [snippets, selectedLanguage]
  );

  const filteredSnippets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return languageSnippets.filter((snippet) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Saved' ? snippet.isCustom : snippet.category === selectedCategory);

      if (!matchesCategory) return false;
      if (!query) return true;

      return (
        snippet.title.toLowerCase().includes(query) ||
        snippet.description.toLowerCase().includes(query) ||
        snippet.code.toLowerCase().includes(query)
      );
    });
  }, [languageSnippets, selectedCategory, searchQuery]);

  const categoryCount = (category: string) =>
    languageSnippets.filter((snippet) =>
      category === 'All'
        ? true
        : category === 'Saved'
          ? snippet.isCustom
          : snippet.category === category
    ).length;

  if (!isOpen) return null;

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTitle.trim()) return;

    onSaveCurrentAsSnippet(newTitle.trim(), newDesc.trim() || 'Custom user snippet');
    setNewTitle('');
    setNewDesc('');
    setSaveSuccess(true);

    window.clearTimeout(successTimer.current);
    successTimer.current = window.setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('browse');
      setSelectedCategory('Saved');
    }, 1000);
  };

  return (
    <div
      className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippets-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[86vh]"
        style={{ backgroundColor: theme.panelBg, borderColor: theme.border, color: theme.text }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" style={{ color: theme.accent }} />
            <h2 id="snippets-title" className="text-sm font-bold tracking-tight">
              Snippets library
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
            aria-label="Close snippets library"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs + search */}
        <div
          className="flex shrink-0 flex-col gap-2 border-b px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className="ui-btn h-8"
              style={
                activeTab === 'browse'
                  ? {
                      backgroundColor: withAlpha(theme.accent, 0.14),
                      borderColor: withAlpha(theme.accent, 0.4),
                      color: theme.accent,
                    }
                  : undefined
              }
            >
              Browse
              <span className="text-[10px] opacity-70">{languageSnippets.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('save')}
              className="ui-btn h-8"
              style={
                activeTab === 'save'
                  ? {
                      backgroundColor: 'rgba(52, 211, 153, 0.12)',
                      borderColor: 'rgba(52, 211, 153, 0.4)',
                      color: isLight ? '#047857' : '#6ee7b7',
                    }
                  : undefined
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Save current code
            </button>
          </div>

          {activeTab === 'browse' && (
            <div className="relative w-full sm:w-auto">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: theme.textMuted }}
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search snippets…"
                aria-label="Search snippets"
                className="ui-input h-8 w-full pl-8 pr-8 text-xs sm:w-48"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-[var(--hover)]"
                  aria-label="Clear snippet search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'browse' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: theme.textMuted }}
                >
                  Language
                </span>
                {(['all', ...LANGUAGE_ORDER] as const).map((id) => {
                  const config = id === 'all' ? null : LANGUAGES[id];
                  const color = config?.color ?? theme.accent;
                  const active = selectedLanguage === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(id);
                        setSelectedCategory('All');
                      }}
                      aria-pressed={active}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
                      style={
                        active
                          ? {
                              backgroundColor: withAlpha(color, 0.16),
                              borderColor: withAlpha(color, 0.45),
                              color: `color-mix(in srgb, ${color} 65%, ${theme.text})`,
                            }
                          : {
                              backgroundColor: theme.bg,
                              borderColor: theme.border,
                              color: theme.textMuted,
                            }
                      }
                    >
                      {config?.short ?? 'All'}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: theme.textMuted }}
                >
                  Category
                </span>
                {CATEGORIES.map((category) => {
                  const count = categoryCount(category);
                  if (count === 0 && category !== 'All') return null;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                      style={
                        selectedCategory === category
                          ? {
                              backgroundColor: withAlpha(theme.accent, 0.16),
                              borderColor: withAlpha(theme.accent, 0.45),
                              color: theme.accent,
                            }
                          : {
                              backgroundColor: theme.bg,
                              borderColor: theme.border,
                              color: theme.textMuted,
                            }
                      }
                    >
                      {category}
                      <span className="ml-1 opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>

              {filteredSnippets.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-14 text-center"
                  style={{ color: theme.textMuted }}
                >
                  <FolderOpen className="h-8 w-8 opacity-50" />
                  <p className="text-sm font-medium">No snippets found</p>
                  <p className="max-w-xs text-xs">Try another category, or save the code you are working on.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  {filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="group flex flex-col justify-between gap-2.5 rounded-xl border p-3 transition-all hover:border-[var(--accent-line)]"
                      style={{ borderColor: theme.border, backgroundColor: theme.bg }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 flex-1 text-[13px] font-bold leading-snug" style={{ color: theme.text }}>
                            {snippet.title}
                          </h3>
                          <span className="flex shrink-0 items-center gap-1">
                            <span
                              className="rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                              style={{
                                borderColor: withAlpha(snippetLanguage(snippet).color, 0.4),
                                color: `color-mix(in srgb, ${snippetLanguage(snippet).color} 62%, ${theme.text})`,
                              }}
                            >
                              {snippetLanguage(snippet).short}
                            </span>
                            <span
                              className="rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
                              style={{
                                borderColor: theme.border,
                                color: snippet.isCustom ? theme.accent : theme.textMuted,
                              }}
                            >
                              {snippet.isCustom ? 'Saved' : snippet.category}
                            </span>
                          </span>
                        </div>

                        <p
                          className="mt-1 line-clamp-2 text-[11px] leading-relaxed"
                          style={{ color: theme.textMuted }}
                        >
                          {snippet.description}
                        </p>

                        <pre
                          className="mt-2 max-h-14 overflow-hidden rounded-md border px-2 py-1.5 font-mono text-[10px] leading-relaxed"
                          style={{
                            borderColor: withAlpha(theme.border, 0.8),
                            backgroundColor: withAlpha(theme.consoleBg, 0.85),
                            color: theme.textMuted,
                          }}
                        >
                          {snippet.code.split('\n').slice(0, 3).join('\n')}
                        </pre>
                      </div>

                      <div
                        className="flex items-center justify-between border-t pt-2"
                        style={{ borderColor: theme.border }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSnippet(snippet);
                            onClose();
                          }}
                          className="ui-btn h-7 px-2.5 text-[11px]"
                          style={{
                            borderColor: withAlpha(theme.accent, 0.3),
                            backgroundColor: withAlpha(theme.accent, 0.1),
                            color: theme.accent,
                          }}
                        >
                          <Code2 className="h-3 w-3" />
                          Load snippet
                        </button>

                        {snippet.isCustom ? (
                          <button
                            type="button"
                            onClick={() => onDeleteSnippet(snippet.id)}
                            className="ui-btn ui-btn--ghost ui-btn--icon ui-btn--danger h-7 w-7"
                            title="Delete saved snippet"
                            aria-label={`Delete ${snippet.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wide opacity-50">Built-in</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="mx-auto max-w-lg space-y-3.5 py-1">
              <div>
                <label
                  htmlFor="snippet-title"
                  className="mb-1 block text-[11px] font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Snippet title
                </label>
                <input
                  id="snippet-title"
                  type="text"
                  required
                  placeholder="e.g. Array flattening helper"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  className="ui-input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="snippet-description"
                  className="mb-1 block text-[11px] font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Description
                </label>
                <input
                  id="snippet-description"
                  type="text"
                  placeholder="What does this snippet do?"
                  value={newDesc}
                  onChange={(event) => setNewDesc(event.target.value)}
                  className="ui-input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                    Current editor code · {LANGUAGES[currentLanguage].label}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: theme.textMuted }}>
                    {currentCode.split('\n').length} lines
                  </span>
                </div>
                <pre
                  className="max-h-40 overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.bg,
                    color: theme.text,
                  }}
                >
                  {currentCode ||
                    (currentLanguage === 'python'
                      ? '# No code in the editor yet'
                      : '// No code in the editor yet')}
                </pre>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim() || !currentCode.trim()}
                className="ui-btn ui-btn--primary h-9 w-full gap-2"
              >
                {saveSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved successfully
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Save snippet
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
