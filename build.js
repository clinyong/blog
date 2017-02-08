const template = require("art-template");
const fs = require("fs");
const path = require("path");
const showdown = require("showdown"),
    converter = new showdown.Converter();

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
            content
        });
        const distName = fileName.replace(".md", ".html");
        fs.writeFileSync(
            `${dist}/archives/${distName}`,
            html,
            "utf8"
        );
        articles.push({title, date, name: distName});
    });

    return articles.sort((a, b) => a.date > b.date ? -1 : 1);
}

const articles = processArticles();
const indexContent = template("index", {
    articles
});
fs.writeFileSync(`${dist}/index.html`, indexContent, "utf8");
