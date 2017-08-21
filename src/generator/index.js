'use strict';


const path = require('path');
const fs = require('fs');
const blueprintToRequest = require('./blueprintToRequest');
const generateCode = require('./generateCode');

/**
 * @param {Command} program
 */
module.exports = function (program) {

    program
        .command('generate [name]')
        .description('Generate model, API, frontend and tests for an entity based on apiBlueprint.apib file and the code templates in /generatorTemplates path.')
        .action((name) => {

            const projectDir = process.cwd();

            const blueprint = fs.readFileSync(path.join(projectDir, 'apiBlueprint.apib'), 'utf8');
            const generateRequest = blueprintToRequest(blueprint, name);

            const templatesDir = path.join(__dirname, 'templates');
            generateCode(generateRequest, templatesDir, projectDir);
        });

};
