// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const rootConfig = require('../../jest.config.base');

module.exports = {

  ...rootConfig(__dirname),

  setupFiles: [
    '<rootDir>/src/setupTestsEnv.ts'
  ],

  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"
  ]
};
