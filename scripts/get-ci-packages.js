const glob = require('glob');

const packageJson = require('../package.json');

const workspacesGlob = packageJson.workspaces[ 0 ];

const matches = glob.sync(workspacesGlob);

/**
 * should log this structure:
 * {
 *  include: {
 *      package: string;
 *  }[];
 * }
 */

const matrix = {
    include: matches.map(package => ({ package }))
};

console.log(
    JSON.stringify(matrix)
);
