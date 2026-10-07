import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: dirname });

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**',
      'next-env.d.ts',
      'global.d.ts',
    ],
  },
  {
    rules: {
      'max-lines': [
        'error',
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];

export default eslintConfig;
