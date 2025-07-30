import * as tree from "./explorer/tree/Tree.svelte";
import { ActionDescriptor } from "./monaco/action";

export const newFunction = new ActionDescriptor((monaco) => ({
	id: "custom.tree.new-function",
	label: "New Function",
	alias: "New Function...",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM],
	run: tree.createFunction,
}));

export const newDirectory = new ActionDescriptor((monaco) => ({
	id: "custom.tree.new-directory",
	label: "New Directory",
	alias: "New Directory...",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
	run: tree.createDirectory,
}));

export const treeRename = new ActionDescriptor((monaco) => ({
	id: "custom.tree.rename",
	label: "Rename Function or Directory",
	alias: "Rename...",
	keybindings: [monaco.KeyCode.F2],
	run: tree.rename,
}));

export const treeDelete = new ActionDescriptor((monaco) => ({
	id: "custom.tree.delete",
	label: "Delete Function or Directory",
	alias: "Delete",
	keybindings: [monaco.KeyCode.Delete],
	keybindingContext: "!editorTextFocus",
	run: tree.remove,
}));

export const treeCut = new ActionDescriptor((monaco) => ({
	id: "custom.tree.cut",
	label: "Cut Function or Directory",
	alias: "Cut",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX],
	keybindingContext: "!editorTextFocus",
	run: () => tree.setClipboard(true),
}));

export const treeCopy = new ActionDescriptor((monaco) => ({
	id: "custom.tree.copy",
	label: "Copy Function or Directory",
	alias: "Copy",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC],
	keybindingContext: "!editorTextFocus",
	run: () => tree.setClipboard(false),
}));

export const treePaste = new ActionDescriptor((monaco) => ({
	id: "custom.tree.paste",
	label: "Paste Function or Directory",
	alias: "Paste",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
	keybindingContext: "!editorTextFocus",
	run: tree.pasteClipboard,
}));

export const treeRefresh = new ActionDescriptor((monaco) => ({
	id: "custom.tree.refresh",
	label: "Refresh Function Explorer",
	alias: "Refresh",
	keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR],
	run: tree.refresh,
}));
