const sm = require("sitemap");
const fs = require("fs-extra");
const path = require("path");

const distPath = path.resolve(__dirname, "../dist");
const postPath = path.join(__dirname, "../dist/post");

function walkDir(root) {
    return fs
        .readdir(root)
        .then(item => item.filter(item => !item.startsWith(".")));
}

async function createSitemap() {
    let urlList = await walkDir(postPath);
    urlList = urlList.map(url => ({
        url: "/post/" + url
    }));
    const sitemap = sm.createSitemap({
        hostname: "https://blog.leodots.me/",
        urls: [{ url: "/" }, ...urlList]
    });
    fs.writeFileSync(`${distPath}/sitemap.xml`, sitemap.toString());
}

createSitemap();
