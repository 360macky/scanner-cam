module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['plugin:react/recommended', 'standard-with-typescript'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['react'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    'promise/param-names': 'off',
    'no-unmodified-loop-condition': 'off',
    'prefer-regex-literals': 'off',
    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    'multiline-ternary': 'off',
    '@typescript-eslint/no-unused-vars': 'warn'
  },
  ignorePatterns: ['node_modules', 'dist', 'build', 'coverage', 'public']
}
