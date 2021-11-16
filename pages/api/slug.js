const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const chrome = require('chrome-aws-lambda');

export default async (req, res) => {
    // const slug = req?.query?.slug;
    // if (!slug) {
    //     res.statusCode = 200
    //     res.setHeader('Content-Type', 'application/json')
    //     res.end(JSON.stringify({ id: null }))
    //     return;
    // }

    const browser = await chrome.puppeteer.launch(
        {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        }

    );

    const page = await browser.newPage();
    page.setUserAgent('Opera/9.80 (J2ME/MIDP; Opera Mini/5.1.21214/28.2725; U; ru) Presto/2.8.119 Version/11.10');
    await page.goto(`https://gist.githubusercontent.com/agungjk/ff542367470d156478f7381af2cf7e60/raw/9e2eb9f542a6e528dc13ad57a74e1c3961deddb2/%255Bslug%255D.js`);

    let content = await page.content();
    console.log(content);
    var $ = cheerio.load(content);
    $.prototype.exists = function (selector) {
        return this.find(selector).length > 0;
    }

    // let id = null;
    // const isLive = $('body').exists('[data-style="LIVE"]');
    // if (isLive) {
    //     const url = $('ytm-compact-video-renderer .compact-media-item-image').attr('href');
    //     const arr = url.split('?v=');
    //     id = arr[1];
    // }

    await browser.close();

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ "Hello": content }))
}