module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		// 'plugin:prettier/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js', 'docker/**'],
	rules: {
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/indent': ['error', 4, { "ignoredNodes": ["PropertyDefinition"] }],
		'indent': 'off',
		'max-len': ['warn', 120],
		'padding-line-between-statements': [
			'error',
			{ blankLine: "always", prev: "*", next: "function" },
			{ blankLine: "always", prev: "*", next: "for" },
			{ blankLine: "always", prev: "*", next: "while" },
			{ blankLine: "always", prev: "*", next: "return" },
			{ blankLine: "always", prev: "*", next: "throw" },
		],
		'function-call-argument-newline': ['error', 'consistent'],
		'comma-spacing': ['error', {
			'before': false,
			'after': true,
		}],
		"comma-dangle": ["error", {
			"arrays": "always-multiline",
			"objects": "always-multiline",
			"imports": "always-multiline",
			"exports": "always-multiline",
			"functions": "always-multiline"
		}],
		"space-infix-ops": "error",
		'no-trailing-spaces': 'error',
		"@typescript-eslint/type-annotation-spacing": 'error',
		'arrow-spacing': 'error',
		'no-multi-spaces': 'error',
		'object-curly-spacing': ['error', 'always'],
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'key-spacing': ['error', {
			'beforeColon': false,
			'afterColon': true,
		}],
		'space-before-function-paren': ['error', {
			"anonymous": "always",
			"named": "never",
			"asyncArrow": "always"
		}],
		'space-before-blocks': 'error',
		'quotes': ['error', 'single'],
		'semi': 'error',
	},
};
