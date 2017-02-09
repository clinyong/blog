const express = require("express");
const fs = require("fs");
const build = require("./build");

const app = express();

fs.watch("./src", {recursive: true}, () => {
    build();
});

app.use(express.static("./dist"));
app.listen(8080, () => {
    console.log("The server is Listening on 8080");
});
