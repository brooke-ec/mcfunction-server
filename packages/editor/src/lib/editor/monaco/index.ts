import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import grammar from "syntax-mcfunction/mcfunction.tmLanguage.json";
import theme from "@catppuccin/vscode/themes/macchiato.json?theme";
import { wireTmGrammars } from "monaco-editor-textmate";
import configuration from "./language/configuration";
import onigasm from "onigasm/lib/onigasm.wasm?url";
import { Registry } from "monaco-textmate";
import * as monaco from "monaco-editor";
import * as actions from "../actions";
import { loadWASM } from "onigasm";

export const DEFAULT_MODEL = monaco.editor.createModel("");
export const SCOPE_MCFUNCTION = "mcfunction";

self.MonacoEnvironment = {
	getWorker: () => new EditorWorker(),
};

monaco.languages.register({ id: SCOPE_MCFUNCTION });
monaco.languages.setLanguageConfiguration(SCOPE_MCFUNCTION, configuration);

const registry = new Registry({
	getGrammarDefinition: async () => ({
		format: "json",
		content: grammar,
	}),
});

loadWASM(onigasm)
	.catch(() => null)
	.then(() => wireTmGrammars(monaco, registry, new Map([[SCOPE_MCFUNCTION, grammar.scopeName]])));

monaco.editor.defineTheme("catppuccin-macchiato", theme);

export let renaming: monaco.editor.IContextKey<boolean>;
export let editor: monaco.editor.IStandaloneCodeEditor;

export function create(element: HTMLElement) {
	editor = monaco.editor.create(element, { theme: "catppuccin-macchiato", model: DEFAULT_MODEL });

	renaming = editor.createContextKey("renaming", false);
	for (const action of Object.values(actions)) action.register();

	const observer = new ResizeObserver(() => {
		editor?.layout({
			width: element.clientWidth * 0.8,
			height: element.clientHeight - 35,
		});
	});

	observer.observe(element);
	editor.focus();

	editor.onDidDispose(() => {
		observer.unobserve(element);
	});

	return editor;
}
