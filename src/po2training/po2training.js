'use strict';

const fs = require('fs');

function training2pot (poPath, targetPath) {

    const poContent = fs.readFileSync(poPath, 'utf8');

    const translationMatcher = /#\.\s*(\{.+?\})(?:\n|.)+?msgstr "(.*?)"\n/im;

    const items = poContent.match(new RegExp(translationMatcher, 'g'))
        .map((poItem) => {
            const [, definition, text] = poItem.match(translationMatcher);
            const { intent, entities } = JSON.parse(definition);
            return { text, intent, entities };
        })
        .filter(item => !!item.text);

    const trainingContent = {
        rasa_nlu_data: {
            common_examples: items
        }
    };

    fs.writeFileSync(targetPath, JSON.stringify(trainingContent, null, 4), 'utf8');
}

module.exports = training2pot;
