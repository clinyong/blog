const sm = require("sitemap");
const fs = require("fs-extra");
const process = require("../lib/process");
const del = require("del");
const path = require("path");

const distPath = path.resolve(__dirname, "../dist");
const srcPath = path.resolve(__dirname, "../src");



function copyAssets() {
	const distAssets = path.join(distPath, "assets");
	fs.copySync(`${srcPath}/assets`, distAssets);
}

function cleanDist() {
	return del([`${distPath}/**/*.html`]);
}

cleanDist()
	.then(() => process(true))
	.then(createSitemap)
	.then(copyAssets)
	.catch(e => console.error(e));
