const readArticles = require("./lib/readArticles");

module.exports = {
	async exportPathMap() {
		const files = await readArticles();
		const pages = files.reduce(
			(pages, file) =>
				Object.assign({}, pages, {
					[file.link]: {
						page: "/post",
						query: { content: file.result }
					}
				}),
			{}
		);

		return Object.assign({}, pages, {
			"/": {
				page: "/",
				query: {
					articles: files.map(item => ({
						link: item.link,
						title: item.title
					}))
				}
			}
		});
	}
};
