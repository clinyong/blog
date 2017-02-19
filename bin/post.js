const newArticle = require('../lib/newArticle');
const chalk = require('chalk');
const path = require('path');

const name = process.argv[2];
if (name === undefined) {
    console.log(chalk.red('Please input the file name. Usage: make post name=xxx'));
    return;
}

const postDir = path.resolve(__dirname, '../src/post');
const fullName = newArticle(postDir, name);
console.log(chalk.green(`Create ${fullName} successfully.`));
