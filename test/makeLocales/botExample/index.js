/*
 * @author David Menger
 */
'use strict';

const { Router } = require('botnaut');

const bot = new Router();

/**
 * BEGINNER OR EXPERT
 */
bot.use('/', (req, res) => {
    res.text(res.t('I will ask you few questions about your preferences, which can help me to choose the right Saeco coffee machine for you.'));
    res.text(res.t('Let’s start with first question, could you call yourself a coffee guru, or do you just like coffee?'), {
            beginner: res.t('I just like coffee'),
            expert: res.t('I know my beans')
        })
        .expected('resolveExpert');

    // @todo "still expert?"
});

/**
 * MILK FOAM INTERACTION
 */
bot.use('milkFoam', (req, res) => {
    res.text(res.t('Saeco machines has technology called Latte Perfecto, which can make you a cup of coffee with perfectly frothed milk by single press of the button.'));
    res.text(res.t('And when you drink coffee with milk, do you prefer milk foam or do you just pour milk into it?'), {
            withFoam: res.t('I prefer foam'),
            withoutFoam: res.t('I pour the milk'),
            bothFoam: res.t('Both')
        })
        .expected('resolveFoamOrNot');
});

/**
 * Milky Specials interaction
 */
bot.use('milkySpecials', (req, res) => {
    if (req.state.expert) {
        res.text(res.t('How about flatwhite or espresso macchiato? '), {
            specialMilkyCoffees: res.t('I like this!'),
            justClassicCoffees: res.t('Nah'),
            doesntMatter: res.t('Doesn\'t matter'),
            babyCappuccino: res.t('Espresso Macchiato?'),
            flatWhite: res.t('Flat\' white?')
        });
    } else {
        res.text(res.t('And do you stick with classic milk drinks like Cappuccino or Latte Macchiato or wanna try something special as well, like Flat White or Baby Cappuccino?'));
        res.text(res.t('Some coffee machines can make unbeelievable range of beverages.'));
        res.text(res.t('Or milk foam is not necessary for you?'), {
                justClassicCoffees: res.t('Just classic'),
                specialMilkyCoffees: res.t('Special ones as well'),
                babyCappuccino: res.t('Baby Cappuccino?'),
                flatWhite: res.t('Flat white?')
            });
    }

    res.expected('resolveSpecials');
});

/**
 * Opposite Requirements Prioritization interaction
 */
bot.use('oppositesPrioritization', (req, res, postBack) => {
    const { wantVaripresso, wantMilkySpecials, wantDouble } = req.state;
    const inConflict = wantVaripresso && (wantMilkySpecials || wantDouble);

    if (!inConflict) {
        postBack('userSettings'); // skip when there's no conflict
        return;
    }

    const send = [res.t('Is more important for you to have regular coffee')];
    const replies = {
        preferRegular: res.t('Regular coffee')
    };

    if (wantMilkySpecials) {
        send.push(res.t('or be able to make special milk beverages like flat white or baby cappuccino (espresso macchiato)'));
        Object.assign(replies, { preferSpecials: res.t('Need milk beverages') });
    }
    if (wantDouble) {
        send.push(res.t('or be able to make make double espresso (Doppio)'));
        Object.assign(replies, { preferDoppio: res.t('Want doppio') });
    }
    send.forEach((message, i) => {
        if (i + 1 === send.length) {
            res.text(message, replies); // last will be with replies
        } else {
            res.text(message);
        }
    });
    res.expected('resolveOpposites');
});

module.exports = bot;
