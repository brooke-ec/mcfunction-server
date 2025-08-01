import * as tree from "./explorer/tree/Tree.svelte";
import { ActionDescriptor } from "./monaco/action";
import { KeyMod, KeyCode } from "monaco-editor";

export const newFunction = new ActionDescriptor({
	id: "custom.tree.new-function",
	label: "New Function",
	alias: "New Function...",
	precondition: "!renaming",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyM],
	run: tree.createFunction,
});

export const newDirectory = new ActionDescriptor({
	id: "custom.tree.new-directory",
	label: "New Directory",
	alias: "New Directory...",
	precondition: "!renaming",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyK],
	run: tree.createDirectory,
});

export const treeRename = new ActionDescriptor({
	id: "custom.tree.rename",
	label: "Rename Function or Directory",
	alias: "Rename...",
	precondition: "!renaming",
	keybindings: [KeyCode.F2],
	run: tree.rename,
});

export const treeDelete = new ActionDescriptor({
	id: "custom.tree.delete",
	label: "Delete Function or Directory",
	alias: "Delete",
	keybindings: [KeyCode.Delete],
	keybindingContext: "!editorTextFocus && !renaming",
	run: tree.remove,
});

export const treeCut = new ActionDescriptor({
	id: "custom.tree.cut",
	label: "Cut Function or Directory",
	alias: "Cut",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyX],
	keybindingContext: "!editorTextFocus && !renaming",
	run: () => tree.setClipboard(true),
});

export const treeCopy = new ActionDescriptor({
	id: "custom.tree.copy",
	label: "Copy Function or Directory",
	alias: "Copy",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyC],
	keybindingContext: "!editorTextFocus && !renaming",
	run: () => tree.setClipboard(false),
});

export const treePaste = new ActionDescriptor({
	id: "custom.tree.paste",
	label: "Paste Function or Directory",
	alias: "Paste",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyV],
	keybindingContext: "!editorTextFocus && !renaming",
	run: tree.pasteClipboard,
});

export const treeRefresh = new ActionDescriptor({
	id: "custom.tree.refresh",
	label: "Refresh Function Explorer",
	alias: "Refresh",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyR],
	run: tree.refresh,
});
