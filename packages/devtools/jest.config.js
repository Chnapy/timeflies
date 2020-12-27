const rootConfig = require('../../jest.config.base');

module.exports = {
  ...rootConfig(__dirname),
  setupFilesAfterEnv: [
    "<rootDir>/src/setup-tests.ts"
  ]
};
