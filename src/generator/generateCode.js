'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const fsWalk = require('fs-walk');
const handlebars = require('handlebars');
const path = require('path');

/**
 * @param {GenerateRequest} request
 * @param {string} templatesBasePath
 * @param {string} projectDir
 */
module.exports = (request, templatesBasePath, projectDir) => {

    fsWalk.walkSync(templatesBasePath, (templateDir, filename, stat) => {
        if (stat.isDirectory()) {
            return;
        }

        const templatePath = path.join(templateDir, filename);
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        const newContent = handlebars.compile(templateContent)(request);
        let newFilePath = path.join(
            projectDir,
            path.relative(templatesBasePath, templateDir),
            filename.replace(/\.(handlebars|hbs)$/, '')
        );
        newFilePath = handlebars.compile(newFilePath.replace(/\\{{/g, '\\\\{{'))(request);

        fsExtra.ensureFileSync(newFilePath);
        fs.writeFileSync(newFilePath, newContent);
    });

};
