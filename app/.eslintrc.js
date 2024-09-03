// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'standard'],
  rules: {
    'react/display-name': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'brace-style': [
      'error',
      'stroustrup',
      {
        allowSingleLine: true
      }
    ],
    'import/no-duplicates': 0
  }
}
