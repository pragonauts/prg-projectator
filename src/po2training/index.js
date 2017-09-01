'use strict';

const po2training = require('./po2training');
const path = require('path');

/**
 * @param {Command} program
 */
module.exports = function (program) {

    program
        .command('po2training')
        .description('Generate training JSON file from a translated po file')
        .option('-s [sourcePath]', 'PO file with translated learning data')
        .option('-t [targetPath]', 'where the training JSON file should be placed?')
        .action((options) => {
            const projectDir = process.cwd();

            const sourcePath = path.join(projectDir, options.S);
            let targetPath;
            if (options.T) {
                targetPath = path.join(projectDir, options.T);

            } else {
                const { dir, name } = path.parse(sourcePath);
                targetPath = path.join(dir, `${name}.json`);
            }

            po2training(sourcePath, targetPath);
        });

};
