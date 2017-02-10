const template = require("art-template");
const fs = require("fs");
const path = require("path");
const showdown = require("showdown"),
    converter = new showdown.Converter();
const postcss = require("postcss");
const precss = require("precss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sha1 = require("sha1");
const del = require("del");

template.config("base", path.resolve("./src/templates/"));
template.config("extname", ".html");
template.config("escape", false);
template.config("compress", true);
template.config("cache", false);

const dist = "./dist";

let inlineCSS = {};

function extractMetaData(text) {
    const lines = text.split("\n");

    let i = 0;
    for (; i < lines.length; i++) {
        if (lines[i] === "---") {
            break;
        }
    }

    const meta = {};
    lines.slice(0, i).forEach(line => {
        const items = line.split(":");
        meta[items[0]] = items[1].trim();
    });

    const content = lines.slice(i + 1).join("\n");
    return {
        meta,
        content
    };
}

function processArticles() {
    const articlePath = "./src/articles";
    const files = fs.readdirSync(articlePath);
    const articles = [];

    files.forEach(fileName => {
        const text = fs.readFileSync(
            `${articlePath}/${fileName}`,
            "utf8"
        );
        const result = extractMetaData(text);
        const {
            title,
            date
        } = result.meta;
        const content = converter.makeHtml(result.content);
        const html = template("article", {
            title,
            date,
            content,
            inlineCSS: inlineCSS["article"]
        });
        const distName = fileName.replace(".md", ".html");
        fs.writeFileSync(
            `${dist}/archives/${distName}`,
            html,
            "utf8"
        );
        articles.push({
            title,
            date,
            name: distName
        });
    });

    const indexContent = template("index", {
        articles: articles.sort((a, b) => a.date > b.date ? -1 : 1),
        inlineCSS: inlineCSS["index"]
    });
    fs.writeFileSync(`${dist}/index.html`, indexContent, "utf8");
}

function processCSS() {
    const srcPath = "./src/scss";
    const distPath = "./dist/css";

    del.sync([`${distPath}/*.css`]);

    const files = fs.readdirSync(srcPath);

    return files.map(fileName => {
        if (fileName === "common.scss") {
            return;
        }

        const text = fs.readFileSync(
            `${srcPath}/${fileName}`,
            "utf8"
        );
        const md5Name = sha1(text).substr(0, 5);
        const distName = `${distPath}/${md5Name}.css`;

        return new Promise(resolve => {
            postcss([precss, autoprefixer, cssnano()])
                .process(text, {
                    from: `${srcPath}/${fileName}`,
                    to: distName
                }).then(result => {
                    inlineCSS[[fileName.replace(".scss", "")]] =
                        result.css;
                    resolve();
                });
        });
    });
}

module.exports = () => {
    Promise.all(processCSS()).then(processArticles);
};