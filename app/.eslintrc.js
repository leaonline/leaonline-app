// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'standard'],
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'react/display-name': 'off',
    'brace-style': ['error', 'stroustrup', { allowSingleLine: true }]
  }
}
