const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

export default async (req, res) => {
    const slug = req?.query?.videoId;
    if (!slug) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ id: null }))
        return;
    }
    console.log("Searching for vidoe id: " + slug)
    const browser = await chrome.puppeteer.launch(
        {
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        }

    );

    var functionToInject = function (slug) {
        let videos = window.ytInitialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents["0"].itemSectionRenderer.contents;
        if (!videos.length) { // includes other renderers i.e: "did you mean ..."
            console.log('no videos in search');
            return "";
        }
        let video = videos.filter(v => v.videoRenderer && v.videoRenderer.videoId == slug)
        if (!video.length) {
            console.log('no video by that ID in search');
            return "";
        }
        let thumbs = video[0].videoRenderer.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails;
        if (!thumbs.length) {
            console.log('no moving thumbs for that video');
            return "";
        }
        console.log(thumbs[0].url);
        return thumbs[0].url;
    }

    const page = await browser.newPage();
    await page.goto(`https://www.youtube.com/results?search_query=${slug}`);

    const response = await page.evaluate(functionToInject, slug);
    console.log("See me response");
    console.log(response);

    await browser.close();

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    if (response == "") {
        res.end(JSON.stringify({ "error": "No data found" }))
    } else {
        res.end(JSON.stringify({ "url": response }))
    }
}