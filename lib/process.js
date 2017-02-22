const template = require('art-template');
const fs = require('fs');
const path = require('path');
const showdown = require('showdown'),
    converter = new showdown.Converter();
const postcss = require('postcss');
const precss = require('precss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sha1 = require('sha1');

const resolvePath = seg => path.resolve(__dirname, seg);

const src = resolvePath('../src');
const dist = resolvePath('../dist');
const sassPath = {
    src: `${src}/scss`,
    dist: `${dist}/css`
};
const articlePath = {
    src: `${src}/post`,
    dist: `${dist}/archives`
};

template.config('base', resolvePath(`${src}/templates/`));
template.config('extname', '.html');
template.config('escape', false);
template.config('compress', true);
template.config('cache', false);

let inlineCSS = {};

function extractMetaData(text) {
    const lines = text.split('\n');

    let i = 0;
    for (; i < lines.length; i++) {
        if (lines[i] === '---') {
            break;
        }
    }

    const meta = {};
    lines.slice(0, i).forEach(line => {
        const items = line.split(':');
        meta[items[0]] = items[1].trim();
    });

    const content = lines.slice(i + 1).join('\n');
    return {
        meta,
        content
    };
}

function processArticles(isProduction) {
    const files = fs.readdirSync(articlePath.src);
    const articles = [];

    files.forEach(fileName => {
        const text = fs.readFileSync(
            `${articlePath.src}/${fileName}`,
            'utf8'
        );
        const result = extractMetaData(text);
        const {
            title,
            date
        } = result.meta;
        const content = converter.makeHtml(result.content);
        const html = template('article', {
            title,
            date,
            content,
            inlineCSS: inlineCSS['article'],
            isProduction
        });
        const distName = fileName.replace('.md', '.html');
        fs.writeFileSync(
            `${articlePath.dist}/${distName}`,
            html,
            'utf8'
        );
        articles.push({
            title,
            date,
            name: distName
        });
    });

    const indexContent = template('index', {
        articles: articles.sort((a, b) => a.date > b.date ? -1 : 1),
        inlineCSS: inlineCSS['index'],
        isProduction
    });
    fs.writeFileSync(`${dist}/index.html`, indexContent, 'utf8');
}

function processCSS() {
    const files = fs.readdirSync(sassPath.src);

    return files.map(fileName => {
        if (fileName === 'common.scss') {
            return;
        }

        const text = fs.readFileSync(
            `${sassPath.src}/${fileName}`,
            'utf8'
        );
        const md5Name = sha1(text).substr(0, 5);
        const distName = `${sassPath.dist}/${md5Name}.css`;

        return new Promise(resolve => {
            postcss([precss, autoprefixer, cssnano()])
                .process(text, {
                    from: `${sassPath.src}/${fileName}`,
                    to: distName
                }).then(result => {
                    inlineCSS[[fileName.replace('.scss', '')]] =
                        result.css;
                    resolve();
                });
        });
    });
}

module.exports = (isProduction = false) => {
    return Promise
        .all(processCSS())
        .then(() => processArticles(isProduction));
};
