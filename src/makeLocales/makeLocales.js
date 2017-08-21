'use strict';

const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**
 * @param {string} sourceDir
 * @param {string} targetDir
*/
module.exports = (sourceDir, targetDir) => {

    const USAGE_REGEX = `(?:[\\s{(,.]|req\\.)t\\('(.+?)'[^)]*\\)`;
    const TRANSLATION_REGEX = new RegExp(`(res\\.text)?(?:${USAGE_REGEX})([^;]+)?;`, 'i');
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

            // console.log({ title, quickReply });

            if (typeof texts[title] === 'undefined') {
                texts[title] = {
                    key: title,
                    files: [],
                    important: false,
                    quickReply
                };
            }
            texts[title].files.push(path.relative(sourceDir, file));
        };

        (content.match(new RegExp(TRANSLATION_REGEX, 'g')) || [])
            .forEach((instance) => {
                const [, isResText, simple, quickReplies] = instance.match(TRANSLATION_REGEX);

                mapStrings(simple, false);

                if (isResText && quickReplies) {
                    (quickReplies.match(new RegExp(USAGE_REGEX, 'g')) || [])
                        .map(title => title.match(new RegExp(USAGE_REGEX))[1])
                        .forEach(title => mapStrings(title, true));
                }
            });

        (content.match(new RegExp(COMMENT_REGEX, 'g')) || [])
            .map(title => title.match(COMMENT_REGEX)[1])
            .forEach(mapStrings);
    });
    process.stdout.write('\n\n');

    // sort
    texts = Object.keys(texts)
        .map(key => texts[key])
        .sort((a, b) => {
            if (a.important !== b.important) {
                return b.important ? 1 : -1;
            }
            let left = null;
            let right = null;
            if (a.files.length !== 0 && b.files.length !== 0) {
                left = a.files.join(' ');
                right = b.files.join(' ');
            }
            if (left === right) {
                left = a.key;
                right = b.key;
            }

            return left > right ? 1 : -1;
        });

    // write the pot file
    const file = path.join(targetDir, 'messages.pot');
    console.log(`Writing to: ${file}`);
    const f = fs.createWriteStream(file);
    texts.forEach((text) => {
        let header = '';
        if (text.quickReply) {
            header += '#. quick reply, max 20 chars\n';
        }
        header += `#: ${text.files.join(', ')}\n`;

        if (text.files.length > 1) {
            console.warn(`The ${JSON.stringify(text.key)} is used in multiple files! ${text.files.join(', ')}`);
        }

        f.write(header);
        f.write(`msgid ${JSON.stringify(text.key)}\n`);
        f.write(`msgstr ${JSON.stringify(text.key)}\n\n`);
    });
    f.end('');

};
