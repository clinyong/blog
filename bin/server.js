const express = require("express");
const next = require("next");
const readArticles = require("../lib/readArticles");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

async function start() {
	await app.prepare();
	const server = express();
	const files = await readArticles();

	// custom route for posts
	server.get("/post/:name", (req, res) => {
		const file = files.find(item => item.link === req.path);
		return app.render(req, res, "/post", {
			content: file.result
		});
	});

	server.get("*", (req, res) => {
		return app.render(req, res, "/", {
			articles: files.map(item => ({
				link: item.link,
				title: item.title
			}))
		});
	});

	server.listen(port, err => {
		if (err) throw err;
		console.log(`> Ready on http://localhost:${port}`);
	});
}

start();
