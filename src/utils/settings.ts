import { EditorSettings } from '../types';
import { loadJSON, STORAGE_KEYS } from './storage';

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  autoSuggestions: true,
  autoCloseBrackets: true,
  wordWrap: false,
  lineNumbers: true,
  showLineHighlight: true,
};

export function loadEditorSettings(): EditorSettings {
  const stored = loadJSON<Partial<EditorSettings>>(STORAGE_KEYS.settings, {});
  // Merge over the defaults so newly added settings always have a value.
  return { ...DEFAULT_EDITOR_SETTINGS, ...stored };
}
