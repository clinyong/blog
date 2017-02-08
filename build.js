const template = require("art-template");
const fs = require("fs");
const path = require("path");

template.config("base", path.resolve("./src/templates/"));
template.config("extname", ".html");
template.config("compress", true);

const html = template("index", {});
const dist = "./dist";
fs.writeFileSync(`${dist}/index.html`, html, "utf8");
