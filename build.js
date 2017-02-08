const template = require("art-template");
const fs = require("fs");
const path = require("path");
const showdown = require("showdown"),
    converter = new showdown.Converter();
const postcss = require("postcss");
const precss = require("precss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

template.config("base", path.resolve("./src/templates/"));
template.config("extname", ".html");
template.config("compress", true);

const dist = "./dist";

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
            cssName: "article"
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
        cssName: "index"
    });
    fs.writeFileSync(`${dist}/index.html`, indexContent, "utf8");
}

function processCSS() {
    const srcPath = "./src/scss";
    const distPath = "./dist/css";

    const files = fs.readdirSync(srcPath);
    files.forEach(fileName => {
        const text = fs.readFileSync(
            `${srcPath}/${fileName}`,
            "utf8"
        );
        const distName = `${distPath}/${fileName.replace(".scss", ".css")}`;
        postcss([precss, autoprefixer, cssnano()])
            .process(text, {
                from: `${srcPath}/${fileName}`,
                to: distName
            }).then(result => {
                fs.writeFileSync(distName, result.css);
                if (result.map) {
                    fs.writeFileSync(`${distPath}/${fileName}.map`,
                        result.map);
                }
            });

    });
}

processCSS();
processArticles();
