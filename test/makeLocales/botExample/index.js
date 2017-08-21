
'use strict';

const bot = { use: () => {} };

bot.use('/route', (req, res) => {
    res.text(req.t('ahoj %s', req.state.user.firstName));
    const { t } = req;
    res.text(t('blabla'), {
        action: t('response action')
    });
});
