const fs = require("fs");

function fillZero(num) {
    return num > 10 ? "" + num : "0" + num;
}

const formatTime = t => {
    const month = fillZero(t.getMonth() + 1);
    const date = fillZero(t.getDate());

    return `${t.getFullYear()}.${month}.${date}`;
};

module.exports = function(articlesDir, fileName) {
    const indexes = fs
        .readdirSync(articlesDir)
        .filter(name => !name.startsWith("."))
        .map(name => parseInt(name.split("-")[0], 10))
        .sort((a, b) => b - a);
    const max = indexes[0];

    const date = formatTime(new Date());
    const content = `
title:
date: ${date}
---
`
        .split("\n")
        .slice(1)
        .join("\n");

    const fullName = `${articlesDir}/${max + 1}-${fileName}.md`;
    fs.writeFileSync(fullName, content, {
        encoding: "utf8"
    });
    return fullName;
};
