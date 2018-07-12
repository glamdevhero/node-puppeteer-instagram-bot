# node-puppeteer-instagram-bot
A simple Node.js Instagram Bot using [Puppeteer.js](https://github.com/GoogleChrome/puppeteer)

This Instagram Bot will authenticate and login into your Instagram account. By providing a number of hashtags it creates engagement by liking posts and following users.
It uses [PouchDB](https://pouchdb.com/) as a local database to keep track of the users you are following and can unfollow users after a specific amount of days.

## How to run the bot
* Download or clone this repo.
* Run *npm install* to install libraries.
* Update the *config.json* file with your credentials and hashtags.
* Run *node index.js*.

## In depth guide
A complete guide on how the bot works is available here.

## Additional info
* This bot does not support two-factor authentication.
* This bot relies on css selectors to navigate the Instagram website. These selectors are defined in the *config.json*. Once in a while Instagram pushes a new design and the selectors need to be updated. There's no guarantee this repo will always have the latest selectors.
* Use responsibly, running this bot 24/24 is not a good idea and will get your account suspended or banned.
 