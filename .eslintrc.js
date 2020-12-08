const resolve = require('./resolve.config');
const puppeteerRollupConfig = require('./config/jest-puppeteer.rollup.config.js');

module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'airbnb', 'prettier'],
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: resolve.extensions,
        moduleDirectory: resolve.directories,
      },
    },
  },
  plugins: ['prettier', 'json', 'react', 'jest', 'import', '@typescript-eslint'],
  rules: {
    'func-names': 'off',
    'no-plusplus': 'off',
    'no-continue': 'off',
    'no-param-reassign': 'off',
    'no-nested-ternary': 'off',
    'no-underscore-dangle': 'off',
    'no-multi-assign': 'off',
    'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-cond-assign': ['error', 'except-parens'],
    camelcase: ['error', { allow: ['^__', '^UNSAFE_'] }],
    'prefer-destructuring': 'off',
    'consistent-return': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true, // Allow `const { props, state } = this`; false by default
        allowedNames: ['self', '_self'], // Allow `const self = this`; `[]` by default
      },
    ],
    'import/no-unresolved': [
      'error',
      {
        ignore: [`^@/.*`],
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.*', `*${puppeteerRollupConfig.js.input}.*`],
      rules: {
        'no-restricted-syntax': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ban-types': 'off',
        'no-console': 'off',
        'consistent-return': 'off',
        'symbol-description': 'off',
        'no-new-wrappers': 'off',
        'no-prototype-builtins': 'off',
        'no-void': 'off',
        'no-empty-function': 'off',
        'no-new-func': 'off',
        'import/no-unresolved': [
          'error',
          {
            ignore: [`\\./${puppeteerRollupConfig.build}/${puppeteerRollupConfig.html.output}$`, `^@/.*`],
          },
        ],
      },
      globals: {
        page: true,
        browser: true,
        context: true,
        jestPuppeteer: true,
      },
    },
    {
      files: ['rollup.config.*'],
      rules: {
        'no-console': 'off',
        'global-require': 'off',
        'import/no-dynamic-require': 'off',
      },
    },
  ],
};
