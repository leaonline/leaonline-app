/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {

  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'node'
  ],

  testEnvironment: 'jsdom',

  modulePathIgnorePatterns: [
    "react-native/Libraries/react-native/"
  ],

  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@meteorrn/core)',
    'node_modules/(?!((jest-)?react-native|react-clone-referenced-element|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|sentry-expo|native-base))'
  ],

  transform: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/fileTransformer.js',
    "^.+\\.(js|ts|tsx)$": "babel-jest",
  },


}
