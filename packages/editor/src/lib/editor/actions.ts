import { refresh } from "./Editor.svelte";
import * as tree from "./explorer/tree/Tree.svelte";
import { ActionDescriptor } from "./monaco/action";
import { KeyMod, KeyCode } from "monaco-editor";
import * as tabs from "./tablist/model.svelte";
import { goto } from "$app/navigation";
import { editor } from "./monaco";

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
	label: "Refresh from Server",
	alias: "Refresh",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyR],
	run: refresh,
});

export const copyPath = new ActionDescriptor({
	id: "custom.tree.copy-path",
	label: "Copy Function Path",
	run: tree.copyPath,
});

export const tabSave = new ActionDescriptor({
	id: "custom.tab.save",
	label: "Save Active Tab",
	alias: "Save",
	keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
	run: () => tabs.getActive()?.save(),
});

export const tabSaveAll = new ActionDescriptor({
	id: "custom.tab.save-all",
	label: "Save All Tabs",
	keybindings: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyS],
	run: () => tabs.getTabs().forEach((tab) => tab.save()),
});

export const logOut = new ActionDescriptor({
	id: "custom.log-out",
	label: "Log Out",
	run: () => goto("/logout"),
});

export const commandPalette = new ActionDescriptor({
	id: "custom.command-palette",
	label: "Open Command Palette",
	keybindings: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP],
	run: () => editor.trigger("keyboard", "editor.action.quickCommand", null),
});

export const closeTab = new ActionDescriptor({
	id: "custom.tab.close",
	label: "Close Active Tab",
	run: () => tabs.getActive()?.close(),
});
