const createJestConfig = require('timeflies-react-scripts/scripts/utils/createJestConfig');
const path = require('path');

const craRootPath = require.resolve('timeflies-react-scripts/scripts/utils/createJestConfig');

const craJestConfig = createJestConfig(
    relativePath => path.resolve(craRootPath, '..', '..', '..', relativePath),
    undefined,
    false
);

module.exports = {
    ...craJestConfig,

    // A list of paths to directories that Jest should use to search for files in
    roots: [ '<rootDir>' ],

    // The paths to modules that run some code to configure or set up the testing environment before each test
    // setupFiles: [],

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: [ '../src/setupTests.ts' ],

    // The glob patterns Jest uses to detect test files
    testMatch: [
        "**/*.perf.ts"
    ],
};
