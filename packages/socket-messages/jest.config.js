const rootConfig = require('../../jest.config');

module.exports = {
  ...rootConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    "<rootDir>/src/setup-tests.ts"
  ]
};
