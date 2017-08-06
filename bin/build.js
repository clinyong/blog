const sm = require('sitemap');
const fs = require('fs');
const process = require('../lib/process');
const del = require('del');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');

function walkDir(root) {
    const stat = fs.statSync(root);

    if (stat.isDirectory()) {
        const dirs = fs.readdirSync(root).filter(item => !item.startsWith('.'));
        let results = dirs.map(sub => walkDir(`${root}/${sub}`));
        return [].concat(...results);
    } else {
        return root;
    }
}

function createSitemap() {
    let urlList = walkDir(distPath);
    urlList = urlList
        .filter(url => url.indexOf('.html') !== -1)
        .filter(url => url.indexOf('index.html') === -1)
        .map(url => ({
            url: '/' + url.split('/').slice(-2).join('/')
        }));
    const sitemap = sm.createSitemap({
        hostname: 'https://blog.leodots.me/',
        urls: [{ url: '/' }, ...urlList]
    });
    fs.writeFileSync(`${distPath}/sitemap.xml`, sitemap.toString());
}

function cleanDist() {
    return del([`${distPath}/**/*.html`]);
}

cleanDist().then(() => process(true)).then(createSitemap).catch(e => console.error(e));
