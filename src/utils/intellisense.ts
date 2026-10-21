import type * as MonacoTypes from 'monaco-editor';
import {
  C_COMPLETIONS,
  CPP_ALL_MEMBERS,
  CPP_COMPLETIONS,
  CPP_MEMBERS,
  JS_COMPLETIONS,
  PYTHON_ALL_MEMBERS,
  PYTHON_COMPLETIONS,
  PYTHON_MEMBERS,
  type CompletionKind,
  type CompletionSpec,
  type CppContainer,
  type PythonContainer,
} from '../data/completions';

type Monaco = typeof MonacoTypes;
type CompletionItem = MonacoTypes.languages.CompletionItem;
type CompletionItemKind = MonacoTypes.languages.CompletionItemKind;
type ITextModel = MonacoTypes.editor.ITextModel;
type Position = MonacoTypes.Position;

interface MemberProvider {
  groups: Partial<Record<string, CompletionSpec[]>>;
  all: CompletionSpec[];
  infer: (model: ITextModel, position: Position, receiver?: string) => string | null;
}

interface ProviderConfig {
  languageId: string;
  base: CompletionSpec[];
  members?: MemberProvider;
  triggerCharacters?: string[];
}

const CONFIGURED_FLAG = '__bosslabIntelliSenseConfigured';

function configureTypeScript(monaco: Monaco) {
  // Monaco 0.56 exposes the language service at the top level. Older builds
  // (and the CDN loader) keep it under `languages.typescript`.
  const ts =
    monaco.typescript ??
    (monaco.languages as unknown as { typescript?: typeof MonacoTypes.typescript })
      .typescript;
  if (!ts || !ts.javascriptDefaults) return;

  const compilerOptions: MonacoTypes.typescript.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    lib: ['es2022', 'dom', 'dom.iterable'],
    allowJs: true,
    checkJs: false,
    allowNonTsExtensions: true,
    noEmit: true,
    strict: false,
  };

  for (const defaults of [ts.javascriptDefaults, ts.typescriptDefaults]) {
    defaults.setCompilerOptions(compilerOptions);
    defaults.setEagerModelSync(true);
  }

  // Keep the worker's diagnostics on, but do not force type-checking on plain
  // JavaScript. This gives complete array/object/DOM completions without
  // painting the playground red for every untyped variable.
  ts.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}

function kindOf(monaco: Monaco, kind: CompletionKind = 'snippet'): CompletionItemKind {
  const K = monaco.languages.CompletionItemKind;

  switch (kind) {
    case 'method':
      return K.Method;
    case 'function':
      return K.Function;
    case 'keyword':
      return K.Keyword;
    case 'class':
      return K.Class;
    case 'module':
      return K.Module;
    case 'variable':
      return K.Variable;
    case 'property':
      return K.Property;
    case 'constant':
      return K.Constant;
    case 'typeParameter':
      return K.TypeParameter;
    default:
      return K.Snippet;
  }
}

function defaultSort(kind: CompletionKind, label: string): string {
  const prefix =
    kind === 'snippet'
      ? '0'
      : kind === 'function'
        ? '1'
        : kind === 'method'
          ? '2'
          : kind === 'keyword'
            ? '5'
            : '3';

  return `${prefix}_${label.toLowerCase()}`;
}

function makeItem(
  monaco: Monaco,
  range: MonacoTypes.IRange,
  spec: CompletionSpec
): CompletionItem {
  const kind = spec.kind ?? 'snippet';
  const isSnippet = /\$\{?\d/.test(spec.insertText);

  return {
    label: spec.label,
    kind: kindOf(monaco, kind),
    detail: spec.detail,
    documentation: spec.documentation ? { value: spec.documentation } : undefined,
    insertText: spec.insertText,
    insertTextRules: isSnippet
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    range,
    sortText: spec.sortText ?? defaultSort(kind, spec.label),
  };
}

function wordRange(
  monaco: Monaco,
  model: ITextModel,
  position: Position
): MonacoTypes.IRange {
  const word = model.getWordUntilPosition(position);
  return new monaco.Range(
    position.lineNumber,
    word.startColumn,
    position.lineNumber,
    word.endColumn
  );
}

function getMemberContext(model: ITextModel, position: Position) {
  const word = model.getWordUntilPosition(position);
  const line = model.getLineContent(position.lineNumber);
  const beforeWord = line.slice(0, Math.max(0, word.startColumn - 1));
  const beforeCursor = line.slice(0, Math.max(0, position.column - 1));

  const afterDot = /(?:\?\.|\.)\s*$/.test(beforeWord);
  const afterArrow = /->\s*$/.test(beforeWord);
  const receiverMatch =
    /([A-Za-z_$][\w$]*)\s*(?:\?\.|\.|->)\s*[A-Za-z_$]*$/.exec(beforeCursor);

  return {
    afterDot,
    afterArrow,
    afterMember: afterDot || afterArrow,
    receiver: receiverMatch?.[1],
  };
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function pythonReceiverKind(
  model: ITextModel,
  _position: Position,
  receiver?: string
): PythonContainer | null {
  if (!receiver) return null;

  const id = escapeRegExp(receiver);
  const text = model.getValue();
  const assignment = new RegExp(
    `(?:^|\\n)\\s*${id}\\s*(?::[^=\\n]+)?=\\s*([^\\n#]+)`,
    'm'
  ).exec(text);

  if (!assignment) return null;
  const rhs = assignment[1].trim();

  if (rhs.startsWith('[') || /^(list|sorted)\s*\(/.test(rhs)) return 'list';
  if (rhs.startsWith('{')) {
    const closing = rhs.indexOf('}');
    const body = closing === -1 ? rhs.slice(1) : rhs.slice(1, closing);
    return body.includes(':') ? 'dict' : 'set';
  }
  if (rhs.startsWith('(') || /^tuple\s*\(/.test(rhs)) return 'tuple';
  if (/^(f?["'])/.test(rhs) || /^str\s*\(/.test(rhs)) return 'str';
  if (/^set\s*\(/.test(rhs)) return 'set';
  if (/^dict\s*\(/.test(rhs)) return 'dict';

  return null;
}

const CPP_CONTAINER_ALIASES: Record<string, CppContainer> = {
  vector: 'vector',
  string: 'string',
  map: 'map',
  unordered_map: 'map',
  set: 'set',
  unordered_set: 'set',
  deque: 'deque',
  list: 'list',
  array: 'array',
};

function cppReceiverKind(
  model: ITextModel,
  _position: Position,
  receiver?: string
): CppContainer | null {
  if (!receiver) return null;

  const id = escapeRegExp(receiver);
  const text = model.getValue();
  const typePattern =
    '(vector|string|map|unordered_map|set|unordered_set|deque|list|array)';

  const declaration = new RegExp(
    `\\b(?:std::)?${typePattern}\\s*(?:<[^;=()]*>)?[\\s&*]+${id}\\b`
  ).exec(text);
  if (declaration) return CPP_CONTAINER_ALIASES[declaration[1]] ?? null;

  const initializer = new RegExp(
    `\\b${id}\\s*=\\s*(?:std::)?${typePattern}\\b`
  ).exec(text);
  if (initializer) return CPP_CONTAINER_ALIASES[initializer[1]] ?? null;

  return null;
}

function registerProvider(monaco: Monaco, config: ProviderConfig) {
  monaco.languages.registerCompletionItemProvider(config.languageId, {
    triggerCharacters: config.triggerCharacters,
    provideCompletionItems(model, position) {
      const range = wordRange(monaco, model, position);
      const context = getMemberContext(model, position);

      if (context.afterMember) {
        // JavaScript members (including every Array method) come from the
        // TypeScript worker; returning an empty list lets that provider win.
        if (!config.members) return { suggestions: [] };

        const inferred = config.members.infer(model, position, context.receiver);
        const specs =
          (inferred && config.members.groups[inferred]) ||
          config.members.all;

        return {
          suggestions: specs.map((spec) => makeItem(monaco, range, spec)),
        };
      }

      return {
        suggestions: config.base.map((spec) => makeItem(monaco, range, spec)),
      };
    },
  });
}

/**
 * Register richer completions once per Monaco instance. Monaco's TypeScript
 * worker already supplies type-aware JavaScript suggestions; the custom
 * providers add VS Code-style snippets plus Python/C/C++ APIs and methods.
 */
export function configureIntelliSense(monaco: Monaco) {
  const target = monaco as unknown as Record<string, unknown>;
  if (target[CONFIGURED_FLAG]) return;
  target[CONFIGURED_FLAG] = true;

  configureTypeScript(monaco);

  registerProvider(monaco, {
    languageId: 'javascript',
    base: JS_COMPLETIONS,
  });

  registerProvider(monaco, {
    languageId: 'python',
    base: PYTHON_COMPLETIONS,
    members: {
      groups: PYTHON_MEMBERS,
      all: PYTHON_ALL_MEMBERS,
      infer: pythonReceiverKind,
    },
    triggerCharacters: ['.'],
  });

  registerProvider(monaco, {
    languageId: 'cpp',
    base: CPP_COMPLETIONS,
    members: {
      groups: CPP_MEMBERS,
      all: CPP_ALL_MEMBERS,
      infer: cppReceiverKind,
    },
    triggerCharacters: ['.'],
  });

  registerProvider(monaco, {
    languageId: 'c',
    base: C_COMPLETIONS,
  });
}
