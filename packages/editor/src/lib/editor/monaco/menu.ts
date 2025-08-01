import { Separator } from "monaco-editor/esm/vs/base/common/actions";
import type { ActionDescriptor } from "./action";
import { editor } from ".";

const CONTRIBUTION_ID = "editor.contrib.contextmenu";

export type Anchor = { x: number; y: number };

type IEditorAction = import("monaco-editor").editor.IEditorAction & { enabled: true };

type ContextMenuController = import("monaco-editor").editor.IEditorContribution & {
	_doShowContextMenu: (actions: (IEditorAction | Separator)[], anchor: Anchor) => void;
};

export function showContextmenu(anchor: Anchor, actions: (ActionDescriptor | "separator")[]) {
	if (!editor) throw new Error("Editor is not initialized");

	const controller = editor.getContribution(CONTRIBUTION_ID) as ContextMenuController | null;
	if (!controller) throw new Error("Context menu controller not found");

	controller._doShowContextMenu(
		actions.map((action) => {
			if (action === "separator") return new Separator();
			const definition = action.definition;
			return {
				id: definition.id,
				label: definition.alias,
				enabled: true,
				run: definition.run,
			};
		}),
		anchor,
	);
}
