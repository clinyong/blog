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
        index: resolve("./pages/index"),
        post: resolve("./pages/post")
    },
    dllEntry: {
        vendors: ["react", "react-dom"]
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
            "index": {
                page: "index",
                query: {
                    articles: files.map(item => ({
                        link: item.link,
                        title: item.title
                    }))
                }
            }
        });
    }
});
