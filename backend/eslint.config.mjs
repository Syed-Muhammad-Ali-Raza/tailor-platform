import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'uploads/**', 'jest.config.js'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
