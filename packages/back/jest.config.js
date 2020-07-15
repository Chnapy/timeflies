// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const rootConfig = require('../../jest.config');

module.exports = {

  ...rootConfig,

  setupFiles: [
    '<rootDir>/src/setupTestsEnv.ts'
  ],

  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.ts"
  ]
};
