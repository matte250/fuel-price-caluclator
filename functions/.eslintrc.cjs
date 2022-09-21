module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
		browser: true,
	},
	extends: [
		"eslint:recommended",
		"google",
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"semi": ["error", "never"],
		"quotes": ["error", "double"],
		"max-len": ["error", {code: 120}],
		"indent": ["error", "tab"],
		"no-tabs": "off",
		"no-console": "warn",
	},
}
