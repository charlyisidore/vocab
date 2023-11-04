import js from '@eslint/js';
import solid from 'eslint-plugin-solid';
import vitest from 'eslint-plugin-vitest';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const ecmaVersion = 'latest';

const languageOptions = {
  ecmaVersion,
  parser: tsParser,
  parserOptions: {
    ecmaVersion,
    project: 'tsconfig.json',
  },
  globals: {
    ...globals.browser,
  },
};

const plugins = {
  '@typescript-eslint': ts,
  solid,
};

const rules = {
  // https://eslint.org/docs/latest/rules/
  // https://typescript-eslint.io/rules/
  // https://github.com/solidjs-community/eslint-plugin-solid#rules
  ...ts.configs.recommended.rules,
  ...ts.configs.strict.rules,
  ...solid.configs.recommended.rules,

  // Possible Problems
  'array-callback-return': 'error',
  'no-constant-binary-expression': 'error',
  'no-constructor-return': 'error',
  'no-duplicate-imports': 'error',
  'no-new-native-nonconstructor': 'error',
  'no-promise-executor-return': 'error',
  'no-self-compare': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable-loop': 'error',
  'no-unused-private-class-members': 'error',
  'no-use-before-define': 'error',
  'require-atomic-updates': 'error',

  // Suggestions
  'block-scoped-var': 'error',
  camelcase: 'error',
  'consistent-return': 'error',
  curly: 'error',
  'default-case': 'error',
  'default-case-last': 'error',
  'default-param-last': 'error',
  'dot-notation': 'error',
  eqeqeq: 'error',
  'func-name-matching': 'error',
  'func-names': 'error',
  'grouped-accessor-pairs': ['error', 'getBeforeSet'],
  'logical-assignment-operators': 'error',
  'new-cap': 'error',
  'no-array-constructor': 'error',
  'no-caller': 'error',
  'no-else-return': 'error',
  'no-empty-function': ['error', { allow: ['arrowFunctions'] }],
  'no-empty-static-block': 'error',
  'no-eq-null': 'error',
  'no-eval': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-label': 'error',
  'no-implicit-coercion': 'error',
  'no-implied-eval': 'error',
  'no-invalid-this': 'error',
  'no-iterator': 'error',
  'no-label-var': 'error',
  'no-labels': 'error',
  'no-lone-blocks': 'error',
  'no-lonely-if': 'error',
  'no-loop-func': 'error',
  'no-multi-assign': 'error',
  'no-multi-str': 'error',
  'no-negated-condition': 'error',
  'no-nested-ternary': 'error',
  'no-new': 'error',
  'no-new-func': 'error',
  'no-new-wrappers': 'error',
  'no-object-constructor': 'error',
  'no-octal-escape': 'error',
  'no-param-reassign': 'error',
  'no-plusplus': [
    'error',
    {
      allowForLoopAfterthoughts: true,
    },
  ],
  'no-proto': 'error',
  'no-return-assign': 'error',
  'no-script-url': 'error',
  'no-sequences': 'error',
  'no-throw-literal': 'error',
  'no-undef-init': 'error',
  'no-unneeded-ternary': 'error',
  'no-unused-expressions': 'error',
  'no-useless-call': 'error',
  'no-useless-computed-key': 'error',
  'no-useless-concat': 'error',
  'no-useless-constructor': 'error',
  'no-useless-rename': 'error',
  'no-useless-return': 'error',
  'no-var': 'error',
  'no-void': 'error',
  'object-shorthand': 'error',
  'one-var': ['error', 'never'],
  'operator-assignment': 'error',
  'prefer-arrow-callback': 'error',
  'prefer-const': 'error',
  'prefer-destructuring': 'error',
  'prefer-exponentiation-operator': 'error',
  'prefer-numeric-literals': 'error',
  'prefer-object-has-own': 'error',
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': 'error',
  'prefer-regex-literals': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'prefer-template': 'error',
  radix: 'error',
  'require-unicode-regexp': 'error',
  'sort-imports': [
    'error',
    {
      ignoreDeclarationSort: true,
    },
  ],
  'spaced-comment': 'error',
  strict: ['error', 'never'],
  'symbol-description': 'error',
  yoda: 'error',
};

export default [
  {
    ignores: ['coverage/**/*', 'dist/**/*', 'generator/**/*'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{[jt]s,[jt]sx}'],
    ignores: ['**/*.test.{[jt]s,[jt]sx}'],
    languageOptions,
    plugins,
    rules,
  },
  {
    files: ['**/*.test.{[jt]s,[jt]sx}'],
    languageOptions,
    plugins: {
      ...plugins,
      vitest,
    },
    rules: {
      // https://github.com/veritem/eslint-plugin-vitest#rules
      ...vitest.configs.all.rules,
      ...rules,
    },
  },
  prettierConfig,
];
