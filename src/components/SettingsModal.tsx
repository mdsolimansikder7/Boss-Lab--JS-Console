import React from 'react';
import { X, Settings as SettingsIcon, Type, Indent, ToggleLeft, ToggleRight } from 'lucide-react';
import { EditorSettings, ThemeConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
  theme: ThemeConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  theme
}) => {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isLight = theme.id === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.border,
          color: theme.text
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon className={`w-5 h-5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
            <h2 className="text-sm sm:text-base font-bold tracking-tight">Editor Preferences</h2>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Font Size */}
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <Type className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <div>
                <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Editor Font Size</p>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Set monospace text size in pixels</p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <input
                type="range"
                min="12"
                max="22"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                className="w-20 sm:w-24 accent-sky-500"
              />
              <span className={`w-8 text-right font-bold ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>{settings.fontSize}px</span>
            </div>
          </div>

          {/* Tab Size */}
          <div className={`flex items-center justify-between gap-4 py-1 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <div className="flex items-center gap-2">
              <Indent className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <div>
                <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Tab Size</p>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Number of spaces per indent tab</p>
              </div>
            </div>

            <div className="flex gap-1">
              {[2, 4].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('tabSize', size)}
                  className={`px-2.5 py-1 rounded-md font-mono font-bold transition-all ${
                    settings.tabSize === size
                      ? 'bg-emerald-500 text-black'
                      : (isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/5 text-gray-400 hover:bg-white/10')
                  }`}
                >
                  {size} spaces
                </button>
              ))}
            </div>
          </div>

          {/* Auto Close Brackets */}
          <div className={`flex items-center justify-between gap-4 py-1 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <div>
              <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Auto-Close Brackets & Quotes</p>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Automatically append closing (), {}, [], "", ''</p>
            </div>

            <button
              onClick={() => updateSetting('autoCloseBrackets', !settings.autoCloseBrackets)}
              className="text-sky-500 hover:opacity-80 transition-opacity"
            >
              {settings.autoCloseBrackets ? (
                <ToggleRight className="w-7 h-7 text-sky-500" />
              ) : (
                <ToggleLeft className={`w-7 h-7 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
              )}
            </button>
          </div>

          {/* Word Wrap */}
          <div className={`flex items-center justify-between gap-4 py-1 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <div>
              <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Word Wrap</p>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Wrap long lines of code automatically</p>
            </div>

            <button
              onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
              className="text-sky-500 hover:opacity-80 transition-opacity"
            >
              {settings.wordWrap ? (
                <ToggleRight className="w-7 h-7 text-sky-500" />
              ) : (
                <ToggleLeft className={`w-7 h-7 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
              )}
            </button>
          </div>

          {/* Line Numbers */}
          <div className={`flex items-center justify-between gap-4 py-1 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
            <div>
              <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>Show Line Numbers</p>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Display line number gutter on the left side</p>
            </div>

            <button
              onClick={() => updateSetting('lineNumbers', !settings.lineNumbers)}
              className="text-sky-500 hover:opacity-80 transition-opacity"
            >
              {settings.lineNumbers ? (
                <ToggleRight className="w-7 h-7 text-sky-500" />
              ) : (
                <ToggleLeft className={`w-7 h-7 ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className="flex justify-end px-5 py-3 border-t"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-500 text-white font-semibold text-xs hover:bg-sky-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
