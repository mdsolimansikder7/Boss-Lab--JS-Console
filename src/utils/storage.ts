const STORAGE_KEY_CODE = 'js_console_saved_code';
const STORAGE_KEY_SNIPPETS = 'js_console_custom_snippets';
const STORAGE_KEY_THEME = 'js_console_theme';
const STORAGE_KEY_SETTINGS = 'js_console_settings';
const STORAGE_KEY_LAYOUT = 'js_console_layout';
const STORAGE_KEY_LANGUAGE = 'js_console_language';
const STORAGE_KEY_CODE_MAP = 'js_console_code_map';
const STORAGE_KEY_FILE_NAMES = 'js_console_file_names';

export const STORAGE_KEYS = {
  code: STORAGE_KEY_CODE,
  codeMap: STORAGE_KEY_CODE_MAP,
  snippets: STORAGE_KEY_SNIPPETS,
  theme: STORAGE_KEY_THEME,
  settings: STORAGE_KEY_SETTINGS,
  layout: STORAGE_KEY_LAYOUT,
  language: STORAGE_KEY_LANGUAGE,
  fileNames: STORAGE_KEY_FILE_NAMES,
};

/**
 * localStorage can throw (private mode, storage disabled, quota). Every read
 * and write in the app funnels through here so a blocked storage API can never
 * take down the whole playground.
 */
export function loadString(key: string, fallback: string): string {
  try {
    const value = localStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}
