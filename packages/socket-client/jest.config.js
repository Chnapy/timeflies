const rootConfig = require('../../jest.config.base');

module.exports = {
  ...rootConfig(__dirname),
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    "<rootDir>/src/setup-tests.ts"
  ]
};
