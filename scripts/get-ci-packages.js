const glob = require('glob');
const path = require('path');

const packageJson = require('../package.json');

const workspacesGlob = packageJson.workspaces[ 0 ];

const matches = glob.sync(workspacesGlob);

/**
 * should log this structure:
 * {
 *  include: {
 *      package: {
 *          path: string;
 *          name: string;
 *      };
 *  }[];
 * }
 */

const matrix = {
    include: matches.map(packagePath => ({
        package: {
            path: packagePath,
            name: require(path.join('..', packagePath, 'package.json')).name
        }
    }))
};

console.log(
    JSON.stringify(matrix)
);
