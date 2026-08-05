import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, Snippet, ThemeId, EditorSettings, LayoutMode } from './types';
import { THEMES } from './utils/theme';
import { DEFAULT_SNIPPETS } from './data/snippets';
import { evaluateJavaScript } from './utils/evaluator';
import { Header } from './components/Header';
import { CodeEditor, CodeEditorRef } from './components/CodeEditor';
import { ConsoleOutput } from './components/ConsoleOutput';
import { InteractiveRepl } from './components/InteractiveRepl';
import { SnippetsModal } from './components/SnippetsModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

const STORAGE_KEY_CODE = 'js_console_saved_code';
const STORAGE_KEY_SNIPPETS = 'js_console_custom_snippets';
const STORAGE_KEY_THEME = 'js_console_theme';
const STORAGE_KEY_SETTINGS = 'js_console_settings';

export default function App() {
  const editorRef = useRef<CodeEditorRef>(null);

  // App state
  const [code, setCode] = useState<string>(() => {
    // Check URL Hash first for shared snippets
    if (window.location.hash.startsWith('#code=')) {
      try {
        const encoded = window.location.hash.replace('#code=', '');
        return decodeURIComponent(atob(encoded));
      } catch (e) {
        console.error("Failed to decode shared code from URL:", e);
      }
    }
    return localStorage.getItem(STORAGE_KEY_CODE) || DEFAULT_SNIPPETS[0].code;
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [theme, setTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeId) || 'midnight';
  });

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [mobileTab, setMobileTab] = useState<'editor' | 'console'>('editor');
  const [cursorLine, setCursorLine] = useState<number>(1);
  const [status, setStatus] = useState<string>('Ready');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [isCopiedShare, setIsCopiedShare] = useState<boolean>(false);

  // Modals state
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Editor Settings state
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      fontSize: 14,
      tabSize: 2,
      autoCloseBrackets: true,
      wordWrap: false,
      lineNumbers: true,
      showLineHighlight: true
    };
  });

  // Custom user snippets state
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const customSaved = localStorage.getItem(STORAGE_KEY_SNIPPETS);
    if (customSaved) {
      try {
        const parsed = JSON.parse(customSaved);
        return [...DEFAULT_SNIPPETS, ...parsed];
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SNIPPETS;
  });

  // Save code to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CODE, code);
  }, [code]);

  // Save theme
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Save settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const currentThemeConfig = THEMES[theme] || THEMES['midnight'];

  // Execute Code
  const handleRunCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setStatus('Running...');
    setLogs([]); // Clear output on new run

    // Switch to console tab automatically on mobile view so output is visible
    if (window.innerWidth < 768) {
      setMobileTab('console');
    }

    const result = await evaluateJavaScript(code, (entry) => {
      setLogs(prev => [...prev, entry]);
    });

    setIsRunning(false);
    setExecutionTime(result.executionTimeMs);

    if (result.success) {
      setStatus(`Finished in ${result.executionTimeMs}ms`);
    } else {
      setStatus(`Execution failed (${result.executionTimeMs}ms)`);
    }
  };

  // Clear Output Console
  const handleClearOutput = () => {
    setLogs([]);
    setExecutionTime(undefined);
    setStatus('Ready');
  };

  // REPL Single Line Execution
  const handleEvaluateRepl = async (expr: string) => {
    setStatus('Evaluating REPL...');
    await evaluateJavaScript(expr, (entry) => {
      setLogs(prev => [...prev, entry]);
    });
    setStatus('Ready');
  };

  // Load selected snippet
  const handleSelectSnippet = (snippet: Snippet) => {
    setCode(snippet.code);
    setStatus(`Loaded '${snippet.title}'`);
  };

  // Save current code as custom snippet
  const handleSaveCurrentAsSnippet = (title: string, description: string) => {
    const newSnippet: Snippet = {
      id: `custom-${Date.now()}`,
      title,
      category: 'Saved',
      description,
      code,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updated = [...snippets, newSnippet];
    setSnippets(updated);

    // Save only custom snippets to localStorage
    const customOnly = updated.filter(s => s.isCustom);
    localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(customOnly));
  };

  // Delete custom snippet
  const handleDeleteSnippet = (id: string) => {
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);

    const customOnly = updated.filter(s => s.isCustom);
    localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(customOnly));
  };

  // Download code as script.js
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Shareable URL Link
  const handleCopyShareLink = () => {
    try {
      const encoded = btoa(encodeURIComponent(code));
      const shareUrl = `${window.location.origin}${window.location.pathname}#code=${encoded}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopiedShare(true);
      setTimeout(() => setIsCopiedShare(false), 2000);
    } catch (err) {
      console.error("Failed to generate share URL:", err);
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen overflow-hidden select-none font-sans transition-colors duration-200"
      style={{
        backgroundColor: currentThemeConfig.bg,
        color: currentThemeConfig.text
      }}
    >
      {/* Top Navigation Bar */}
      <Header
        theme={theme}
        setTheme={setTheme}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        snippets={snippets}
        onSelectSnippet={handleSelectSnippet}
        onRun={handleRunCode}
        onClear={handleClearOutput}
        onOpenSnippetsModal={() => setIsSnippetsModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onDownloadCode={handleDownloadCode}
        onCopyShareLink={handleCopyShareLink}
        isCopiedShare={isCopiedShare}
        isRunning={isRunning}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        logsCount={logs.length}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Editor Panel */}
        {(layoutMode === 'split' || layoutMode === 'editor-only' || layoutMode === 'stacked') && (
          <div 
            className={`h-full transition-all duration-200 ${
              mobileTab === 'console' ? 'hidden md:block' : 'block'
            } ${
              layoutMode === 'editor-only' 
                ? 'w-full' 
                : layoutMode === 'stacked'
                ? 'w-full h-1/2'
                : 'w-full md:w-1/2'
            }`}
          >
            <CodeEditor
              ref={editorRef}
              code={code}
              setCode={setCode}
              onRun={handleRunCode}
              settings={settings}
              theme={currentThemeConfig}
              cursorLine={cursorLine}
              setCursorLine={setCursorLine}
            />
          </div>
        )}

        {/* Console Output Panel */}
        {(layoutMode === 'split' || layoutMode === 'console-only' || layoutMode === 'stacked') && (
          <div 
            className={`h-full flex flex-col transition-all duration-200 ${
              mobileTab === 'editor' ? 'hidden md:flex' : 'flex'
            } ${
              layoutMode === 'console-only' 
                ? 'w-full' 
                : layoutMode === 'stacked'
                ? 'w-full h-1/2 border-t'
                : 'w-full md:w-1/2 border-l'
            }`}
            style={{ borderColor: currentThemeConfig.border }}
          >
            <div className="flex-1 overflow-hidden">
              <ConsoleOutput
                logs={logs}
                onClear={handleClearOutput}
                theme={currentThemeConfig}
                executionTime={executionTime}
                fontSize={settings.fontSize}
              />
            </div>

            {/* Bottom Interactive REPL Prompt */}
            <InteractiveRepl
              onEvaluate={handleEvaluateRepl}
              theme={currentThemeConfig}
              fontSize={settings.fontSize}
            />
          </div>
        )}
      </main>

      {/* Footer Status Bar */}
      <Footer
        status={status}
        cursorLine={cursorLine}
        theme={currentThemeConfig}
        isRunning={isRunning}
      />

      {/* Modals */}
      <SnippetsModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        snippets={snippets}
        onSelectSnippet={handleSelectSnippet}
        onSaveCurrentAsSnippet={handleSaveCurrentAsSnippet}
        onDeleteSnippet={handleDeleteSnippet}
        currentCode={code}
        theme={currentThemeConfig}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
        theme={currentThemeConfig}
      />
    </div>
  );
}
