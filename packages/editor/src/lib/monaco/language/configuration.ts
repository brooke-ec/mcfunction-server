import type monaco from "monaco-editor";

export default {
	comments: {
		// symbol used for single line comment. Remove this entry if your language does not support line comments
		lineComment: "#",
	},
	// symbols used as brackets
	brackets: [
		["{", "}"],
		["[", "]"],
		["(", ")"],
	],
	// symbols that are auto closed when typing
	autoClosingPairs: [
		{ open: "{", close: "}" },
		{ open: "[", close: "]" },
		{ open: "(", close: ")" },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
	],
	// symbols that can be used to surround a selection
	surroundingPairs: [
		{ open: "{", close: "}" },
		{ open: "[", close: "]" },
		{ open: "(", close: ")" },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
	],
} satisfies monaco.languages.LanguageConfiguration;
