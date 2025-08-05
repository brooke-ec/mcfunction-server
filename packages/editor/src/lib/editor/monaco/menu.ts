import { Separator } from "monaco-editor/esm/vs/base/common/actions";
import { ActionDescriptor } from "./action";
import { editor } from ".";

const CONTRIBUTION_ID = "editor.contrib.contextmenu";

export type Anchor = { x: number; y: number };

type IEditorAction = import("monaco-editor").editor.IEditorAction & { enabled: true };

type ContextMenuController = import("monaco-editor").editor.IEditorContribution & {
	_doShowContextMenu: (actions: (IEditorAction | Separator)[], anchor: Anchor) => void;
};

export type BasicAction = {
	run: () => void | Promise<void>;
	label: string;
};

export function showContextmenu(anchor: Anchor, actions: (ActionDescriptor | BasicAction | "separator")[]) {
	if (!editor) throw new Error("Editor is not initialized");

	const controller = editor.getContribution(CONTRIBUTION_ID) as ContextMenuController | null;
	if (!controller) throw new Error("Context menu controller not found");

	controller._doShowContextMenu(
		actions.map((action) => {
			if (action === "separator") return new Separator();
			else if (action instanceof ActionDescriptor)
				return {
					label: action.definition.alias ?? action.definition.label,
					run: action.definition.run,
					id: action.definition.id,
					enabled: true,
				};
			else
				return {
					id: `custom.basic.${crypto.randomUUID()}`,
					label: action.label,
					run: action.run,
					enabled: true,
				};
		}),
		anchor,
	);
}
