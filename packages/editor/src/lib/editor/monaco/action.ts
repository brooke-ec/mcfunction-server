import type { InstantiationAccessor } from "monaco-editor/esm/vs/platform/instantiation/common/instantiationService";
import { EditorAction, registerEditorAction } from "monaco-editor/esm/vs/editor/browser/editorExtensions";
import { ContextKeyExpr } from "monaco-editor/esm/vs/platform/contextkey/common/contextkey";

export interface ActionDefinition {
	id: string;
	label: string;
	alias?: string;
	keybind?: number[];
	precondition?: string;
	run: (accessor: InstantiationAccessor) => void | Promise<void>;
}

export function createAction(definition: ActionDefinition) {
	const ctor = class extends EditorAction {
		public static readonly ID = definition.id;

		public constructor() {
			super({
				id: definition.id,
				label: definition.label,
				alias: definition.alias ?? definition.label,
				precondition: definition.precondition && ContextKeyExpr.deserialize(definition.precondition),
				kbOpts: definition.keybind && {
					primary: definition.keybind,
				},
			});

			this.run = definition.run;
		}
	};

	return registerEditorAction(ctor);
}
