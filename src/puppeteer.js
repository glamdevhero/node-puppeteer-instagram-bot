const puppeteer = require('puppeteer');
const shuffle = require('shuffle-array');

let ops = require('../src/pouchDB');
let cnf = require('../config/config.json');

let run = async function () {

    // set up Puppeteer
    const browser = await puppeteer.launch({
        headless: cnf.settings.headless,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    page.setViewport({width: 1200, height: 764});

    // Load Instagram
    await page.goto('https://www.instagram.com');
    await page.waitFor(2500);
    await page.click(cnf.selectors.home_to_login_button);
    await page.waitFor(2500);

    // Login
    await page.click(cnf.selectors.username_field);
    await page.keyboard.type(cnf.username);
    await page.click(cnf.selectors.password_field);
    await page.keyboard.type(cnf.password);

    await page.click(cnf.selectors.login_button);
    await page.waitForNavigation();

    // Loop through shuffled hashtags
    let hashtags = shuffle(cnf.hashtags);

    for (let hl = 0; hl < hashtags.length; hl++) {

        // Search for hashtags
        await page.goto('https://www.instagram.com/explore/tags/' + hashtags[hl] + '/?hl=en');
        console.log('===> hashtag search: ' + hashtags[hl]);

        // Loop through the latest 9 posts
        for (let r = 1; r < 4; r++) {
            for (let c = 1; c < 4; c++) {

                //Try to select post, wait, if successful continue
                let br = false;
                await page.click('div:nth-child(4) > div > div:nth-child(' + r + ') > div:nth-child(' + c + ') > a').catch(() => {
                    br = true;
                });
                await page.waitFor(2250 + Math.floor(Math.random() * 250));
                if (br) continue;

                // Get post info
                let hasEmptyHeart = await page.$(cnf.selectors.post_heart_grey);

                let username = await page.evaluate(x => {
                    let element = document.querySelector(x);
                    return Promise.resolve(element ? element.innerHTML : '');
                }, cnf.selectors.post_username);

                let followStatus = await page.evaluate(x => {
                    let element = document.querySelector(x);
                    return Promise.resolve(element ? element.innerHTML : '');
                }, cnf.selectors.post_follow_link);

                console.log('---> Evaluate post from ' + username);

                // Decide to like post
                if (hasEmptyHeart !== null && Math.random() < cnf.settings.like_ratio) {
                    await page.click(cnf.selectors.post_like_button);
                    console.log('---> like for ' + username);
                    await page.waitFor(10000 + Math.floor(Math.random() * 5000));
                }

                // Decide to follow user
                let isArchivedUser;
                await ops.inArchive(username).then(() => isArchivedUser = true).catch(() => isArchivedUser = false);

                if (followStatus === 'Follow' && !isArchivedUser && Math.random() < cnf.settings.follow_ratio) {
                    await ops.addFollow(username).then(() => {
                        return page.click(cnf.selectors.post_follow_link);
                    }).then(() => {
                        console.log('---> follow for ' + username);
                        return page.waitFor(10000 + Math.floor(Math.random() * 5000));
                    }).catch(() => {
                        console.log('---> Already following ' + username);
                    });
                }

                // Close post
                await page.click(cnf.selectors.post_close_button).catch(() => console.log(':::> Error closing post'));
            }
        }

    }

    // Unfollows
    if (cnf.settings.do_unfollows) {

        let cutoff = new Date().getTime() - (cnf.settings.unfollow_after_days * 86400000);
        let follows = await ops.getFollows();
        let unfollows = [];

        follows.rows.forEach(user => {
            if (user.doc.added < cutoff) {
                unfollows.push(user.doc._id);
            }
        });

        for (let n = 0; n < unfollows.length; n++) {

            let user = unfollows[n];
            await page.goto('https://www.instagram.com/' + user + '/?hl=en');
            await page.waitFor(1500 + Math.floor(Math.random() * 500));

            let followStatus = await page.evaluate(x => {
                let element = document.querySelector(x);
                return Promise.resolve(element ? element.innerHTML : '');
            }, cnf.selectors.user_unfollow_button);

            if (followStatus === 'Following') {
                console.log('---> unfollow ' + user);
                await page.click(cnf.selectors.user_unfollow_button);
                await page.waitFor(750);
                await page.click(cnf.selectors.user_unfollow_confirm_button);
                ops.unFollow(user);
                await page.waitFor(15000 + Math.floor(Math.random() * 5000));
            } else {
                console.log('---> archive ' + user);
                ops.unFollow(user);
            }
        }

    }

    // Close browser
    browser.close();

};

module.exports = run;