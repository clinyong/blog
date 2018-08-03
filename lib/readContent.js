const fs = require("fs-extra");
const path = require("path");

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
        if (items.length === 2) {
            meta[items[0]] = items[1].trim();
        }
    });

    const content = lines
        .slice(i + 1)
        .join("\n")
        .replace(/\</g, "&lt;")
        .replace(/\>/, "&gt;");
    return {
        meta,
        content
    };
}

exports.readArticles = async function readArticles() {
    const srcPath = path.resolve(__dirname, "../src/content/article");
    let files = await fs.readdir(srcPath);
    files = files.filter(name => !name.startsWith(".")).map(name => {
        return fs.readFile(path.join(srcPath, name), "utf8").then(content => {
            const result = extractMetaData(content);
            const { meta } = result;
            return {
                link: "post/" + name.split(".")[0],
                result,
                title: meta.title,
                date: meta.date
            };
        });
    });

    return Promise.all(files).then(files =>
        files.sort((a, b) => (a.date > b.date ? -1 : 1))
    );
};

async function read(name) {
    const srcPath = path.resolve(__dirname, `../src/content/${name}.md`);
    return await fs.readFile(srcPath, "utf8");
}

exports.readAbout = async function readAbout() {
    return await read("about");
};

exports.readResume = async function readResume() {
    return await read("resume");
};
