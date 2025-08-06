// @ts-nocheck

import { EditorAction, registerEditorAction } from "monaco-editor/esm/vs/editor/browser/editorExtensions.js";
import { EditorContextKeys } from "monaco-editor/esm/vs/editor/common/editorContextKeys.js";
import { IQuickInputService } from "monaco-editor/esm/vs/platform/quickinput/common/quickInput.js";
import { Extensions } from "monaco-editor/esm/vs/platform/quickinput/common/quickAccess.js";
import { Registry } from "monaco-editor/esm/vs/platform/registry/common/platform.js";
import { DisposableStore } from "monaco-editor/esm/vs/base/common/lifecycle.js";
import { getModel } from "../explorer/tree/Tree.svelte";
import { ModelTab } from "../tablist/model.svelte";
import { KeyMod, KeyCode } from "monaco-editor";

class OpenQuickAccessProvider {
	provide(picker) {
		const disposables = new DisposableStore();

		disposables.add(
			picker.onDidAccept(() => {
				const [item] = picker.selectedItems;
				if (item) ModelTab.add(item.description).switch();
			}),
		);

		// Fill in all providers
		picker.items = this.createPicks();
		return disposables;
	}
	createPicks() {
		return getModel()
			.walkFunctions()
			.map((f) => ({
				label: f.name,
				description: f.path,
				ariaLabel: "quick open function",
			}));
	}
}

export class GotoLineAction extends EditorAction {
	static {
		this.ID = "custom.quick-open";
	}

	constructor() {
		super({
			id: GotoLineAction.ID,
			label: "Show Quick Open",
			alias: "Show Quick Open",
			precondition: undefined,
			kbOpts: {
				kbExpr: EditorContextKeys.focus,
				primary: [KeyMod.CtrlCmd | KeyCode.KeyP],
				weight: 100 /* KeybindingWeight.EditorContrib */,
			},
		});
	}
	run(accessor) {
		accessor.get(IQuickInputService).quickAccess.show("@");
	}
}

registerEditorAction(GotoLineAction);

const registry = Registry.as(Extensions.Quickaccess);
registry.providers = registry.providers.filter((p) => !p.prefix.startsWith("@"));
registry.registerQuickAccessProvider({
	ctor: OpenQuickAccessProvider,
	helpEntries: [{ description: "Open Function...", commandId: GotoLineAction.ID }],
	prefix: "@",
});
