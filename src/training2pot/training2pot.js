'use strict';

const fs = require('fs');

function training2pot (jsonPath, targetPath) {

    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const pot = json.rasa_nlu_data.common_examples
        .map(item => `
            #. ${JSON.stringify({ intent: item.intent, entities: item.entities })}
            msgid "${item.text}"
            msgstr "${item.text}"
        `.replace(/\n\s+/g, '\n'))
        .join('\n');

    fs.writeFileSync(targetPath, pot, 'utf8');
}

module.exports = training2pot;
