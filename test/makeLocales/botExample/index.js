/*
 * @author David Menger
 */
'use strict';

const { Router } = require('botnaut'); // eslint-disable-line

const TELL_ME_MORE_LIMIT = 3;
const SKIP_EXPERT_FLOWS = [
    'preBrewing', 'ceramicGrinder'
];

const bot = new Router();


/**
 * INITIAL
 */
bot.use('/', (req, res, postBack) => {
    res.text(res.t('Could this be right thing for you?'));

    postBack('yourMachine');
});

function chooseProductByState () {
    return {
        name: 'Product',
        productCode: '123',
        link: 'http://google.cz'
    };
}

/**
 * YOUR MACHINE
 */
bot.use('yourMachine', (req, res) => {
    const product = chooseProductByState();

    const tpl = res.genericTemplate();

    tpl.addElement(`${product.name} ${product.productCode}`, '80 chars of description required')
        .setElementUrl(product.link)
        .urlButton(res.t('Web detail'), product.link);

    tpl.send();

    const replies = {
        tellMe: res.t('I need to know more')
    };

    if (req.state.currentProductCode !== product.productCode) {
        res.setState({ currentProductCode: product.productCode });
        res.text(res.t('Is it interesting for you?'), replies);
    } else {
        res.text(res.t('Still want to know more? Check out the product web.'), replies);
    }
});


// fake texts for translator
const { beverages, knowledgeBase } = ((res = { t: w => w }) => ({
    beverages: {
        lungo: res.t('lungo'),
        cappuccino: res.t('cappuccino'),
        latteMacchiato: res.t('latte macchiato'),
        flatWhite: res.t('flat white'),
        doppio: res.t('doppio')
    },
    knowledgeBase: {
        varipresso: res.t('Machine has Varipresso technology, which allows you to make coffee with mild taste thanks to lower pressure'),
        foam: res.t('It can prepare coffee with frothed milk automatically thanks to Latte Perfetto cattle with automatic cleaning.'),
        premiumDesign: [
            res.t('Coffee machine has exclusive metal look'),
            res.t('Coffee machine has exclusive metal look and premium carafe')
        ],
        upToServings: res.t('Machine allows you to make up to %s servings without need for refilling cofee'),
        preBrewing: res.t('You can also customize pre-brewing of coffee.'),
        grinderAdjustments: res.t('Machine has %s degrees of grinder settings'),
        pannarello: res.t('Coffee machine has Panarello - steam jet, which you can use for milk frothing.'),
        cappuccinoFrother: res.t('Coffee machine has Cappuccino Frother - steam jet, which help you to make a milk foam.'),
        beverages: res.t('So, the machine can make %s drinks, including %s and of course Espresso.'),
        ceramicGrinder: res.t('As all Saeco coffee machine, this model has Ceramic Coffee grinder, integrated water filter has automated rinsing and de-scaling, fully removable brewing unit.'),
        dishwasherProof: res.t('You can also put parts of coffee machine into a dishwasher.'),
        guiType: [
            res.t('Display has 2 colors (premium White) and more than 30 icons display'),
            res.t('Display has 2 colors (premium White) and more than 30 icons display and many languages'),
            res.t('Machine has good looking blue LCD display')
        ],
        powerConsumption: res.t('As all Saeco machines are energy label compliant, this one has maximum power input %s W. Warranty is 24 months of course.')
    }
}))();

/**
 * TELL ME MORE INTERACTION
 */
bot.use('tellMe', (req, res, postBack) => {
    const { expert, tellMeMoreProduct } = req.state;
    const product = chooseProductByState();

    if (tellMeMoreProduct === product.productCode) {
        postBack('tellMeMore');
        return;
    }

    const tellMeMoreFeatures = Object.keys(knowledgeBase)
        .filter(feature => !!product[feature]
            && (expert || SKIP_EXPERT_FLOWS.indexOf(feature) === -1))
        .reverse()
        .reduce((obj, feature) => Object.assign(obj, {
            [feature]: product[feature]
        }), {});

    const tellMeMoreBeverages = Object.keys(beverages)
        .filter(beverage => !!product[beverage])
        .reduce((obj, beverage) => Object.assign(obj, {
            [beverage]: product[beverage]
        }), {});

    res.setState({
        tellMeMoreProduct: product.productCode,
        tellMeMoreFeatures,
        tellMeMoreBeverages,
        tellMeMoreOffset: 0
    });

    postBack('tellMeMore');
});

bot.use('tellMeMore', (req, res, postBack) => {
    const { tellMeMoreFeatures, tellMeMoreBeverages } = req.state;
    const featuresKeys = Object.keys(tellMeMoreFeatures);
    let { tellMeMoreOffset } = req.state;

    if (tellMeMoreOffset >= featuresKeys.length) {
        // over, let's reset values
        tellMeMoreOffset = 0;
    }

    const tellMeMoreEnd = Math.min(tellMeMoreOffset + TELL_ME_MORE_LIMIT, featuresKeys.length - 1);
    const isLast = tellMeMoreEnd >= featuresKeys.length - 1;

    const replies = {
        tellMeMore: res.tq('Tell me more'),
        yourMachine: res.tq('That\'s ok :)')
    };

    const talkAbout = featuresKeys.slice(tellMeMoreOffset, tellMeMoreEnd)
        .map((feature) => {
            switch (feature) {
                case 'upToServings':
                    return res.t(knowledgeBase.upToServings)
                        .replace('%s', tellMeMoreFeatures.upToServings);
                case 'grinderAdjustments':
                    Object.assign(replies, {
                        whyAdjustGrinder: res.tq('Why adjust grinder?')
                    });
                    return res.t(knowledgeBase.grinderAdjustments)
                        .replace('%s', tellMeMoreFeatures.grinderAdjustments);
                case 'beverages': {
                    const translatedBeverages = Object.keys(tellMeMoreBeverages)
                        .map(bev => res.t(beverages[bev]));

                    if (tellMeMoreBeverages.lungo) {
                        Object.assign(replies, { whatIsLungo: res.tq('What is lungo?') });
                    }

                    if (tellMeMoreBeverages.latteMacchiato) {
                        Object.assign(replies, { whatIsLatteMacchiato: res.tq('What is latte macchiato?') });
                    }

                    if (tellMeMoreBeverages.latteMacchiato) {
                        Object.assign(replies, { whatIsFlatWhite: res.tq('What is flat white?') });
                    }

                    return res.t(knowledgeBase.beverages)
                        .replace('%s', tellMeMoreFeatures.beverages)
                        .replace('%s', translatedBeverages.join(', '));
                }
                case 'powerConsumption':
                    return res.t(knowledgeBase.powerConsumption)
                        .replace('%s', tellMeMoreFeatures.powerConsumption);
                default: {
                    if (feature === 'pannarello') {
                        Object.assign(replies, { whatIsPannarello: res.tq('What is pannarello?') });
                    } else if (feature === 'cappuccinoFrother') {
                        Object.assign(replies, { whatIsFrother: res.tq('Cappuccino frother?') });
                    }
                    if (!Array.isArray(knowledgeBase[feature])) {
                        return res.t(knowledgeBase[feature]);
                    }
                    const textIndex = tellMeMoreFeatures[feature];
                    return res.t(knowledgeBase[feature][textIndex - 1]);
                }
            }
        });


    talkAbout.forEach((sentence, i) => {
        if (i + 1 === talkAbout.length && !isLast) {
            res.text(sentence, replies);
        } else {
            res.text(sentence);
        }
    });

    res.setState({ tellMeMoreOffset: tellMeMoreOffset + TELL_ME_MORE_LIMIT });

    if (isLast) {
        res.text(res.t('Still want know more?'));
        postBack('yourMachine');
    }
});

module.exports = bot;
