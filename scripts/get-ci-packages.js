const glob = require('glob');

const packageJson = require('../package.json');

const workspacesGlob = packageJson.workspaces[ 0 ];

const matches = glob.sync(workspacesGlob);

/**
 * should log this structure:
 * {
 *  include: {
 *      packagePath: string;
 *  }[];
 * }
 */

const matrix = {
    include: matches.map(packagePath => ({ packagePath }))
};

console.log(
    JSON.stringify(matrix)
);
