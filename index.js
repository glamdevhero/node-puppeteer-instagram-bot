let bot = require('./src/puppeteer');
let cnf = require('./config/config.json');

bot();
setInterval(bot, cnf.settings.run_every_x_hours * 3600000);

