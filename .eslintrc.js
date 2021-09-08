/*
 * @Descripttion: default
 * @version: 1.0.0
 * @Author: jiaxiantao
 * @Date: 2021-09-08 20:34:02
 * @LastEditors: jiaxiantao
 * @LastEditTime: 2021-09-08 21:02:41
 */
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended' // 添加 prettier 插件
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {}
};
