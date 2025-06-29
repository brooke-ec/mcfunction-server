import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import grammar from "syntax-mcfunction/mcfunction.tmLanguage.json";
import theme from "@catppuccin/vscode/themes/macchiato.json?theme";
import { wireTmGrammars } from "monaco-editor-textmate";
import configuration from "./language/configuration";
import onigasm from "onigasm/lib/onigasm.wasm?url";
import { Registry } from "monaco-textmate";
import * as monaco from "monaco-editor";
import { loadWASM } from "onigasm";

const SCOPE_MCFUNCTION = "mcfunction";

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

export { monaco };
