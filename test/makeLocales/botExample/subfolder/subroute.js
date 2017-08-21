
'use strict';

const bot = { use: () => {} };

bot.use('/route', (req, res) => {
    res.text(req.t('ahoj %s', req.state.user.firstName));
});
