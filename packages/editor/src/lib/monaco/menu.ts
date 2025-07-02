import { editor } from "./Editor.svelte";

const CONTRIBUTION_ID = "editor.contrib.contextmenu";

export type MenuAction = {
	id: string;
	label: string;
	run: () => Promise<void>;
};

export type Anchor = { x: number; y: number };

declare type ContextMenuController = import("monaco-editor").editor.IEditorContribution & {
	_doShowContextMenu: (
		actions: (import("monaco-editor").editor.IEditorAction & { enabled: true })[],
		anchor: Anchor,
	) => void;
};

export function showContextmenu(anchor: Anchor, actions: MenuAction[]) {
	if (!editor) throw new Error("Editor is not initialized");

	const controller = editor.getContribution(CONTRIBUTION_ID) as ContextMenuController | null;
	if (!controller) throw new Error("Context menu controller not found");

	controller._doShowContextMenu(
		actions.map((o) => ({
			id: `custom.${o.id}`,
			run: o.run,
			enabled: true,
			label: o.label,
			alias: o.label,
			metadata: undefined,
			isSupported: () => true,
		})),
		anchor,
	);
}
