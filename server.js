const express = require("express");
const fs = require("fs");
const process = require("./process");
const chalk = require("chalk");

const app = express();

fs.watch("./src", {recursive: true}, () => {
    process();
});

app.use(express.static("./dist"));

const port = 8080;
app.listen(port, () => {
    console.log(chalk.yellow("Starting up successfully. Available on:"));
    console.log(chalk.green(`\n    http://127.0.0.1:${8080}`));
});
