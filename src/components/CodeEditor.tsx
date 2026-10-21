import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Editor, { BeforeMount, OnMount } from '@monaco-editor/react';
import type * as MonacoTypes from 'monaco-editor';
import { FileCode, Search, Wand2, Copy, Check, UploadCloud, Pencil } from 'lucide-react';
import { EditorSettings, LanguageId, ThemeConfig } from '../types';
import { isLightTheme, withHexAlpha } from '../utils/theme';
import { copyText } from '../utils/clipboard';
import { LANGUAGES } from '../utils/languages';
import { configureIntelliSense } from '../utils/intellisense';

interface CodeEditorProps {
  code: string;
  setCode: (c: string) => void;
  onRun: () => void;
  settings: EditorSettings;
  theme: ThemeConfig;
  language: LanguageId;
  fileName: string;
  onFileNameChange: (name: string) => void;
  setCursorLine: (line: number) => void;
  errorLine?: number;
}

export interface CodeEditorRef {
  focus: () => void;
  formatCode: () => void;
}

const editorThemeName = (theme: ThemeConfig) => `bosslab-${theme.id}`;

const monacoColor = (color: string) => color.replace('#', '').slice(0, 6);

function defineEditorTheme(monaco: typeof MonacoTypes, theme: ThemeConfig) {
  const light = isLightTheme(theme.id);
  const accentSoft = withHexAlpha(theme.accent, light ? 0.1 : 0.14);
  const accentMedium = withHexAlpha(theme.accent, light ? 0.16 : 0.2);
  const accentLine = withHexAlpha(theme.accent, light ? 0.45 : 0.55);
  const hoverSoft = withHexAlpha(theme.accent, light ? 0.06 : 0.1);

  monaco.editor.defineTheme(editorThemeName(theme), {
    base: light ? 'vs' : 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: monacoColor(theme.textMuted), fontStyle: 'italic' },
      { token: 'keyword', foreground: monacoColor(theme.accent) },
      { token: 'string', foreground: light ? '0f766e' : 'a5e8c8' },
      { token: 'number', foreground: light ? 'b45309' : 'fbbf24' },
      { token: 'type', foreground: light ? '7c3aed' : 'c4b5fd' },
    ],
    colors: {
      'editor.background': theme.editorBg,
      'editor.foreground': theme.text,
      'editorLineNumber.foreground': theme.lineNumText,
      'editorLineNumber.activeForeground': theme.accent,
      'editor.lineHighlightBackground': theme.activeLineBg,
      'editor.lineHighlightBorder': '#00000000',
      'editor.selectionBackground': withHexAlpha(theme.accent, 0.24),
      'editor.inactiveSelectionBackground': withHexAlpha(theme.accent, 0.14),
      'editor.selectionHighlightBackground': withHexAlpha(theme.accent, 0.16),
      'editorCursor.foreground': theme.accent,
      'editor.findMatchBackground': withHexAlpha(theme.accent, 0.35),
      'editor.findMatchHighlightBackground': withHexAlpha(theme.accent, 0.18),
      'editorIndentGuide.background1': withHexAlpha(theme.text, 0.07),
      'editorIndentGuide.activeBackground1': withHexAlpha(theme.accent, 0.3),
      'editorBracketMatch.background': withHexAlpha(theme.accent, 0.16),
      'editorBracketMatch.border': withHexAlpha(theme.accent, 0.5),
      'editorGutter.background': theme.editorBg,

      // Widgets, suggestion popup, hover cards and their inner lists. Monaco
      // otherwise inherits the blue/orange VS defaults, which clash with the
      // app themes (especially in light mode).
      'focusBorder': theme.accent,
      'widget.shadow': light ? '#0f172a26' : '#00000066',
      'editorWidget.background': theme.panelBg,
      'editorWidget.foreground': theme.text,
      'editorWidget.border': theme.border,
      'editorWidget.resizeBorder': theme.accent,
      'editorSuggestWidget.background': theme.panelBg,
      'editorSuggestWidget.border': theme.border,
      'editorSuggestWidget.foreground': theme.text,
      'editorSuggestWidget.highlightForeground': theme.accent,
      'editorSuggestWidget.focusHighlightForeground': theme.accent,
      'editorSuggestWidget.selectedBackground': accentMedium,
      'editorSuggestWidget.selectedForeground': theme.text,
      'editorSuggestWidget.selectedIconForeground': theme.accent,
      'editorSuggestWidgetStatus.foreground': theme.textMuted,
      'editorHoverWidget.background': theme.panelBg,
      'editorHoverWidget.foreground': theme.text,
      'editorHoverWidget.border': theme.border,
      'editorHoverWidget.statusBarBackground': theme.bg,
      'editorGhostText.foreground': withHexAlpha(theme.textMuted, 0.85),
      'editorGhostText.background': '#00000000',
      'editorLightBulb.foreground': theme.accent,
      'textLink.foreground': theme.accent,
      'textLink.activeForeground': theme.accent,
      'textPreformat.foreground': theme.accent,
      'textCodeBlock.background': withHexAlpha(theme.text, light ? 0.05 : 0.08),
      'textBlockQuote.background': accentSoft,
      'textBlockQuote.border': theme.accent,

      // Suggestion list rows (also used by the command palette and quick input).
      'list.hoverBackground': hoverSoft,
      'list.hoverForeground': theme.text,
      'list.focusBackground': accentSoft,
      'list.focusForeground': theme.text,
      'list.focusOutline': accentLine,
      'list.inactiveFocusOutline': withHexAlpha(theme.accent, 0.3),
      'list.activeSelectionBackground': accentMedium,
      'list.activeSelectionForeground': theme.text,
      'list.activeSelectionIconForeground': theme.accent,
      'list.inactiveSelectionBackground': accentSoft,
      'list.inactiveSelectionForeground': theme.text,
      'list.inactiveSelectionIconForeground': theme.accent,
      'list.highlightForeground': theme.accent,
      'list.focusHighlightForeground': theme.accent,

      // Symbol icons shown next to each completion.
      'symbolIcon.arrayForeground': theme.text,
      'symbolIcon.booleanForeground': theme.text,
      'symbolIcon.classForeground': theme.accent,
      'symbolIcon.colorForeground': theme.text,
      'symbolIcon.constantForeground': theme.text,
      'symbolIcon.constructorForeground': theme.accent,
      'symbolIcon.enumeratorForeground': theme.accent,
      'symbolIcon.enumeratorMemberForeground': theme.text,
      'symbolIcon.eventForeground': theme.text,
      'symbolIcon.fieldForeground': theme.text,
      'symbolIcon.fileForeground': theme.text,
      'symbolIcon.folderForeground': theme.text,
      'symbolIcon.functionForeground': theme.accent,
      'symbolIcon.interfaceForeground': theme.accent,
      'symbolIcon.keyForeground': theme.text,
      'symbolIcon.keywordForeground': theme.accent,
      'symbolIcon.methodForeground': theme.accent,
      'symbolIcon.moduleForeground': theme.accent,
      'symbolIcon.namespaceForeground': theme.accent,
      'symbolIcon.nullForeground': theme.textMuted,
      'symbolIcon.numberForeground': theme.text,
      'symbolIcon.objectForeground': theme.text,
      'symbolIcon.operatorForeground': theme.text,
      'symbolIcon.packageForeground': theme.accent,
      'symbolIcon.propertyForeground': theme.text,
      'symbolIcon.referenceForeground': theme.text,
      'symbolIcon.snippetForeground': theme.accent,
      'symbolIcon.stringForeground': theme.text,
      'symbolIcon.structForeground': theme.accent,
      'symbolIcon.textForeground': theme.text,
      'symbolIcon.typeParameterForeground': theme.accent,
      'symbolIcon.unitForeground': theme.text,
      'symbolIcon.variableForeground': theme.text,

      'input.background': theme.bg,
      'input.foreground': theme.text,
      'input.border': theme.border,
      'input.placeholderForeground': theme.textMuted,
      'inputOption.activeBackground': accentSoft,
      'inputOption.activeForeground': theme.text,
      'inputOption.activeBorder': theme.accent,
      'inputOption.hoverBackground': hoverSoft,
      'dropdown.background': theme.panelBg,
      'dropdown.foreground': theme.text,
      'dropdown.border': theme.border,
      'menu.background': theme.panelBg,
      'menu.foreground': theme.text,
      'menu.border': theme.border,
      'menu.selectionBackground': accentMedium,
      'menu.selectionForeground': theme.text,
      'menu.selectionBorder': theme.accent,
      'scrollbarSlider.background': withHexAlpha(theme.text, 0.12),
      'scrollbarSlider.hoverBackground': withHexAlpha(theme.text, 0.2),
      'scrollbarSlider.activeBackground': withHexAlpha(theme.text, 0.28),
    },
  });
}

export const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ code, setCode, onRun, settings, theme, language, fileName, onFileNameChange, setCursorLine, errorLine }, ref) => {
    const editorInstanceRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null);
    const monacoInstanceRef = useRef<typeof MonacoTypes | null>(null);
    const decorationsRef = useRef<string[]>([]);
    const dragDepth = useRef(0);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const cancelRenameRef = useRef(false);

    const [copied, setCopied] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [draftName, setDraftName] = useState(fileName);

    const lineCount = code.split('\n').length;
    const light = isLightTheme(theme.id);
    const languageConfig = LANGUAGES[language];

    // Fallback formatter used only when Monaco's JS formatter is unavailable.
    // Quotes and comments are stripped before counting brackets so `"}"` does
    // not corrupt the indentation (the old formatter did exactly that).
    const formatFallback = () => {
      const tab = ' '.repeat(settings.tabSize);
      let indentLevel = 0;

      const formatted = code.split('\n').map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';

        const withoutStrings = trimmed
          .replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""')
          .replace(/\/\/.*$/, '');

        if (/^[}\])]/.test(withoutStrings)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const result = tab.repeat(indentLevel) + trimmed;

        const openBrackets = (withoutStrings.match(/[{[\(]/g) || []).length;
        const closeBrackets = (withoutStrings.match(/[}\])]/g) || []).length;
        indentLevel = Math.max(0, indentLevel + openBrackets - closeBrackets);

        return result;
      });

      setCode(formatted.join('\n'));
    };

    const formatJSCode = async () => {
      const editor = editorInstanceRef.current;
      const action = editor?.getAction('editor.action.formatDocument');
      if (action) {
        try {
          await action.run();
          return;
        } catch {
          /* no formatter registered — fall through */
        }
      }
      formatFallback();
    };

    useImperativeHandle(ref, () => ({
      focus: () => editorInstanceRef.current?.focus(),
      formatCode: () => {
        void formatJSCode();
      },
    }));

    const handleCopy = async () => {
      const ok = await copyText(code);
      if (!ok) return;
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    };

    const openFind = () => {
      const editor = editorInstanceRef.current;
      if (!editor) return;
      editor.focus();
      const action = editor.getAction('actions.find');
      void action?.run();
    };

    const readFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCode(event.target.result);
        }
      };
      reader.readAsText(file);
    };

    const handleDragEnter = (event: React.DragEvent) => {
      event.preventDefault();
      if (!event.dataTransfer?.types?.includes('Files')) return;
      dragDepth.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
      event.preventDefault();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
      event.preventDefault();
      dragDepth.current = 0;
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) readFile(file);
    };

    const beforeMount: BeforeMount = (monaco) => {
      monacoInstanceRef.current = monaco;
      defineEditorTheme(monaco, theme);
      configureIntelliSense(monaco);
    };

    const handleEditorMount: OnMount = (editorInstance, monaco) => {
      editorInstanceRef.current = editorInstance;
      monacoInstanceRef.current = monaco;

      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun();
      });

      editorInstance.onDidChangeCursorPosition((event) => {
        setCursorLine(event.position.lineNumber);
      });
    };

    // Keep Monaco's colors in sync with the selected app theme.
    useEffect(() => {
      const monaco = monacoInstanceRef.current;
      if (!monaco) return;

      defineEditorTheme(monaco, theme);
      monaco.editor.setTheme(editorThemeName(theme));
    }, [theme]);

    // Highlight the exact line where a runtime error occurred.
    useEffect(() => {
      const editor = editorInstanceRef.current;
      const monaco = monacoInstanceRef.current;
      if (!editor || !monaco) return;

      const model = editor.getModel();
      if (!model) return;

      if (errorLine && errorLine >= 1 && errorLine <= model.getLineCount()) {
        const lineLength = model.getLineMaxColumn(errorLine);

        monaco.editor.setModelMarkers(model, 'js-console-runtime', [
          {
            startLineNumber: errorLine,
            startColumn: 1,
            endLineNumber: errorLine,
            endColumn: lineLength,
            message: 'Execution error occurred on this line',
            severity: monaco.MarkerSeverity.Error,
          },
        ]);

        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
          {
            range: new monaco.Range(errorLine, 1, errorLine, 1),
            options: {
              isWholeLine: true,
              className: 'error-line-highlight',
              glyphMarginClassName: 'error-line-glyph',
            },
          },
        ]);

        editor.revealLineInCenter(errorLine);
      } else {
        monaco.editor.setModelMarkers(model, 'js-console-runtime', []);
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      }
    }, [errorLine]);

    // Keep the inline rename field in sync when the language (and therefore
    // the active file name) changes.
    useEffect(() => setDraftName(fileName), [fileName]);

    useEffect(() => {
      if (!editingName) return;
      const input = nameInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    }, [editingName]);

    const startRenaming = () => {
      cancelRenameRef.current = false;
      setDraftName(fileName);
      setEditingName(true);
    };

    const commitFileName = () => {
      if (cancelRenameRef.current) {
        cancelRenameRef.current = false;
        setEditingName(false);
        return;
      }

      const next = draftName.trim();
      onFileNameChange(next || fileName);
      setDraftName(next || fileName);
      setEditingName(false);
    };

    const cancelRenaming = () => {
      cancelRenameRef.current = true;
      setDraftName(fileName);
      setEditingName(false);
    };

    return (
      <div
        className="relative flex h-full w-full flex-col overflow-hidden border-r"
        style={{ backgroundColor: theme.editorBg, borderColor: theme.border, color: theme.text }}
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Editor toolbar */}
        <div
          className="flex shrink-0 select-none items-center justify-between gap-2 border-b px-3 py-1.5 font-mono text-xs"
          style={{ backgroundColor: theme.panelBg, borderColor: theme.border }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {editingName ? (
              <div
                className="flex min-w-0 items-center gap-1.5 rounded-md px-2 py-1"
                style={{
                  backgroundColor: withHexAlpha(theme.accent, light ? 0.1 : 0.13),
                  border: `1px solid ${withHexAlpha(theme.accent, 0.45)}`,
                  boxShadow: `0 0 0 2px ${withHexAlpha(theme.accent, 0.12)}`,
                }}
              >
                <FileCode className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
                <input
                  ref={nameInputRef}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={commitFileName}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      event.currentTarget.blur();
                    } else if (event.key === 'Escape') {
                      event.preventDefault();
                      cancelRenaming();
                    }
                  }}
                  maxLength={64}
                  spellCheck={false}
                  aria-label="File name"
                  className="w-28 select-text bg-transparent font-mono text-[11px] font-semibold outline-none sm:w-36"
                  style={{ color: theme.accent }}
                />
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: languageConfig.color }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={startRenaming}
                className="group flex min-w-0 max-w-[10rem] items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition-colors hover:brightness-110 sm:max-w-[14rem]"
                style={{
                  backgroundColor: withHexAlpha(theme.accent, light ? 0.1 : 0.13),
                  color: theme.accent,
                  border: `1px solid ${withHexAlpha(theme.accent, 0.2)}`,
                }}
                title="Click to rename the file"
                aria-label={`Rename file ${fileName}`}
              >
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
                <Pencil className="h-2.5 w-2.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: languageConfig.color }}
                />
              </button>
            )}
            <span className="hidden truncate text-[11px] opacity-70 sm:inline" style={{ color: theme.textMuted }}>
              {languageConfig.label} · {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {code.length} chars
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={openFind}
              className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
              title="Find in code (Ctrl + F)"
              aria-label="Find in code"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {language === 'javascript' && (
              <button
                type="button"
                onClick={() => void formatJSCode()}
                className="ui-btn ui-btn--ghost h-7 gap-1 px-1.5 text-[11px]"
                title="Format document (Shift + Alt + F)"
              >
                <Wand2 className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
                <span className="hidden lg:inline">Format</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => void handleCopy()}
              className="ui-btn ui-btn--ghost ui-btn--icon h-7 w-7"
              title="Copy code"
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Editing surface */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={languageConfig.monacoLanguage}
            value={code}
            onChange={(value) => setCode(value ?? '')}
            beforeMount={beforeMount}
            onMount={handleEditorMount}
            theme={editorThemeName(theme)}
            loading={
              <div className="flex h-full items-center justify-center text-xs" style={{ color: theme.textMuted }}>
                Loading editor…
              </div>
            }
            options={{
              fontSize: settings.fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
              fontLigatures: true,
              tabSize: settings.tabSize,
              wordWrap: settings.wordWrap ? 'on' : 'off',
              lineNumbers: settings.lineNumbers ? 'on' : 'off',
              renderLineHighlight: settings.showLineHighlight ? 'line' : 'none',
              autoClosingBrackets: settings.autoCloseBrackets ? 'always' : 'never',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              glyphMargin: true,
              padding: { top: 14, bottom: 14 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true, indentation: true },
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                useShadows: false,
              },
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              fixedOverflowWidgets: true,

              // VS Code-style IntelliSense: suggestions while typing,
              // automatic member lists after `.`, signature help, snippets.
              // Turning auto suggestions off keeps Ctrl+Space working.
              quickSuggestions: settings.autoSuggestions
                ? { other: true, comments: false, strings: false }
                : false,
              quickSuggestionsDelay: 10,
              suggestOnTriggerCharacters: settings.autoSuggestions,
              acceptSuggestionOnEnter: 'on',
              acceptSuggestionOnCommitCharacter: true,
              tabCompletion: 'on',
              snippetSuggestions: 'top',
              suggestSelection: 'first',
              wordBasedSuggestions: 'currentDocument',
              parameterHints: { enabled: settings.autoSuggestions, cycle: true },
              suggest: {
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showDeprecated: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
                insertMode: 'insert',
                filterGraceful: true,
                localityBonus: true,
                shareSuggestSelections: true,
                snippetsPreventQuickSuggestions: false,
                preview: true,
                showStatusBar: true,
              },
              inlineSuggest: { enabled: false },
            }}
          />

          {isDragging && (
            <div
              className="pointer-events-none absolute inset-3 z-20 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed backdrop-blur-sm"
              style={{
                borderColor: theme.accent,
                backgroundColor: withHexAlpha(theme.bg, 0.75),
                color: theme.accent,
              }}
            >
              <UploadCloud className="h-7 w-7" />
              <p className="text-sm font-semibold">Drop a file to load it</p>
              <p className="text-[11px]" style={{ color: theme.textMuted }}>
                .js, .py, .cpp, .c or any text file
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';
