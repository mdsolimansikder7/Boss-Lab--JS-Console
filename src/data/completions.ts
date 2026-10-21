/**
 * Curated IntelliSense entries.
 *
 * JavaScript gets its type-aware completions from Monaco's bundled TypeScript
 * worker, so this file adds the VS Code-style snippets that worker does not
 * provide. Python, C and C++ have no language server in Monaco, so their
 * completion lists live here as well.
 */

export type CompletionKind =
  | 'snippet'
  | 'method'
  | 'function'
  | 'keyword'
  | 'class'
  | 'module'
  | 'variable'
  | 'property'
  | 'constant'
  | 'typeParameter';

export interface CompletionSpec {
  label: string;
  insertText: string;
  detail: string;
  documentation?: string;
  kind?: CompletionKind;
  sortText?: string;
}

const snippet = (
  label: string,
  insertText: string,
  detail: string,
  documentation?: string
): CompletionSpec => ({ label, insertText, detail, documentation, kind: 'snippet' });

const keyword = (label: string, detail = 'Keyword'): CompletionSpec => ({
  label,
  insertText: label,
  detail,
  kind: 'keyword',
});

const func = (
  label: string,
  params: string,
  detail: string,
  documentation?: string
): CompletionSpec => ({
  label,
  insertText: `${label}(${params})`,
  detail,
  documentation,
  kind: 'function',
});

const method = (
  label: string,
  params: string,
  detail: string,
  documentation?: string
): CompletionSpec => ({
  label,
  insertText: `${label}(${params})`,
  detail,
  documentation,
  kind: 'method',
});

/** A standard-library call. The label stays short (`sort`) while the inserted
 * text is fully qualified (`std::sort(...)`), which is what the templates use. */
const stdCall = (
  label: string,
  params: string,
  detail: string,
  documentation?: string
): CompletionSpec => ({
  label,
  insertText: `std::${label}(${params})`,
  detail,
  documentation,
  kind: 'function',
});

/* -------------------------------------------------------------------------- */
/* JavaScript / TypeScript snippets                                            */
/* -------------------------------------------------------------------------- */

export const JS_COMPLETIONS: CompletionSpec[] = [
  snippet(
    'if (condition)',
    'if (${1:condition}) {\n\t$0\n}',
    'If statement',
    '```js\nif (condition) {\n  // ...\n}\n```'
  ),
  snippet(
    'if / else',
    'if (${1:condition}) {\n\t${2:// then}\n} else {\n\t$0\n}',
    'If / else statement'
  ),
  snippet(
    'if / else if / else',
    'if (${1:condition}) {\n\t${2:// ...}\n} else if (${3:other}) {\n\t$0\n} else {\n\t// ...\n}',
    'Multiple conditions'
  ),
  snippet(
    'for (classic)',
    'for (let ${1:i} = 0; ${1:i} < ${2:items.length}; ${1:i}++) {\n\t$0\n}',
    'Classic for loop'
  ),
  snippet(
    'for...of',
    'for (const ${1:item} of ${2:items}) {\n\t$0\n}',
    'Iterate over an iterable'
  ),
  snippet(
    'for...in',
    'for (const ${1:key} in ${2:object}) {\n\t$0\n}',
    'Iterate over object keys'
  ),
  snippet(
    'while (condition)',
    'while (${1:condition}) {\n\t$0\n}',
    'While loop'
  ),
  snippet('do...while', 'do {\n\t$0\n} while (${1:condition});', 'Do-while loop'),
  snippet(
    'switch (value)',
    'switch (${1:value}) {\n\tcase ${2:caseValue}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}',
    'Switch statement'
  ),
  snippet(
    'try...catch',
    'try {\n\t$0\n} catch (${1:error}) {\n\tconsole.error(${1:error});\n}',
    'Try / catch block'
  ),
  snippet(
    'try / catch / finally',
    'try {\n\t$0\n} catch (${1:error}) {\n\tconsole.error(${1:error});\n} finally {\n\t// cleanup\n}',
    'Try / catch / finally'
  ),
  snippet(
    'function',
    'function ${1:name}(${2:params}) {\n\t$0\n}',
    'Function declaration'
  ),
  snippet(
    'arrow function',
    'const ${1:name} = (${2:params}) => {\n\t$0\n};',
    'Arrow function'
  ),
  snippet(
    'async function',
    'async function ${1:name}(${2:params}) {\n\t$0\n}',
    'Async function'
  ),
  snippet('await promise', 'await ${1:promise};', 'Await a promise'),
  snippet(
    'new Promise',
    'new Promise((resolve, reject) => {\n\t$0\n});',
    'Create a promise'
  ),
  snippet(
    'fetch JSON',
    'const response = await fetch(${1:url});\nconst data = await response.json();',
    'Fetch JSON data'
  ),
  snippet('console.log', 'console.log(${1:value});', 'Log to the console'),
  snippet('console.error', 'console.error(${1:error});', 'Log an error'),
  snippet(
    'setTimeout',
    'setTimeout(() => {\n\t$0\n}, ${1:1000});',
    'Run code after a delay'
  ),
  snippet(
    'array.map',
    '${1:array}.map((item, index) => {\n\t$0\n});',
    'Array · transform every item',
    '```js\nconst result = array.map((item) => item * 2);\n```'
  ),
  snippet(
    'array.filter',
    '${1:array}.filter((item) => ${2:condition});',
    'Array · keep matching items',
    '```js\nconst result = array.filter((item) => item > 0);\n```'
  ),
  snippet(
    'array.reduce',
    '${1:array}.reduce((accumulator, item) => {\n\t$0\n}, ${2:initialValue});',
    'Array · reduce to one value',
    '```js\nconst total = array.reduce((sum, item) => sum + item, 0);\n```'
  ),
  snippet(
    'array.forEach',
    '${1:array}.forEach((item, index) => {\n\t$0\n});',
    'Array · run code for every item'
  ),
  snippet(
    'array.find',
    '${1:array}.find((item) => ${2:condition});',
    'Array · first matching item'
  ),
  snippet('array.sort', '${1:array}.sort((a, b) => a - b);', 'Array · sort values'),
  snippet(
    'object destructuring',
    'const { ${1:key} } = ${2:object};',
    'Destructure an object'
  ),
  snippet(
    'array destructuring',
    'const [${1:first}, ${2:second}] = ${3:array};',
    'Destructure an array'
  ),
  snippet(
    'class',
    'class ${1:Name} {\n\tconstructor(${2:params}) {\n\t\t$0\n\t}\n}',
    'Class declaration'
  ),
  snippet(
    'ternary',
    '${1:condition} ? ${2:whenTrue} : ${3:whenFalse}',
    'Ternary expression'
  ),
];

/* -------------------------------------------------------------------------- */
/* Python                                                                      */
/* -------------------------------------------------------------------------- */

export const PYTHON_COMPLETIONS: CompletionSpec[] = [
  snippet(
    'if condition',
    'if ${1:condition}:\n\t$0',
    'If statement',
    '```python\nif condition:\n    pass\n```'
  ),
  snippet(
    'if / elif / else',
    'if ${1:condition}:\n\t$0\nelif ${2:other}:\n\tpass\nelse:\n\tpass',
    'Conditional branches'
  ),
  snippet(
    'for loop',
    'for ${1:item} in ${2:items}:\n\t$0',
    'Iterate over an iterable',
    '```python\nfor item in items:\n    print(item)\n```'
  ),
  snippet(
    'for + enumerate',
    'for ${1:index}, ${2:item} in enumerate(${3:items}):\n\t$0',
    'Loop with an index'
  ),
  snippet(
    'for + range',
    'for ${1:i} in range(${2:0}, ${3:10}):\n\t$0',
    'Loop over a number range'
  ),
  snippet(
    'while loop',
    'while ${1:condition}:\n\t$0',
    'While loop'
  ),
  snippet(
    'def function',
    'def ${1:name}(${2:params}):\n\t$0',
    'Function definition'
  ),
  snippet(
    'class definition',
    'class ${1:Name}:\n\tdef __init__(self, ${2:params}):\n\t\t$0',
    'Class definition'
  ),
  snippet(
    'try / except',
    'try:\n\t$0\nexcept ${1:Exception} as ${2:error}:\n\tprint(${2:error})',
    'Exception handling'
  ),
  snippet(
    'try / except / finally',
    'try:\n\t$0\nexcept ${1:Exception} as ${2:error}:\n\tprint(${2:error})\nfinally:\n\tpass',
    'Exception handling with cleanup'
  ),
  snippet(
    'with open',
    'with open(${1:path}, ${2:"r"}) as ${3:file}:\n\t$0',
    'Open a file safely'
  ),
  snippet(
    'list comprehension',
    '[${1:expression} for ${2:item} in ${3:items}]',
    'Build a list in one line'
  ),
  snippet(
    'dict comprehension',
    '{${1:key}: ${2:value} for ${3:item} in ${4:items}}',
    'Build a dict in one line'
  ),
  snippet('lambda function', 'lambda ${1:params}: ${2:expression}', 'Anonymous function'),
  snippet(
    'match / case',
    'match ${1:value}:\n\tcase ${2:pattern}:\n\t\t$0',
    'Pattern matching'
  ),
  snippet(
    'async def',
    'async def ${1:name}(${2:params}):\n\t$0',
    'Async function'
  ),
  snippet('await coroutine', 'await ${1:coroutine}', 'Await a coroutine'),
  snippet(
    'main guard',
    'if __name__ == "__main__":\n\t$0',
    'Run only when executed directly'
  ),
  snippet('import module', 'import ${1:module}', 'Import a module'),
  snippet(
    'from import',
    'from ${1:module} import ${2:name}',
    'Import a specific name'
  ),

  func('print', '${1:value}', 'Built-in · print to stdout'),
  func('len', '${1:obj}', 'Built-in · number of items'),
  func('range', '${1:stop}', 'Built-in · number range'),
  func('enumerate', '${1:iterable}, ${2:start=0}', 'Built-in · index + value'),
  func('zip', '${1:iterables}', 'Built-in · combine iterables'),
  func('map', '${1:function}, ${2:iterable}', 'Built-in · transform items'),
  func('filter', '${1:function}, ${2:iterable}', 'Built-in · keep matching items'),
  func('sorted', '${1:iterable}, ${2:key=None}, ${3:reverse=False}', 'Built-in · sorted list'),
  func('sum', '${1:iterable}', 'Built-in · sum values'),
  func('min', '${1:iterable}', 'Built-in · smallest value'),
  func('max', '${1:iterable}', 'Built-in · largest value'),
  func('any', '${1:iterable}', 'Built-in · true if any item is truthy'),
  func('all', '${1:iterable}', 'Built-in · true if all items are truthy'),
  func('abs', '${1:number}', 'Built-in · absolute value'),
  func('round', '${1:number}, ${2:ndigits=None}', 'Built-in · round a number'),
  func('input', '${1:prompt}', 'Built-in · read user input'),
  func('open', '${1:filename}, ${2:mode="r"}', 'Built-in · open a file'),
  func('list', '${1:iterable}', 'Built-in · create a list'),
  func('dict', '${1:kwargs}', 'Built-in · create a dict'),
  func('set', '${1:iterable}', 'Built-in · create a set'),
  func('tuple', '${1:iterable}', 'Built-in · create a tuple'),
  func('str', '${1:value}', 'Built-in · convert to string'),
  func('int', '${1:value}', 'Built-in · convert to integer'),
  func('float', '${1:value}', 'Built-in · convert to float'),
  func('bool', '${1:value}', 'Built-in · convert to boolean'),
  func('isinstance', '${1:obj}, ${2:type}', 'Built-in · type check'),
  func('type', '${1:obj}', 'Built-in · object type'),
  func('repr', '${1:obj}', 'Built-in · printable representation'),

  keyword('and'),
  keyword('as'),
  keyword('assert'),
  keyword('async'),
  keyword('await'),
  keyword('break'),
  keyword('case'),
  keyword('class'),
  keyword('continue'),
  keyword('def'),
  keyword('del'),
  keyword('elif'),
  keyword('else'),
  keyword('except'),
  keyword('False'),
  keyword('finally'),
  keyword('for'),
  keyword('from'),
  keyword('global'),
  keyword('if'),
  keyword('import'),
  keyword('in'),
  keyword('is'),
  keyword('lambda'),
  keyword('match'),
  keyword('None'),
  keyword('nonlocal'),
  keyword('not'),
  keyword('or'),
  keyword('pass'),
  keyword('raise'),
  keyword('return'),
  keyword('True'),
  keyword('try'),
  keyword('while'),
  keyword('with'),
  keyword('yield'),
];

export type PythonContainer = 'list' | 'str' | 'dict' | 'set' | 'tuple';

export const PYTHON_MEMBERS: Record<PythonContainer, CompletionSpec[]> = {
  list: [
    method('append', '${1:item}', 'list.append(item) -> None'),
    method('extend', '${1:iterable}', 'list.extend(iterable) -> None'),
    method('insert', '${1:index}, ${2:item}', 'list.insert(index, item) -> None'),
    method('remove', '${1:item}', 'list.remove(item) -> None'),
    method('pop', '${1:index=-1}', 'list.pop(index=-1) -> item'),
    method('clear', '', 'list.clear() -> None'),
    method('index', '${1:item}', 'list.index(item) -> int'),
    method('count', '${1:item}', 'list.count(item) -> int'),
    method('sort', '${1:key=None}, ${2:reverse=False}', 'list.sort(key=None, reverse=False) -> None'),
    method('reverse', '', 'list.reverse() -> None'),
    method('copy', '', 'list.copy() -> list'),
  ],
  str: [
    method('upper', '', 'str.upper() -> str'),
    method('lower', '', 'str.lower() -> str'),
    method('title', '', 'str.title() -> str'),
    method('capitalize', '', 'str.capitalize() -> str'),
    method('casefold', '', 'str.casefold() -> str'),
    method('strip', '${1:chars=None}', 'str.strip(chars=None) -> str'),
    method('lstrip', '${1:chars=None}', 'str.lstrip(chars=None) -> str'),
    method('rstrip', '${1:chars=None}', 'str.rstrip(chars=None) -> str'),
    method('split', '${1:sep=None}', 'str.split(sep=None) -> list[str]'),
    method('rsplit', '${1:sep=None}', 'str.rsplit(sep=None) -> list[str]'),
    method('join', '${1:iterable}', 'str.join(iterable) -> str'),
    method('replace', '${1:old}, ${2:new}', 'str.replace(old, new) -> str'),
    method('startswith', '${1:prefix}', 'str.startswith(prefix) -> bool'),
    method('endswith', '${1:suffix}', 'str.endswith(suffix) -> bool'),
    method('find', '${1:sub}', 'str.find(sub) -> int'),
    method('rfind', '${1:sub}', 'str.rfind(sub) -> int'),
    method('count', '${1:sub}', 'str.count(sub) -> int'),
    method('format', '${1:args}', 'str.format(*args) -> str'),
    method('encode', '${1:encoding="utf-8"}', 'str.encode(encoding="utf-8") -> bytes'),
    method('decode', '${1:encoding="utf-8"}', 'bytes.decode(encoding="utf-8") -> str'),
    method('isdigit', '', 'str.isdigit() -> bool'),
    method('isalpha', '', 'str.isalpha() -> bool'),
    method('isalnum', '', 'str.isalnum() -> bool'),
    method('isspace', '', 'str.isspace() -> bool'),
    method('zfill', '${1:width}', 'str.zfill(width) -> str'),
    method('ljust', '${1:width}', 'str.ljust(width) -> str'),
    method('rjust', '${1:width}', 'str.rjust(width) -> str'),
    method('center', '${1:width}', 'str.center(width) -> str'),
    method('removeprefix', '${1:prefix}', 'str.removeprefix(prefix) -> str'),
    method('removesuffix', '${1:suffix}', 'str.removesuffix(suffix) -> str'),
  ],
  dict: [
    method('get', '${1:key}, ${2:default=None}', 'dict.get(key, default=None) -> value'),
    method('keys', '', 'dict.keys() -> dict_keys'),
    method('values', '', 'dict.values() -> dict_values'),
    method('items', '', 'dict.items() -> dict_items'),
    method('update', '${1:other}', 'dict.update(other) -> None'),
    method('pop', '${1:key}, ${2:default=None}', 'dict.pop(key, default=None) -> value'),
    method('popitem', '', 'dict.popitem() -> (key, value)'),
    method('setdefault', '${1:key}, ${2:default=None}', 'dict.setdefault(key, default=None) -> value'),
    method('clear', '', 'dict.clear() -> None'),
    method('copy', '', 'dict.copy() -> dict'),
    method('fromkeys', '${1:keys}, ${2:value=None}', 'dict.fromkeys(keys, value=None) -> dict'),
  ],
  set: [
    method('add', '${1:item}', 'set.add(item) -> None'),
    method('update', '${1:iterable}', 'set.update(iterable) -> None'),
    method('remove', '${1:item}', 'set.remove(item) -> None'),
    method('discard', '${1:item}', 'set.discard(item) -> None'),
    method('pop', '', 'set.pop() -> item'),
    method('clear', '', 'set.clear() -> None'),
    method('union', '${1:other}', 'set.union(other) -> set'),
    method('intersection', '${1:other}', 'set.intersection(other) -> set'),
    method('difference', '${1:other}', 'set.difference(other) -> set'),
    method('symmetric_difference', '${1:other}', 'set.symmetric_difference(other) -> set'),
    method('issubset', '${1:other}', 'set.issubset(other) -> bool'),
    method('issuperset', '${1:other}', 'set.issuperset(other) -> bool'),
    method('isdisjoint', '${1:other}', 'set.isdisjoint(other) -> bool'),
  ],
  tuple: [
    method('count', '${1:item}', 'tuple.count(item) -> int'),
    method('index', '${1:item}', 'tuple.index(item) -> int'),
  ],
};

/** All Python members, de-duplicated (used when the receiver type is unknown). */
export const PYTHON_ALL_MEMBERS: CompletionSpec[] = (() => {
  const byLabel = new Map<string, CompletionSpec>();

  for (const group of Object.values(PYTHON_MEMBERS)) {
    for (const item of group) {
      const existing = byLabel.get(item.label);
      if (!existing) {
        byLabel.set(item.label, item);
        continue;
      }

      const details = new Set(
        `${existing.detail} / ${item.detail}`.split(' / ').map((part) => part.trim())
      );
      byLabel.set(item.label, { ...existing, detail: [...details].join(' / ') });
    }
  }

  return [...byLabel.values()];
})();

/* -------------------------------------------------------------------------- */
/* C++                                                                         */
/* -------------------------------------------------------------------------- */

export const CPP_COMPLETIONS: CompletionSpec[] = [
  snippet(
    'if (condition)',
    'if (${1:condition}) {\n\t$0\n}',
    'If statement'
  ),
  snippet(
    'if / else',
    'if (${1:condition}) {\n\t${2:// then}\n} else {\n\t$0\n}',
    'If / else statement'
  ),
  snippet(
    'if / else if / else',
    'if (${1:condition}) {\n\t${2:// ...}\n} else if (${3:other}) {\n\t$0\n} else {\n\t// ...\n}',
    'Multiple conditions'
  ),
  snippet(
    'for (classic)',
    'for (int ${1:i} = 0; ${1:i} < ${2:count}; ++${1:i}) {\n\t$0\n}',
    'Classic for loop'
  ),
  snippet(
    'for (range)',
    'for (const auto& ${1:item} : ${2:items}) {\n\t$0\n}',
    'Range-based for loop'
  ),
  snippet(
    'while (condition)',
    'while (${1:condition}) {\n\t$0\n}',
    'While loop'
  ),
  snippet('do...while', 'do {\n\t$0\n} while (${1:condition});', 'Do-while loop'),
  snippet(
    'switch (value)',
    'switch (${1:value}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}',
    'Switch statement'
  ),
  snippet(
    'try / catch',
    'try {\n\t$0\n} catch (const std::exception& ${1:error}) {\n\tstd::cerr << ${1:error}.what() << std::endl;\n}',
    'Exception handling'
  ),
  snippet(
    'main',
    'int main() {\n\t$0\n\treturn 0;\n}',
    'Program entry point'
  ),
  snippet(
    'struct definition',
    'struct ${1:Name} {\n\t$0\n};',
    'Struct definition'
  ),
  snippet(
    'class definition',
    'class ${1:Name} {\npublic:\n\t${1:Name}(${2:params}) {\n\t\t$0\n\t}\n};',
    'Class definition'
  ),
  snippet(
    'function',
    '${1:void} ${2:name}(${3:params}) {\n\t$0\n}',
    'Function definition'
  ),
  snippet(
    'lambda',
    '[${1:capture}](${2:params}) {\n\t$0\n}',
    'Lambda expression'
  ),
  snippet(
    'vector',
    'std::vector<${1:int}> ${2:values};',
    'Create a std::vector'
  ),
  snippet('string variable', 'std::string ${1:name};', 'Create a std::string'),
  snippet(
    'map variable',
    'std::map<${1:std::string}, ${2:int}> ${3:values};',
    'Create a std::map'
  ),
  snippet(
    'unordered_map variable',
    'std::unordered_map<${1:std::string}, ${2:int}> ${3:values};',
    'Create a std::unordered_map'
  ),
  snippet('set variable', 'std::set<${1:int}> ${2:values};', 'Create a std::set'),
  snippet(
    'pair variable',
    'std::pair<${1:int}, ${2:int}> ${3:value};',
    'Create a std::pair'
  ),
  snippet(
    'sort vector',
    'std::sort(${1:values}.begin(), ${1:values}.end());',
    'Sort a vector'
  ),
  snippet(
    'include iostream',
    '#include <iostream>',
    'Include iostream'
  ),
  snippet('include vector', '#include <vector>', 'Include vector'),
  snippet('include string', '#include <string>', 'Include string'),
  snippet('include algorithm', '#include <algorithm>', 'Include algorithm'),
  snippet('include map', '#include <map>', 'Include map'),

  snippet('cout', 'std::cout << ${1:value} << std::endl;', 'std::cout · write to stdout'),
  snippet('cin', 'std::cin >> ${1:value};', 'std::cin · read from stdin'),
  snippet('cerr', 'std::cerr << ${1:error} << std::endl;', 'std::cerr · write to stderr'),
  snippet('endl', 'std::endl', 'std::endl · newline + flush'),
  stdCall('getline', '${1:std::cin}, ${2:line}', 'std::getline · read a line'),
  stdCall('sort', '${1:begin}, ${2:end}', 'std::sort · sort a range'),
  stdCall('reverse', '${1:begin}, ${2:end}', 'std::reverse · reverse a range'),
  stdCall('find', '${1:begin}, ${2:end}, ${3:value}', 'std::find · search a range'),
  stdCall('accumulate', '${1:begin}, ${2:end}, ${3:initial}', 'std::accumulate · sum a range'),
  stdCall('max', '${1:a}, ${2:b}', 'std::max · larger value'),
  stdCall('min', '${1:a}, ${2:b}', 'std::min · smaller value'),
  stdCall('abs', '${1:value}', 'std::abs · absolute value'),
  stdCall('pow', '${1:base}, ${2:exp}', 'std::pow · power'),
  stdCall('sqrt', '${1:value}', 'std::sqrt · square root'),
  stdCall('to_string', '${1:value}', 'std::to_string · convert to string'),
  stdCall('make_pair', '${1:first}, ${2:second}', 'std::make_pair'),
  stdCall('lower_bound', '${1:begin}, ${2:end}, ${3:value}', 'std::lower_bound'),
  stdCall('upper_bound', '${1:begin}, ${2:end}, ${3:value}', 'std::upper_bound'),
  func('printf', '"${1:%d\\n}", ${2:value}', 'C-style formatted output'),

  keyword('auto'),
  keyword('bool'),
  keyword('break'),
  keyword('case'),
  keyword('catch'),
  keyword('char'),
  keyword('class'),
  keyword('const'),
  keyword('constexpr'),
  keyword('continue'),
  keyword('default'),
  keyword('delete'),
  keyword('do'),
  keyword('double'),
  keyword('else'),
  keyword('enum'),
  keyword('explicit'),
  keyword('extern'),
  keyword('false'),
  keyword('float'),
  keyword('for'),
  keyword('friend'),
  keyword('if'),
  keyword('inline'),
  keyword('int'),
  keyword('long'),
  keyword('namespace'),
  keyword('new'),
  keyword('noexcept'),
  keyword('nullptr'),
  keyword('override'),
  keyword('private'),
  keyword('protected'),
  keyword('public'),
  keyword('return'),
  keyword('short'),
  keyword('sizeof'),
  keyword('static'),
  keyword('struct'),
  keyword('switch'),
  keyword('template'),
  keyword('this'),
  keyword('throw'),
  keyword('true'),
  keyword('try'),
  keyword('typedef'),
  keyword('typename'),
  keyword('unsigned'),
  keyword('using'),
  keyword('virtual'),
  keyword('void'),
  keyword('volatile'),
  keyword('while'),
];

export type CppContainer =
  | 'vector'
  | 'string'
  | 'map'
  | 'set'
  | 'deque'
  | 'list'
  | 'array';

export const CPP_MEMBERS: Record<CppContainer, CompletionSpec[]> = {
  vector: [
    method('push_back', '${1:value}', 'std::vector::push_back(value)'),
    method('emplace_back', '${1:args}', 'std::vector::emplace_back(args...)'),
    method('pop_back', '', 'std::vector::pop_back()'),
    method('size', '', 'std::vector::size() -> size_t'),
    method('empty', '', 'std::vector::empty() -> bool'),
    method('clear', '', 'std::vector::clear()'),
    method('at', '${1:index}', 'std::vector::at(index) -> T&'),
    method('front', '', 'std::vector::front() -> T&'),
    method('back', '', 'std::vector::back() -> T&'),
    method('begin', '', 'std::vector::begin() -> iterator'),
    method('end', '', 'std::vector::end() -> iterator'),
    method('insert', '${1:position}, ${2:value}', 'std::vector::insert(position, value)'),
    method('erase', '${1:position}', 'std::vector::erase(position)'),
    method('resize', '${1:count}', 'std::vector::resize(count)'),
    method('reserve', '${1:capacity}', 'std::vector::reserve(capacity)'),
    method('capacity', '', 'std::vector::capacity() -> size_t'),
    method('assign', '${1:count}, ${2:value}', 'std::vector::assign(count, value)'),
    method('swap', '${1:other}', 'std::vector::swap(other)'),
    method('data', '', 'std::vector::data() -> T*'),
  ],
  string: [
    method('size', '', 'std::string::size() -> size_t'),
    method('length', '', 'std::string::length() -> size_t'),
    method('empty', '', 'std::string::empty() -> bool'),
    method('clear', '', 'std::string::clear()'),
    method('substr', '${1:pos}, ${2:count}', 'std::string::substr(pos, count) -> string'),
    method('find', '${1:substr}', 'std::string::find(substr) -> size_t'),
    method('rfind', '${1:substr}', 'std::string::rfind(substr) -> size_t'),
    method('replace', '${1:pos}, ${2:count}, ${3:str}', 'std::string::replace(pos, count, str)'),
    method('append', '${1:str}', 'std::string::append(str)'),
    method('push_back', '${1:ch}', 'std::string::push_back(ch)'),
    method('pop_back', '', 'std::string::pop_back()'),
    method('at', '${1:index}', 'std::string::at(index) -> char&'),
    method('front', '', 'std::string::front() -> char&'),
    method('back', '', 'std::string::back() -> char&'),
    method('begin', '', 'std::string::begin() -> iterator'),
    method('end', '', 'std::string::end() -> iterator'),
    method('c_str', '', 'std::string::c_str() -> const char*'),
    method('compare', '${1:str}', 'std::string::compare(str) -> int'),
    method('insert', '${1:pos}, ${2:str}', 'std::string::insert(pos, str)'),
    method('erase', '${1:pos}, ${2:count}', 'std::string::erase(pos, count)'),
  ],
  map: [
    method('find', '${1:key}', 'std::map::find(key) -> iterator'),
    method('count', '${1:key}', 'std::map::count(key) -> size_t'),
    method('insert', '${1:value}', 'std::map::insert(value)'),
    method('emplace', '${1:key}, ${2:value}', 'std::map::emplace(key, value)'),
    method('erase', '${1:key}', 'std::map::erase(key)'),
    method('clear', '', 'std::map::clear()'),
    method('size', '', 'std::map::size() -> size_t'),
    method('empty', '', 'std::map::empty() -> bool'),
    method('at', '${1:key}', 'std::map::at(key) -> T&'),
    method('begin', '', 'std::map::begin() -> iterator'),
    method('end', '', 'std::map::end() -> iterator'),
    method('contains', '${1:key}', 'std::map::contains(key) -> bool'),
  ],
  set: [
    method('insert', '${1:value}', 'std::set::insert(value)'),
    method('erase', '${1:value}', 'std::set::erase(value)'),
    method('find', '${1:value}', 'std::set::find(value) -> iterator'),
    method('count', '${1:value}', 'std::set::count(value) -> size_t'),
    method('contains', '${1:value}', 'std::set::contains(value) -> bool'),
    method('size', '', 'std::set::size() -> size_t'),
    method('empty', '', 'std::set::empty() -> bool'),
    method('clear', '', 'std::set::clear()'),
    method('begin', '', 'std::set::begin() -> iterator'),
    method('end', '', 'std::set::end() -> iterator'),
    method('lower_bound', '${1:value}', 'std::set::lower_bound(value)'),
    method('upper_bound', '${1:value}', 'std::set::upper_bound(value)'),
  ],
  deque: [
    method('push_back', '${1:value}', 'std::deque::push_back(value)'),
    method('push_front', '${1:value}', 'std::deque::push_front(value)'),
    method('pop_back', '', 'std::deque::pop_back()'),
    method('pop_front', '', 'std::deque::pop_front()'),
    method('front', '', 'std::deque::front() -> T&'),
    method('back', '', 'std::deque::back() -> T&'),
    method('size', '', 'std::deque::size() -> size_t'),
    method('empty', '', 'std::deque::empty() -> bool'),
    method('clear', '', 'std::deque::clear()'),
    method('at', '${1:index}', 'std::deque::at(index) -> T&'),
    method('begin', '', 'std::deque::begin() -> iterator'),
    method('end', '', 'std::deque::end() -> iterator'),
  ],
  list: [
    method('push_back', '${1:value}', 'std::list::push_back(value)'),
    method('push_front', '${1:value}', 'std::list::push_front(value)'),
    method('pop_back', '', 'std::list::pop_back()'),
    method('pop_front', '', 'std::list::pop_front()'),
    method('front', '', 'std::list::front() -> T&'),
    method('back', '', 'std::list::back() -> T&'),
    method('size', '', 'std::list::size() -> size_t'),
    method('empty', '', 'std::list::empty() -> bool'),
    method('clear', '', 'std::list::clear()'),
    method('insert', '${1:position}, ${2:value}', 'std::list::insert(position, value)'),
    method('erase', '${1:position}', 'std::list::erase(position)'),
    method('sort', '', 'std::list::sort()'),
    method('reverse', '', 'std::list::reverse()'),
    method('unique', '', 'std::list::unique()'),
    method('begin', '', 'std::list::begin() -> iterator'),
    method('end', '', 'std::list::end() -> iterator'),
  ],
  array: [
    method('size', '', 'std::array::size() -> size_t'),
    method('at', '${1:index}', 'std::array::at(index) -> T&'),
    method('front', '', 'std::array::front() -> T&'),
    method('back', '', 'std::array::back() -> T&'),
    method('begin', '', 'std::array::begin() -> iterator'),
    method('end', '', 'std::array::end() -> iterator'),
    method('fill', '${1:value}', 'std::array::fill(value)'),
    method('data', '', 'std::array::data() -> T*'),
  ],
};

export const CPP_ALL_MEMBERS: CompletionSpec[] = (() => {
  const byLabel = new Map<string, CompletionSpec>();

  for (const group of Object.values(CPP_MEMBERS)) {
    for (const item of group) {
      const existing = byLabel.get(item.label);
      if (!existing) {
        byLabel.set(item.label, item);
        continue;
      }

      const details = new Set(
        `${existing.detail} / ${item.detail}`.split(' / ').map((part) => part.trim())
      );
      byLabel.set(item.label, { ...existing, detail: [...details].join(' / ') });
    }
  }

  return [...byLabel.values()];
})();

/* -------------------------------------------------------------------------- */
/* C                                                                           */
/* -------------------------------------------------------------------------- */

export const C_COMPLETIONS: CompletionSpec[] = [
  snippet(
    'if (condition)',
    'if (${1:condition}) {\n\t$0\n}',
    'If statement'
  ),
  snippet(
    'if / else',
    'if (${1:condition}) {\n\t${2:// then}\n} else {\n\t$0\n}',
    'If / else statement'
  ),
  snippet(
    'if / else if / else',
    'if (${1:condition}) {\n\t${2:// ...}\n} else if (${3:other}) {\n\t$0\n} else {\n\t// ...\n}',
    'Multiple conditions'
  ),
  snippet(
    'for (classic)',
    'for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n\t$0\n}',
    'Classic for loop'
  ),
  snippet(
    'while (condition)',
    'while (${1:condition}) {\n\t$0\n}',
    'While loop'
  ),
  snippet('do...while', 'do {\n\t$0\n} while (${1:condition});', 'Do-while loop'),
  snippet(
    'switch (value)',
    'switch (${1:value}) {\n\tcase ${2:value}:\n\t\t$0\n\t\tbreak;\n\tdefault:\n\t\tbreak;\n}',
    'Switch statement'
  ),
  snippet(
    'main',
    'int main(void) {\n\t$0\n\treturn 0;\n}',
    'Program entry point'
  ),
  snippet(
    'struct definition',
    'struct ${1:Name} {\n\t$0\n};',
    'Struct definition'
  ),
  snippet(
    'typedef struct',
    'typedef struct {\n\t$0\n} ${1:Name};',
    'Typedef struct'
  ),
  snippet(
    'array',
    '${1:int} ${2:values}[${3:10}];',
    'C array declaration'
  ),
  snippet(
    'malloc',
    '${1:int} *${2:values} = malloc(${3:count} * sizeof(${1:int}));',
    'Allocate memory'
  ),
  snippet(
    'fopen',
    'FILE *${1:file} = fopen(${2:path}, ${3:"r"});',
    'Open a file'
  ),
  snippet(
    'printf',
    'printf("${1:%d\\n}", ${2:value});',
    'Formatted output'
  ),
  snippet(
    'scanf',
    'scanf("${1:%d}", &${2:value});',
    'Formatted input'
  ),
  snippet(
    'include stdio',
    '#include <stdio.h>',
    'Include stdio.h'
  ),
  snippet(
    'include stdlib',
    '#include <stdlib.h>',
    'Include stdlib.h'
  ),
  snippet(
    'include string',
    '#include <string.h>',
    'Include string.h'
  ),

  func('fprintf', '${1:stream}, "${2:%d\\n}", ${3:value}', 'Standard library · print to stream'),
  func('sprintf', '${1:buffer}, "${2:%d\\n}", ${3:value}', 'Standard library · format into buffer'),
  func('snprintf', '${1:buffer}, ${2:size}, "${3:%d\\n}", ${4:value}', 'Standard library · safe format'),
  func('puts', '${1:string}', 'Standard library · print a line'),
  func('putchar', '${1:character}', 'Standard library · print a character'),
  func('fscanf', '${1:stream}, "${2:%d}", &${3:value}', 'Standard library · read from stream'),
  func('sscanf', '${1:string}, "${2:%d}", &${3:value}', 'Standard library · parse a string'),
  func('getchar', '', 'Standard library · read a character'),
  func('fgets', '${1:buffer}, ${2:size}, ${3:stream}', 'Standard library · read a line'),
  func('calloc', '${1:count}, ${2:size}', 'Standard library · allocate zeroed memory'),
  func('realloc', '${1:pointer}, ${2:size}', 'Standard library · resize allocation'),
  func('free', '${1:pointer}', 'Standard library · free memory'),
  func('strlen', '${1:string}', 'string.h · string length'),
  func('strcpy', '${1:destination}, ${2:source}', 'string.h · copy string'),
  func('strncpy', '${1:destination}, ${2:source}, ${3:count}', 'string.h · bounded copy'),
  func('strcmp', '${1:a}, ${2:b}', 'string.h · compare strings'),
  func('strncmp', '${1:a}, ${2:b}, ${3:count}', 'string.h · bounded compare'),
  func('strcat', '${1:destination}, ${2:source}', 'string.h · concatenate'),
  func('strncat', '${1:destination}, ${2:source}, ${3:count}', 'string.h · bounded concatenate'),
  func('strchr', '${1:string}, ${2:character}', 'string.h · find character'),
  func('strrchr', '${1:string}, ${2:character}', 'string.h · find last character'),
  func('strstr', '${1:haystack}, ${2:needle}', 'string.h · find substring'),
  func('strtok', '${1:string}, ${2:delimiters}', 'string.h · split tokens'),
  func('memset', '${1:pointer}, ${2:value}, ${3:size}', 'string.h · fill memory'),
  func('memcpy', '${1:destination}, ${2:source}, ${3:size}', 'string.h · copy memory'),
  func('memmove', '${1:destination}, ${2:source}, ${3:size}', 'string.h · move memory'),
  func('memcmp', '${1:a}, ${2:b}, ${3:size}', 'string.h · compare memory'),
  func('fclose', '${1:file}', 'stdio.h · close a file'),
  func('fread', '${1:buffer}, ${2:size}, ${3:count}, ${4:stream}', 'stdio.h · read bytes'),
  func('fwrite', '${1:buffer}, ${2:size}, ${3:count}, ${4:stream}', 'stdio.h · write bytes'),
  func('fseek', '${1:stream}, ${2:offset}, ${3:origin}', 'stdio.h · seek in file'),
  func('ftell', '${1:stream}', 'stdio.h · file position'),
  func('rewind', '${1:stream}', 'stdio.h · rewind file'),
  func('exit', '${1:status}', 'stdlib.h · exit program'),
  func('atoi', '${1:string}', 'stdlib.h · string to int'),
  func('atof', '${1:string}', 'stdlib.h · string to double'),
  func('abs', '${1:value}', 'stdlib.h · absolute value'),
  func('qsort', '${1:array}, ${2:count}, ${3:size}, ${4:compare}', 'stdlib.h · sort an array'),
  func('bsearch', '${1:key}, ${2:array}, ${3:count}, ${4:size}, ${5:compare}', 'stdlib.h · binary search'),
  func('sizeof', '${1:type}', 'Operator · size in bytes'),

  keyword('auto'),
  keyword('break'),
  keyword('case'),
  keyword('char'),
  keyword('const'),
  keyword('continue'),
  keyword('default'),
  keyword('do'),
  keyword('double'),
  keyword('else'),
  keyword('enum'),
  keyword('extern'),
  keyword('float'),
  keyword('for'),
  keyword('goto'),
  keyword('if'),
  keyword('inline'),
  keyword('int'),
  keyword('long'),
  keyword('register'),
  keyword('return'),
  keyword('short'),
  keyword('signed'),
  keyword('static'),
  keyword('struct'),
  keyword('switch'),
  keyword('typedef'),
  keyword('union'),
  keyword('unsigned'),
  keyword('void'),
  keyword('volatile'),
  keyword('while'),
];
