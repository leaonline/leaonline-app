module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@meteorrn|@react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)'
  ],
  collectCoverage: true,
  coverageDirectory: '.coverage',
  coverageReporters: ['html', 'text'],
  setupFiles: ['./jestSetup.js']
}
