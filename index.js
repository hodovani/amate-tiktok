const fs = require("fs")
const https = require("https")
const http = require("http");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const tiktokUrl =
  "https://www.tiktok.com/music/UNO-6802921556063307778?lang=en";
const waitUntil = "networkidle0";
const keyToRightUrl = "share/item";

function downloadHTTPS(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https
    .get(url, function(response) {
      response.pipe(file);
      file.on("finish", function() {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on("error", function(err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
};

function downloadHTTP(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http
    .get(url, function(response) {
      response.pipe(file);
      file.on("finish", function() {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on("error", function(err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
};

function downloadVideos(rawData){

let response = JSON.parse(rawData);

response.body.itemListData.forEach(function (item, i) {
  const url = item.itemInfos.video.urls[0];
  const name = url.slice(-20);
  if (String(url).includes("https")) {
    downloadHTTPS(url, `./videos/${name}.mp4`);
  } else {
    downloadHTTP(url, `./videos/${name}.mp4`);
  }
});
}

puppeteer.use(StealthPlugin());

  async function main() {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        height: 1024,
        width: 1280,
      },
    });
    const ctx = await browser.createIncognitoBrowserContext();
    const page = await ctx.newPage();
    let urls = [];

      await page.setRequestInterception(true);
      page.on("request", (interceptedRequest) => {
        const url = interceptedRequest.url()
        if (url.includes(keyToRightUrl)) {
          console.log(url)
        }
        interceptedRequest.continue();
      });
      page.on("requestfinished", (request) => {
        const url = request.url();
if (url.includes(keyToRightUrl)) {
  console.log(url);
}
      });

      page.on("response", async (response) => {
        const url = response.url();
        if (url.includes(keyToRightUrl)) {
          const text = await response.text();
          console.log(url);
          downloadVideos(text);
        }
      });

    await page.goto(tiktokUrl, {
      timeout: 30000,
      waitUntil: waitUntil,
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await ctx.close();
    await browser.close();
  }

  main();
