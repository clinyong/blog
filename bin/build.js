const sm = require('sitemap');
const fs = require('fs');
const process = require('../lib/process');
const del = require('del');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');

function listFiles(dirPath) {
    return new Promise(resolve => {
        const dir = fs.readdirSync(dirPath);
        resolve(dir.filter(item => !item.startsWith('.')));
    });
}

function checkStatus(dirPath) {
    return new Promise(resolve => {
        const dir = fs.statSync(dirPath);
        resolve(dir);
    });
}

function walkDir(dirPath) {
    return checkStatus(dirPath).then(status => {
        if (status.isDirectory()) {
            return listFiles(dirPath).then(list => Promise.all(
                list.map(item => walkDir(`${dirPath}/${item}`))
            )).then(sub => [].concat(...sub));
        } else {
            return dirPath.replace('./dist', '');
        }
    });
}

function createSitemap() {
    walkDir(distPath)
        .then(urls => urls.filter(url => url.indexOf('.html') !== -1))
        .then(urls => urls.filter(url => url.indexOf('index.html') === -1))
        .then(urls => urls.map(url => ({
            url: '/' + url.split('/').slice(-2).join('/')
        })))
        .then(urlList => {
            const sitemap = sm.createSitemap({
                hostname: 'https://blog.leodots.me/',
                urls: [{ url: '/'}, ...urlList]
            });
            fs.writeFileSync(`${distPath}/sitemap.xml`, sitemap.toString());
        });

}

function cleanDist() {
    return del([`${distPath}/**/*.html`]);
}

cleanDist().then(() => process(true)).then(createSitemap);
