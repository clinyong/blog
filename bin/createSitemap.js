const sm = require("sitemap");
const fs = require("fs-extra");
const path = require("path");
const { DIST_PATH } = require("../config");

const postPath = path.join(DIST_PATH, "post");
const sitemapPath = path.join(DIST_PATH, "sitemap.xml");

function walkDir(root) {
    return fs
        .readdir(root)
        .then(item => item.filter(item => !item.startsWith(".")));
}

function getPathID(filePath) {
    return Number(filePath.split("-")[0]);
}

async function createSitemap() {
    let urlList = await walkDir(postPath);
    urlList = urlList.sort((a, b) => getPathID(a) - getPathID(b)).map(url => ({
        url: "/post/" + url
    }));
    const sitemap = sm.createSitemap({
        hostname: "https://blog.leodots.me/",
        urls: [{ url: "/" }, ...urlList]
    });
    fs.writeFileSync(sitemapPath, sitemap.toString());
}

createSitemap();
