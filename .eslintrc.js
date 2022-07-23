module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'standard',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'comma-dangle': ['warn', 'only-multiline'],
    'no-eval': ['warn', { allowIndirect: true }],
    semi: ['error', 'always'],
  },
};
