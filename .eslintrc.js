module.exports = {
	parser: "babel-eslint",
	extends: "eslint:recommended",
	env: {
		browser: true,
		node: true
	},
	plugins: ["react"],
	globals: {
		ga: true
	},
	rules: {
		indent: ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-var": 2,
		"no-console": 0,
		"react/jsx-uses-vars": 1
	}
};
