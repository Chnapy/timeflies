const rootConfig = require('../../jest.config');

module.exports = {
  ...rootConfig,
  setupFilesAfterEnv: [
    "<rootDir>/src/setup-tests.ts"
  ]
};
