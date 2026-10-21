import { LanguageId } from '../types';

export interface LanguageConfig {
  id: LanguageId;
  /** Full display name. */
  label: string;
  /** Compact label used in tight toolbars. */
  short: string;
  fileName: string;
  /** Language id understood by Monaco. */
  monacoLanguage: string;
  /** Wandbox compiler id — only set for languages that run remotely. */
  wandboxCompiler?: string;
  /** Extra compiler flags passed to the remote compiler. */
  compilerOptions?: string;
  color: string;
  /** Short note shown in the language picker. */
  hint: string;
  template: string;
}

const PYTHON_TEMPLATE = `# Python 3 playground
name = "Boss Lab"


def greet(who: str) -> str:
    return f"Hello, {who}!"


print(greet(name))

for number in range(1, 6):
    print(f"{number} squared is {number ** 2}")
`;

const C_TEMPLATE = `#include <stdio.h>

int main(void) {
    printf("Hello from C!\\n");

    for (int i = 1; i <= 5; i++) {
        printf("%d squared is %d\\n", i, i * i);
    }

    return 0;
}
`;

const CPP_TEMPLATE = `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello from C++!" << std::endl;

    std::vector<int> squares;
    for (int i = 1; i <= 5; ++i) {
        squares.push_back(i * i);
    }

    for (int value : squares) {
        std::cout << value << ' ';
    }
    std::cout << std::endl;

    return 0;
}
`;

const JS_TEMPLATE = `// JavaScript playground
const languages = ["JavaScript", "Python", "C", "C++"];

console.log("Hello from Boss Lab!");
languages.forEach((language, index) => {
  console.log(\`\${index + 1}. \${language}\`);
});
`;

export const LANGUAGES: Record<LanguageId, LanguageConfig> = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    short: 'JS',
    fileName: 'script.js',
    monacoLanguage: 'javascript',
    color: '#f59e0b',
    hint: 'Runs instantly in your browser',
    template: JS_TEMPLATE,
  },
  python: {
    id: 'python',
    label: 'Python',
    short: 'PY',
    fileName: 'main.py',
    monacoLanguage: 'python',
    wandboxCompiler: 'cpython-3.12.7',
    color: '#3b82f6',
    hint: 'CPython 3.12 sandbox',
    template: PYTHON_TEMPLATE,
  },
  cpp: {
    id: 'cpp',
    label: 'C++',
    short: 'C++',
    fileName: 'main.cpp',
    monacoLanguage: 'cpp',
    wandboxCompiler: 'gcc-13.2.0',
    compilerOptions: '-std=c++20\n-O2',
    color: '#8b5cf6',
    hint: 'GCC 13.2 with C++20',
    template: CPP_TEMPLATE,
  },
  c: {
    id: 'c',
    label: 'C',
    short: 'C',
    fileName: 'main.c',
    monacoLanguage: 'c',
    wandboxCompiler: 'gcc-13.2.0-c',
    compilerOptions: '-std=c17\n-O2',
    color: '#64748b',
    hint: 'GCC 13.2 C compiler',
    template: C_TEMPLATE,
  },
};

export const LANGUAGE_ORDER: LanguageId[] = ['javascript', 'python', 'cpp', 'c'];

export const isLanguageId = (value: unknown): value is LanguageId =>
  typeof value === 'string' && LANGUAGE_ORDER.includes(value as LanguageId);

export const isRemoteLanguage = (language: LanguageId): boolean =>
  Boolean(LANGUAGES[language]?.wandboxCompiler);

/**
 * Keep a user-typed file name safe for downloads on every OS. Path separators
 * and reserved characters are removed, and an empty result falls back to the
 * language's default file name.
 */
export const sanitizeFileName = (value: string, fallback: string): string => {
  if (typeof value !== 'string') return fallback;

  const cleaned = value
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
    .slice(0, 64);

  return cleaned || fallback;
};
