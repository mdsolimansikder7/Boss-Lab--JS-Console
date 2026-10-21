export type LanguageId = 'javascript' | 'python' | 'cpp' | 'c';

export type LogType = 'log' | 'warn' | 'error' | 'info' | 'table' | 'clear' | 'system' | 'result';

export interface LogEntry {
  id: string;
  type: LogType;
  content: any;
  timestamp: string;
  duration?: number;
  label?: string;
  stack?: string;
  countKey?: string;
  countVal?: number;
  line?: number;
}

export interface Snippet {
  id: string;
  title: string;
  category: 'Beginner' | 'Data Structures' | 'Async & Fetch' | 'Algorithms' | 'Fun & Utility' | 'Saved';
  description: string;
  code: string;
  language?: LanguageId;
  isCustom?: boolean;
  createdAt?: string;
}

export type ThemeId =
  | 'midnight'
  | 'github-dark'
  | 'monokai'
  | 'matrix'
  | 'dracula'
  | 'nord'
  | 'sunset'
  | 'light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  bg: string;
  panelBg: string;
  editorBg: string;
  consoleBg: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  lineNumBg: string;
  lineNumText: string;
  activeLineBg: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  autoCloseBrackets: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  showLineHighlight: boolean;
}

export type LayoutMode = 'split' | 'editor-only' | 'console-only' | 'stacked';
