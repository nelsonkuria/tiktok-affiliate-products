import prettier from 'eslint-config-prettier';

import apify from '@apify/eslint-config/ts.js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

// eslint-disable-next-line import/no-default-export
export default [
  { ignores: ['**/dist', 'eslint.config.mjs', 'prisma.config.ts'] },
  ...apify,
  prettier,
  {
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        project: 'tsconfig.json',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    rules: {
      'no-console': 0,
      camelcase: 'off',
      'import/extensions': 'off',
      'no-nested-ternary': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-default-export': 'off',
      'dot-notation': 'off',
    },
  },
];
