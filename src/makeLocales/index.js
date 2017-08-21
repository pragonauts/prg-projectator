'use strict';

const makeLocales = require('./makeLocales');
const path = require('path');

/**
 * @param {Command} program
 */
module.exports = function (program) {

    program
        .command('make-locales')
        .description('Generate or update translation files by crawling source files and finding the strings for translation')
        .option('-s [sourcePath]', 'where the crawler should search for the messages [./]')
        .option('-t [targetPath]', 'where the messages.pot file should be placed [./locales]')
        .action((options) => {
            const projectDir = process.cwd();

            makeLocales(
                path.join(projectDir, options.S || './'),
                path.join(projectDir, options.T || './locales')
            );
        });

};
