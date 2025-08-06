import { Extensions, type QuickAccessPicker } from "monaco-editor/esm/vs/platform/quickinput/common/quickAccess";
import { Registry } from "monaco-editor/esm/vs/platform/registry/common/platform";
import { DisposableStore } from "monaco-editor/esm/vs/base/common/lifecycle";
import { getModel } from "../explorer/tree/Tree.svelte";
import { ModelTab } from "../tablist/model.svelte";
import { quickOpen } from "../actions";

class OpenQuickAccessProvider {
	public provide(picker: QuickAccessPicker): DisposableStore {
		const disposables = new DisposableStore();

		disposables.add(
			picker.onDidAccept(() => {
				const [item] = picker.selectedItems;
				if (item) ModelTab.add(item.description).switch();
			}),
		);

		// Fill in all providers
		picker.items = getModel()
			.walkFunctions()
			.map((f) => ({
				label: f.name,
				description: f.path,
				ariaLabel: "quick open function",
			}));

		return disposables;
	}
}

const registry = Registry.as(Extensions.Quickaccess);
registry.providers = registry.providers.filter((p) => !p.prefix.startsWith("@"));
registry.registerQuickAccessProvider({
	ctor: OpenQuickAccessProvider,
	helpEntries: [{ description: "Open Function...", commandId: quickOpen.id }],
	prefix: "@",
});
