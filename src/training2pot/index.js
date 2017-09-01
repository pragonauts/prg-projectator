'use strict';

const training2pot = require('./training2pot');
const path = require('path');

/**
 * @param {Command} program
 */
module.exports = function (program) {

    program
        .command('training2pot')
        .description('Generate pot file from a training json file')
        .option('-s [sourcePath]', 'default training file [./training.json]')
        .option('-t [targetPath]', 'where the training.pot file should be placed [./training.pot]')
        .action((options) => {
            const projectDir = process.cwd();

            training2pot(
                path.join(projectDir, options.S || './training.json'),
                path.join(projectDir, options.T || './training.pot')
            );
        });

};
