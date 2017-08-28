'use strict';

const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * @param {string} sourceDir
 * @param {string} targetDir
*/
module.exports = (sourceDir, targetDir) => {

    /* const USAGE_REGEX = `[\\s{(,.](?:res\\.)?(tq?)\\('((?:.+?(?:\\\\')?)+?)'[^)]*\\)`;*/
    /* const TRANSLATION_REGEX = new RegExp(`((?:res)?\\.text)?(?:${USAGE_REGEX})([^;]+)?;`, 'i');*/
    const TRANSLATION_REGEX = `[\\s{(,.](?:res\\.)?(tq?)\\('((?:.+?(?:\\\\')?)+?)'[^)]*\\)`; // eslint-disable-line
    console.log(TRANSLATION_REGEX);
    const COMMENT_REGEX = /'(.+?)'[;,]?\s*\/\/\s*i18/;

    console.log('\nLoading files');

    let texts = {};
    // load translations from files
    const fileNames = glob.sync(`${sourceDir}/**/*.js`);

    fileNames.forEach((file) => {
        process.stdout.write('.');
        const content = fs.readFileSync(file, 'utf8');

        const mapStrings = (title, quickReply = false) => {

            const key = title.replace('\\\'', '\'');

            if (typeof texts[key] === 'undefined') {
                texts[key] = {
                    key,
                    files: [],
                    important: false,
                    quickReply
                };
            }
            texts[key].files.push(path.relative(sourceDir, file));
        };

        (content.match(new RegExp(TRANSLATION_REGEX, 'g')) || [])
            .forEach((instance) => {
                const [, func, simple] = instance.match(TRANSLATION_REGEX);
                mapStrings(simple, func === 'tq');
            });

        (content.match(new RegExp(COMMENT_REGEX, 'g')) || [])
            .map(title => title.match(COMMENT_REGEX)[1])
            .forEach(mapStrings);
    });
    process.stdout.write('\n\n');

    // sort
    texts = Object.keys(texts).map(key => texts[key]);

    // write the pot file
    const file = path.join(targetDir, 'messages.pot');
    const f = fs.createWriteStream(file);
    texts.forEach((text) => {
        let header = '';
        let quickReply = '';
        if (text.quickReply) {
            header += '#. quick reply, max 20 chars\n';
            quickReply += '- quick reply';
        }
        header += `#: ${text.files
            .map(t => t.replace(/\.js$/, ''))
            .join(', ')}${quickReply}\n`;

        if (text.files.length > 1) {
            console.warn(`The ${JSON.stringify(text.key)} is used in multiple places! ${text.files.join(', ')}`);
        }

        f.write(header);
        f.write(`msgid ${JSON.stringify(text.key)}\n`);
        f.write(`msgstr ${JSON.stringify(text.key)}\n\n`);
    });
    f.end('');
    console.log(`Messages writed to: ${file}`);

};
