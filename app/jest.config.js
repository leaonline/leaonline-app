module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    //'node_modules/(?!(jest-)?react-native|@meteorrn|@react-native|react-clone-referenced-element|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|@sentry/.*)'
    'node_modules/(?!((jest-)?react-native|@meteorrn|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)'
  ],
  collectCoverage: true,
  coverageDirectory: '.coverage',
  coverageReporters: ['html'],
  setupFiles: ['./jestSetup.js']
}
