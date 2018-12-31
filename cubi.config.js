const path = require("path");
const { validateConfig } = require("cubi");
const { readArticles, readAbout, readResume } = require("./lib/readContent");
const { DIST_PATH } = require("./config");

function resolve(p) {
    return path.resolve(__dirname, p);
}

module.exports = validateConfig({
    rootPath: resolve("./src"),
    name: "blog",
    title: "blog",
    htmlTemplate: path.resolve(__dirname, "./templates/index.html"),
    entry: {
        index: resolve("./src/view/Index"),
        post: resolve("./src/view/Post"),
        about: resolve("./src/view/About"),
        resume: resolve("./src/view/Resume"),
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
    outputPath: DIST_PATH,
    devPort: 8687,
    devServer: {
        port: 8687
    },
    async exportPathMap() {
        const articles = await readArticles();
        const pages = articles.reduce(
            (pages, file) =>
                Object.assign({}, pages, {
                    [file.link]: {
                        page: "post",
                        title: file.title,
                        query: { content: file.result }
                    }
                }),
            {}
        );

        const aboutContent = await readAbout();
        const resumeContent = await readResume();

        return Object.assign({}, pages, {
            index: {
                page: "index",
                title: "",
                query: {
                    articles: articles.slice(0, 10).map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            archive: {
                page: "archive",
                title: "归档",
                query: {
                    articles: articles.map(item => ({
                        link: item.link + ".html",
                        title: item.title
                    }))
                }
            },
            about: {
                page: "about",
                title: "关于",
                query: {
                    content: aboutContent
                }
            },
            resume: {
                page: "resume",
                query: {
                    content: resumeContent
                }
            }
        });
    }
});
