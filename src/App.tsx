import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LayoutMode, LogEntry, Snippet, ThemeId, EditorSettings, LanguageId } from './types';
import { THEMES, themeCssVars, withAlpha } from './utils/theme';
import { DEFAULT_SNIPPETS } from './data/snippets';
import { runCode } from './utils/runner';
import { LANGUAGES, isLanguageId, sanitizeFileName } from './utils/languages';
import { loadEditorSettings } from './utils/settings';
import { loadJSON, loadString, saveJSON, saveString, STORAGE_KEYS } from './utils/storage';
import { copyText } from './utils/clipboard';
import { Header } from './components/Header';
import { CodeEditor, CodeEditorRef } from './components/CodeEditor';
import { ConsoleOutput } from './components/ConsoleOutput';
import { InteractiveRepl } from './components/InteractiveRepl';
import { SnippetsModal } from './components/SnippetsModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Toast, ToastMessage, ToastTone } from './components/Toast';

const VALID_LAYOUTS: LayoutMode[] = ['split', 'editor-only', 'console-only', 'stacked'];

/**
 * Read `#code=<base64>&lang=python` from the URL. Base64 can contain "+" and
 * "=", so the hash is split by hand instead of URLSearchParams (which turns
 * "+" into a space and would corrupt shared snippets).
 */
function readSharedSnippet(): { code: string; language: LanguageId } | null {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;

  const parts = hash.split('&');
  const codePart = parts.find((part) => part.startsWith('code='));
  if (!codePart) return null;

  try {
    const decoded = decodeURIComponent(atob(codePart.slice(5)));
    const langPart = parts.find((part) => part.startsWith('lang='));
    const language = langPart ? langPart.slice(5) : 'javascript';
    return {
      code: decoded,
      language: isLanguageId(language) ? language : 'javascript',
    };
  } catch (error) {
    console.error('Failed to decode shared code from URL:', error);
    return null;
  }
}

const INITIAL_SHARE = typeof window === 'undefined' ? null : readSharedSnippet();

/** Track a CSS media query so the compact tabbed layout can override the saved desktop layout. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function buildInitialCodeMap(shared: { code: string; language: LanguageId } | null) {
  const stored = loadJSON<Partial<Record<LanguageId, string>>>(STORAGE_KEYS.codeMap, {});
  const legacyJavascript = loadString(STORAGE_KEYS.code, '');

  const map: Record<LanguageId, string> = {
    javascript: stored.javascript ?? (legacyJavascript || LANGUAGES.javascript.template),
    python: stored.python ?? LANGUAGES.python.template,
    cpp: stored.cpp ?? LANGUAGES.cpp.template,
    c: stored.c ?? LANGUAGES.c.template,
  };

  if (shared) map[shared.language] = shared.code;
  return map;
}

function buildInitialFileNames(): Record<LanguageId, string> {
  const stored = loadJSON<Partial<Record<LanguageId, string>>>(STORAGE_KEYS.fileNames, {});
  const saved = stored && typeof stored === 'object' ? stored : {};

  return {
    javascript: sanitizeFileName(saved.javascript ?? LANGUAGES.javascript.fileName, LANGUAGES.javascript.fileName),
    python: sanitizeFileName(saved.python ?? LANGUAGES.python.fileName, LANGUAGES.python.fileName),
    cpp: sanitizeFileName(saved.cpp ?? LANGUAGES.cpp.fileName, LANGUAGES.cpp.fileName),
    c: sanitizeFileName(saved.c ?? LANGUAGES.c.fileName, LANGUAGES.c.fileName),
  };
}

export default function App() {
  const editorRef = useRef<CodeEditorRef>(null);

  // App state
  const [language, setLanguageState] = useState<LanguageId>(() => {
    if (INITIAL_SHARE) return INITIAL_SHARE.language;
    const saved = loadString(STORAGE_KEYS.language, 'javascript');
    return isLanguageId(saved) ? saved : 'javascript';
  });

  const [codeMap, setCodeMap] = useState<Record<LanguageId, string>>(() =>
    buildInitialCodeMap(INITIAL_SHARE)
  );
  const [fileNames, setFileNames] = useState<Record<LanguageId, string>>(buildInitialFileNames);

  const code = codeMap[language];
  const fileName = fileNames[language];

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [theme, setTheme] = useState<ThemeId>(() => {
    const saved = loadString(STORAGE_KEYS.theme, 'midnight') as ThemeId;
    return THEMES[saved] ? saved : 'midnight';
  });

  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    const saved = loadString(STORAGE_KEYS.layout, 'split') as LayoutMode;
    return VALID_LAYOUTS.includes(saved) ? saved : 'split';
  });

  const [mobileTab, setMobileTab] = useState<'editor' | 'console'>('editor');
  const [cursorLine, setCursorLine] = useState<number>(1);
  const [status, setStatus] = useState<string>(INITIAL_SHARE ? 'Shared snippet loaded' : 'Ready');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | undefined>(undefined);
  const [isCopiedShare, setIsCopiedShare] = useState<boolean>(false);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);

  // Modals
  const [isSnippetsModalOpen, setIsSnippetsModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Editor settings
  const [settings, setSettings] = useState<EditorSettings>(() => loadEditorSettings());

  // Custom user snippets
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const custom = loadJSON<Snippet[]>(STORAGE_KEYS.snippets, []);
    const validCustom = Array.isArray(custom)
      ? custom.filter((snippet) => snippet && typeof snippet.id === 'string' && typeof snippet.code === 'string')
      : [];
    return [...DEFAULT_SNIPPETS, ...validCustom];
  });

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const showToast = useCallback((message: string, tone: ToastTone = 'success') => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // Keep the last dark theme so the light/dark toggle can return to it.
  const lastDarkThemeRef = useRef<ThemeId>(theme === 'light' ? 'midnight' : theme);

  const currentThemeConfig = THEMES[theme] || THEMES.midnight;
  const cssVars = useMemo(() => themeCssVars(currentThemeConfig), [currentThemeConfig]);

  // Persist state
  useEffect(() => saveJSON(STORAGE_KEYS.codeMap, codeMap), [codeMap]);
  useEffect(() => saveJSON(STORAGE_KEYS.fileNames, fileNames), [fileNames]);
  useEffect(() => saveString(STORAGE_KEYS.code, codeMap.javascript), [codeMap.javascript]);
  useEffect(() => saveString(STORAGE_KEYS.language, language), [language]);
  useEffect(() => {
    saveString(STORAGE_KEYS.theme, theme);
    if (theme !== 'light') lastDarkThemeRef.current = theme;
  }, [theme]);
  useEffect(() => saveJSON(STORAGE_KEYS.settings, settings), [settings]);
  useEffect(() => saveString(STORAGE_KEYS.layout, layoutMode), [layoutMode]);

  // Keep the browser chrome in sync with the app theme.
  useEffect(() => {
    document.documentElement.style.backgroundColor = currentThemeConfig.bg;
    document.documentElement.style.colorScheme = currentThemeConfig.id === 'light' ? 'light' : 'dark';
  }, [currentThemeConfig]);

  // Clear the share hash after loading it so shared code does not keep
  // overriding the locally saved snippet on every reload.
  useEffect(() => {
    if (INITIAL_SHARE) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}`);
      showToast('Shared snippet loaded', 'info');
    }
  }, [showToast]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const isRunningRef = useRef(false);
  const runIdRef = useRef(0);
  const runRef = useRef<() => void>(() => {});

  const handleRunCode = useCallback(async () => {
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    const runId = ++runIdRef.current;

    setIsRunning(true);
    setStatus(`Running ${LANGUAGES[language].label}…`);
    setLogs([]);
    setErrorLine(undefined);
    setExecutionTime(undefined);

    // Show output immediately on compact/tabbed layouts.
    if (window.innerWidth < 1024) setMobileTab('console');

    const result = await runCode(language, code, (entry) => {
      // Ignore log callbacks from timers belonging to an older run.
      if (runIdRef.current !== runId) return;

      if (entry.type === 'clear') {
        setLogs([]);
        return;
      }

      setLogs((prev) => [...prev, entry]);
      if (entry.type === 'error' && entry.line) setErrorLine(entry.line);
    });

    if (runIdRef.current !== runId) return;

    isRunningRef.current = false;
    setIsRunning(false);
    setExecutionTime(result.executionTimeMs);
    setStatus(
      result.success
        ? `Finished in ${result.executionTimeMs} ms`
        : `Error after ${result.executionTimeMs} ms`
    );
  }, [code, language]);

  runRef.current = handleRunCode;

  // Global shortcuts (Ctrl/Cmd + Enter, Ctrl/Cmd + K, Ctrl/Cmd + ,)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      if (!mod) return;

      const target = event.target as HTMLElement | null;
      const insideMonaco = target instanceof Element && Boolean(target.closest('.monaco-editor'));

      if (event.key === 'Enter' && !event.shiftKey) {
        if (insideMonaco) return; // Monaco owns this shortcut while focused
        event.preventDefault();
        runRef.current();
        return;
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSnippetsModalOpen((open) => !open);
        setIsSettingsModalOpen(false);
      } else if (event.key === ',') {
        event.preventDefault();
        setIsSettingsModalOpen((open) => !open);
        setIsSnippetsModalOpen(false);
      } else if (event.altKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        setSettings((current) => ({ ...current, autoSuggestions: !current.autoSuggestions }));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleClearOutput = useCallback(() => {
    runIdRef.current += 1; // invalidate pending logs from the previous run
    isRunningRef.current = false;
    setIsRunning(false);
    setLogs([]);
    setExecutionTime(undefined);
    setErrorLine(undefined);
    setStatus('Console cleared');
  }, []);

  const handleEvaluateRepl = useCallback(async (expr: string) => {
    await runCode('javascript', expr, (entry) => {
      if (entry.type === 'clear') {
        setLogs([]);
        return;
      }
      setLogs((prev) => [...prev, entry]);
    });
  }, []);

  const handleLanguageChange = useCallback((next: LanguageId) => {
    if (next === language) return;

    // Invalidate any in-flight run so late output cannot land in the new language.
    runIdRef.current += 1;
    isRunningRef.current = false;
    setIsRunning(false);
    setLogs([]);
    setExecutionTime(undefined);
    setErrorLine(undefined);

    setLanguageState(next);
    setStatus(`Switched to ${LANGUAGES[next].label}`);
    if (window.innerWidth < 1024) setMobileTab('editor');
  }, [language]);

  const handleSelectSnippet = useCallback((snippet: Snippet) => {
    const snippetLanguage = snippet.language ?? 'javascript';
    runIdRef.current += 1;
    isRunningRef.current = false;
    setIsRunning(false);
    setLogs([]);
    setExecutionTime(undefined);
    setLanguageState(snippetLanguage);
    setCodeMap((prev) => ({ ...prev, [snippetLanguage]: snippet.code }));
    setStatus(`Loaded “${snippet.title}”`);
    setErrorLine(undefined);
    if (window.innerWidth < 1024) setMobileTab('editor');
    window.setTimeout(() => editorRef.current?.focus(), 60);
  }, []);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCodeMap((prev) => ({ ...prev, [language]: newCode }));
      setErrorLine(undefined);
    },
    [language]
  );

  const handleSaveCurrentAsSnippet = useCallback(
    (title: string, description: string) => {
      const newSnippet: Snippet = {
        id: `custom-${Date.now()}`,
        title,
        category: 'Saved',
        description,
        code,
        language,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setSnippets((prev) => {
        const updated = [...prev, newSnippet];
        saveJSON(STORAGE_KEYS.snippets, updated.filter((snippet) => snippet.isCustom));
        return updated;
      });

      showToast('Snippet saved');
      setStatus(`Saved “${title}”`);
    },
    [code, language, showToast]
  );

  const handleDeleteSnippet = useCallback(
    (id: string) => {
      setSnippets((prev) => {
        const updated = prev.filter((snippet) => snippet.id !== id);
        saveJSON(STORAGE_KEYS.snippets, updated.filter((snippet) => snippet.isCustom));
        return updated;
      });
      showToast('Snippet deleted', 'info');
    },
    [showToast]
  );

  const handleFileNameChange = useCallback(
    (nextName: string) => {
      const next = sanitizeFileName(nextName, LANGUAGES[language].fileName);
      if (next === fileNames[language]) return;

      setFileNames((prev) => ({ ...prev, [language]: next }));
      setStatus(`Renamed to ${next}`);
    },
    [fileNames, language]
  );

  const handleDownloadCode = useCallback(() => {
    const { id } = LANGUAGES[language];
    const mime =
      id === 'javascript' ? 'text/javascript;charset=utf-8' : 'text/plain;charset=utf-8';
    const blob = new Blob([code], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`${fileName} downloaded`);
  }, [code, fileName, language, showToast]);

  const handleCopyShareLink = useCallback(async () => {
    try {
      const encoded = btoa(encodeURIComponent(code));
      const base = `${window.location.origin}${window.location.pathname}`;
      const hash = `#code=${encoded}&lang=${language}`;
      const shareUrl = `${base}${hash}`;

      window.history.replaceState(null, '', hash);
      const ok = await copyText(shareUrl);

      if (!ok) {
        showToast('Could not access the clipboard', 'error');
        return;
      }

      setIsCopiedShare(true);
      showToast('Share link copied to clipboard');
      window.setTimeout(() => setIsCopiedShare(false), 2000);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      showToast('Could not create a share link', 'error');
    }
  }, [code, language, showToast]);

  const handleToggleAppearance = useCallback(() => {
    setTheme((current) => (current === 'light' ? lastDarkThemeRef.current : 'light'));
  }, []);

  const handleToggleAutoSuggestions = useCallback(() => {
    setSettings((current) => ({ ...current, autoSuggestions: !current.autoSuggestions }));
  }, []);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // Below 1024px the editor and console share one panel with tabs, so the saved
  // desktop layout (split/stacked/focus) must not hide one of them.
  const effectiveLayout: LayoutMode = isDesktop ? layoutMode : 'split';
  const isStacked = effectiveLayout === 'stacked';
  const showsEditorPanel = effectiveLayout !== 'console-only';
  const showsConsolePanel = effectiveLayout !== 'editor-only';
  const lineCount = code.split('\n').length;

  return (
    <div
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden font-sans transition-colors duration-200"
      style={{
        backgroundColor: currentThemeConfig.bg,
        backgroundImage: `radial-gradient(900px 480px at 12% -12%, ${withAlpha(
          currentThemeConfig.accent,
          0.08
        )}, transparent 65%)`,
        color: currentThemeConfig.text,
        colorScheme: currentThemeConfig.id === 'light' ? 'light' : 'dark',
        ...cssVars,
      }}
    >
      <Header
        theme={theme}
        onToggleAppearance={handleToggleAppearance}
        language={language}
        setLanguage={handleLanguageChange}
        fileName={fileName}
        layoutMode={layoutMode}
        setLayoutMode={setLayoutMode}
        snippets={snippets}
        onSelectSnippet={handleSelectSnippet}
        onRun={handleRunCode}
        onOpenSnippetsModal={() => setIsSnippetsModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onDownloadCode={handleDownloadCode}
        onCopyShareLink={handleCopyShareLink}
        isCopiedShare={isCopiedShare}
        isRunning={isRunning}
        autoSuggestions={settings.autoSuggestions}
        onToggleAutoSuggestions={handleToggleAutoSuggestions}
        mobileTab={mobileTab}
        setMobileTab={setMobileTab}
        logsCount={logs.filter((log) => log.type !== 'clear').length}
      />

      {/* Workspace */}
      <main
        className={`relative flex min-h-0 flex-1 overflow-hidden ${
          isStacked ? 'flex-col' : 'flex-col lg:flex-row'
        }`}
      >
        {/* Editor panel */}
        {showsEditorPanel && (
          <div
            className={`min-h-0 min-w-0 ${isStacked ? 'h-1/2 w-full' : 'h-full'} ${
              effectiveLayout === 'editor-only' ? 'w-full' : isStacked ? '' : 'w-full lg:w-1/2'
            } ${showsConsolePanel && mobileTab === 'console' ? 'hidden lg:block' : 'block'}`}
          >
            <CodeEditor
              ref={editorRef}
              code={code}
              setCode={handleCodeChange}
              onRun={handleRunCode}
              settings={settings}
              theme={currentThemeConfig}
              language={language}
              fileName={fileName}
              onFileNameChange={handleFileNameChange}
              setCursorLine={setCursorLine}
              errorLine={errorLine}
            />
          </div>
        )}

        {/* Console panel */}
        {showsConsolePanel && (
          <div
            className={`flex min-h-0 min-w-0 flex-col ${
              isStacked
                ? 'h-1/2 w-full border-t'
                : effectiveLayout === 'console-only'
                  ? 'h-full w-full'
                  : 'h-full w-full border-t lg:w-1/2 lg:border-l lg:border-t-0'
            } ${showsEditorPanel && mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}
            style={{ borderColor: currentThemeConfig.border }}
          >
            <div className="min-h-0 flex-1 overflow-hidden">
              <ConsoleOutput
                logs={logs}
                onClear={handleClearOutput}
                theme={currentThemeConfig}
                executionTime={executionTime}
                fontSize={settings.fontSize}
                language={language}
              />
            </div>

            {language === 'javascript' && (
              <InteractiveRepl
                onEvaluate={handleEvaluateRepl}
                theme={currentThemeConfig}
                fontSize={settings.fontSize}
              />
            )}
          </div>
        )}
      </main>

      <Footer
        status={status}
        cursorLine={cursorLine}
        theme={currentThemeConfig}
        isRunning={isRunning}
        charCount={code.length}
        lineCount={lineCount}
        language={language}
        fileName={fileName}
      />

      <SnippetsModal
        isOpen={isSnippetsModalOpen}
        onClose={() => setIsSnippetsModalOpen(false)}
        snippets={snippets}
        onSelectSnippet={handleSelectSnippet}
        onSaveCurrentAsSnippet={handleSaveCurrentAsSnippet}
        onDeleteSnippet={handleDeleteSnippet}
        currentCode={code}
        currentLanguage={language}
        theme={currentThemeConfig}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        setSettings={setSettings}
        theme={currentThemeConfig}
        themeId={theme}
        setTheme={setTheme}
      />

      <Toast toast={toast} />

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
