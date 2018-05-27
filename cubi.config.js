const path = require("path");
const { validateConfig } = require("cubi");
const readArticles = require("./lib/readArticles");

function resolve(p) {
    return path.resolve(__dirname, p);
}

module.exports = validateConfig({
    rootPath: resolve("./src"),
    name: "blog",
    title: "blog",
    entry: {
        index: resolve("./src/view/Index"),
        post: resolve("./src/view/Post"),
        about: resolve("./src/view/About"),
        archive: resolve("./src/view/Archive")
    },
    dllEntry: {
        vendors: ["react", "react-dom", "lodash/debounce"],
        __post: [
            "highlight.js/styles/github.css",
            "highlight.js/lib/highlight",
            "highlight.js/lib/languages/javascript",
            "highlight.js/lib/languages/typescript",
            "highlight.js/lib/languages/css",
            "highlight.js/lib/languages/xml"
        ]
    },
    outputPath: resolve("./dist"),
    devPort: 8687,
    devServer: {
        port: 8687
    },
    async exportPathMap() {
        const files = await readArticles();
        const pages = files.reduce(
            (pages, file) =>
                Object.assign({}, pages, {
                    [file.link]: {
                        page: "post",
                        query: { content: file.result }
                    }
                }),
            {}
        );

        return Object.assign({}, pages, {
            index: {
                page: "index",
                query: {
                    articles: files.slice(0, 10).map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            archive: {
                page: "archive",
                query: {
                    articles: files.map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            about: {
                page: "about"
            }
        });
    }
});
