import React, { useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  Type,
  Indent,
  Palette,
  Check,
  RotateCcw,
  Minus,
  Plus,
  Highlighter,
} from 'lucide-react';
import { EditorSettings, ThemeConfig, ThemeId } from '../types';
import { DEFAULT_EDITOR_SETTINGS } from '../utils/settings';
import { THEMES } from '../utils/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  theme: ThemeConfig;
  themeId: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const SectionTitle: React.FC<{ icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }> = ({
  icon: Icon,
  children,
}) => (
  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
    <Icon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
    <span style={{ color: 'var(--text-muted)' }}>{children}</span>
  </div>
);

const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
    style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--border)' }}
  >
    <span
      className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
      style={{ transform: checked ? 'translateX(1.125rem)' : 'translateX(0.125rem)' }}
    />
  </button>
);

const SettingRow: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div
    className="flex items-center justify-between gap-4 border-t py-2.5 first:border-t-0 first:pt-0"
    style={{ borderColor: 'var(--border)' }}
  >
    <div className="min-w-0">
      <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  theme,
  themeId,
  setTheme,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
        aria-labelledby="settings-title"
        className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ backgroundColor: theme.panelBg, borderColor: theme.border, color: theme.text }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-5"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" style={{ color: theme.accent }} />
            <h2 id="settings-title" className="text-sm font-bold tracking-tight">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Appearance */}
          <section className="mb-5">
            <SectionTitle icon={Palette}>Appearance</SectionTitle>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(THEMES).map((option) => {
                const active = option.id === themeId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id)}
                    aria-pressed={active}
                    className="flex items-center gap-2 rounded-lg border px-2 py-2 text-left transition-all"
                    style={{
                      borderColor: active ? option.accent : theme.border,
                      backgroundColor: active ? `${option.accent}14` : theme.bg,
                      boxShadow: active ? `0 0 0 1px ${option.accent}55` : 'none',
                    }}
                  >
                    <span className="flex shrink-0 items-center -space-x-1">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: option.bg, borderColor: option.border }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: option.accent, borderColor: option.border }}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium" style={{ color: theme.text }}>
                      {option.name}
                    </span>
                    {active && <Check className="h-3.5 w-3.5 shrink-0" style={{ color: option.accent }} />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Editor */}
          <section>
            <SectionTitle icon={Type}>Editor</SectionTitle>

            <SettingRow title="Font size" description="Monospace text size in the code editor">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateSetting('fontSize', Math.max(11, settings.fontSize - 1))}
                  className="ui-btn ui-btn--icon h-6 w-6"
                  aria-label="Decrease font size"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-9 text-center font-mono text-xs font-bold" style={{ color: theme.accent }}>
                  {settings.fontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 1))}
                  className="ui-btn ui-btn--icon h-6 w-6"
                  aria-label="Increase font size"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </SettingRow>

            <SettingRow title="Tab size" description="Spaces inserted for every indentation level">
              <div className="ui-segment">
                {[2, 4].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateSetting('tabSize', size)}
                    data-active={settings.tabSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </SettingRow>

            <SettingRow
              title="Auto suggestions"
              description="Show code completions automatically while typing. Turn off to open them with Ctrl+Space. Shortcut: Ctrl+Alt+S."
            >
              <Toggle
                checked={settings.autoSuggestions}
                onChange={() => updateSetting('autoSuggestions', !settings.autoSuggestions)}
                label="Toggle auto suggestions"
              />
            </SettingRow>

            <SettingRow title="Auto-close brackets" description="Automatically insert closing brackets and quotes">
              <Toggle
                checked={settings.autoCloseBrackets}
                onChange={() => updateSetting('autoCloseBrackets', !settings.autoCloseBrackets)}
                label="Toggle auto-close brackets"
              />
            </SettingRow>

            <SettingRow title="Word wrap" description="Wrap long lines instead of scrolling horizontally">
              <Toggle
                checked={settings.wordWrap}
                onChange={() => updateSetting('wordWrap', !settings.wordWrap)}
                label="Toggle word wrap"
              />
            </SettingRow>

            <SettingRow title="Line numbers" description="Show the line number gutter">
              <Toggle
                checked={settings.lineNumbers}
                onChange={() => updateSetting('lineNumbers', !settings.lineNumbers)}
                label="Toggle line numbers"
              />
            </SettingRow>

            <SettingRow title="Highlight active line" description="Tint the line the cursor is currently on">
              <Toggle
                checked={settings.showLineHighlight}
                onChange={() => updateSetting('showLineHighlight', !settings.showLineHighlight)}
                label="Toggle active line highlight"
              />
            </SettingRow>
          </section>

          <p className="mt-4 flex items-center gap-1.5 text-[11px]" style={{ color: theme.textMuted }}>
            <Highlighter className="h-3 w-3" />
            Preferences are saved automatically in this browser.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3 sm:px-5"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_EDITOR_SETTINGS)}
            className="ui-btn ui-btn--ghost h-8 gap-1.5 px-2 text-[11px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset defaults
          </button>
          <button type="button" onClick={onClose} className="ui-btn ui-btn--primary h-8 px-4">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
