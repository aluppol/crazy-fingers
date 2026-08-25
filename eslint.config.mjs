import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

const noComments = {
  meta: { type: 'problem', docs: { description: 'Method names and types are the documentation' } },
  create: context => ({
    Program() {
      context.sourceCode.getAllComments()
        .filter(comment => !comment.value.startsWith('/'))
        .forEach(comment => context.report({ loc: comment.loc, message: 'Comments are not allowed: rewrite the code until it explains itself.' }));
    },
  }),
};

const inwardOnly = (forbiddenLayers, message) => ({
  'no-restricted-imports': ['error', {
    patterns: [{ group: forbiddenLayers, message }],
  }],
});

export default tseslint.config(
  { ignores: ['dist/**', '.angular/**', 'node_modules/**', 'samples/**', '.yarn/**'] },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: { '@stylistic': stylistic, local: { rules: { 'no-comments': noComments } } },
    rules: {
      'local/no-comments': 'error',
      'no-restricted-syntax': ['error', {
        selector: "TSTypeAliasDeclaration > TSUnionType > TSLiteralType > Literal[value=/^[a-zA-Z]/]",
        message: 'No magic strings: declare a string enum instead of a string-literal union.',
      }],
      'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'xxx'], location: 'anywhere' }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 5],
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'object-shorthand': ['error', 'always'],
      'arrow-body-style': ['error', 'as-needed'],
      'curly': ['error', 'multi-line'],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
      '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit', overrides: { constructors: 'no-public' } }],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'forbid', trailingUnderscore: 'forbid' },
        { selector: 'variable', modifiers: ['const', 'global'], format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'enumMember', format: ['PascalCase'] },
        { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: false } },
        { selector: ['classProperty', 'classMethod', 'accessor'], modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'require' },
        { selector: ['classProperty', 'classMethod', 'accessor'], modifiers: ['protected'], format: ['camelCase'], leadingUnderscore: 'require' },
        { selector: 'parameterProperty', modifiers: ['private'], format: ['camelCase'], leadingUnderscore: 'require' },
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'typeProperty', format: null },
        { selector: 'import', format: ['camelCase', 'PascalCase'] },
      ],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@stylistic/indent': ['error', 2, { SwitchCase: 0 }],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/max-len': ['error', { code: 140, ignoreUrls: true, ignoreStrings: true, ignoreRegExpLiterals: true }],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/eol-last': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/member-delimiter-style': 'error',
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/keyword-spacing': 'error',
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/linebreak-style': ['error', 'unix'],
    },
  },
  {
    files: ['**/*.port.ts', '**/*.interface.ts'],
    rules: {
      '@typescript-eslint/naming-convention': ['error', { selector: 'interface', format: ['PascalCase'], prefix: ['I'] }],
    },
  },
  {
    files: ['src/app/domain/**/*.ts'],
    rules: inwardOnly(
      ['@angular/*', 'idb', 'fflate', 'pdfjs-dist', '**/application', '**/application/**', '**/adapters', '**/adapters/**', '**/ui', '**/ui/**', '**/composition/**'],
      'The domain imports only from the domain.',
    ),
  },
  {
    files: ['src/app/application/**/*.ts'],
    rules: inwardOnly(
      ['@angular/*', 'idb', 'fflate', 'pdfjs-dist', '**/adapters', '**/adapters/**', '**/ui', '**/ui/**', '**/composition/**'],
      'The application layer imports only domain and its own ports.',
    ),
  },
  {
    files: ['src/app/adapters/**/*.ts'],
    rules: inwardOnly(['@angular/*', '**/ui', '**/ui/**', '**/composition/**'], 'Adapters import inward only: application ports and domain.'),
  },
  {
    files: ['src/app/domain/typing/states/*.ts'],
    ignores: ['src/app/domain/typing/states/index.ts'],
    rules: inwardOnly(
      ['./ready-state', './progress-state', './pause-state', './complete-state'],
      'A state must not import a sibling state: name the target phase and let TypingMachine resolve it.',
    ),
  },
  {
    files: ['**/*.spec.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
);
