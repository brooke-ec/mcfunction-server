import { IQuickInputService } from "monaco-editor/esm/vs/platform/quickinput/common/quickInput";
import * as tree from "./explorer/tree/Tree.svelte";
import { createAction } from "./monaco/action";
import { KeyMod, KeyCode } from "monaco-editor";
import * as tabs from "./tablist/model.svelte";
import { refresh } from "./Editor.svelte";
import * as monaco from "monaco-editor";
import { goto } from "$app/navigation";

export const newFunction = createAction({
	id: "custom.tree.new-function",
	label: "New Function",
	alias: "New Function...",
	precondition: "!renaming",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyM],
	run: tree.createFunction,
});

export const newDirectory = createAction({
	id: "custom.tree.new-directory",
	label: "New Directory",
	alias: "New Directory...",
	precondition: "!renaming",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyK],
	run: tree.createDirectory,
});

export const treeRename = createAction({
	id: "custom.tree.rename",
	label: "Rename Function or Directory",
	alias: "Rename...",
	precondition: "!renaming",
	keybind: [KeyCode.F2],
	run: tree.rename,
});

export const treeDelete = createAction({
	id: "custom.tree.delete",
	label: "Delete Function or Directory",
	alias: "Delete",
	keybind: [KeyCode.Delete],
	precondition: "!editorTextFocus && !renaming",
	run: tree.remove,
});

export const treeCut = createAction({
	id: "custom.tree.cut",
	label: "Cut Function or Directory",
	alias: "Cut",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyX],
	precondition: "!editorTextFocus && !renaming",
	run: () => tree.setClipboard(true),
});

export const treeCopy = createAction({
	id: "custom.tree.copy",
	label: "Copy Function or Directory",
	alias: "Copy",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyC],
	precondition: "!editorTextFocus && !renaming",
	run: () => tree.setClipboard(false),
});

export const treePaste = createAction({
	id: "custom.tree.paste",
	label: "Paste Function or Directory",
	alias: "Paste",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyV],
	precondition: "!editorTextFocus && !renaming",
	run: tree.pasteClipboard,
});

export const treeRefresh = createAction({
	id: "custom.tree.refresh",
	label: "Refresh from Server",
	alias: "Refresh",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyR],
	run: refresh,
});

export const copyPath = createAction({
	id: "custom.tree.copy-path",
	label: "Copy Function Path",
	run: tree.copyPath,
});

export const tabSave = createAction({
	id: "custom.tab.save",
	label: "Save Active Tab",
	alias: "Save",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyS],
	run: () => tabs.getActive()?.save(),
});

export const tabSaveAll = createAction({
	id: "custom.tab.save-all",
	label: "Save All Tabs",
	keybind: [KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyS],
	run: () => tabs.getTabs().forEach((tab) => tab.save()),
});

export const logOut = createAction({
	id: "custom.log-out",
	label: "Log Out",
	run: () => goto("/logout"),
});

export const closeTab = createAction({
	id: "custom.tab.close",
	label: "Close Active Tab",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyQ],
	run: () => tabs.getActive()?.close(),
});

monaco.editor.addKeybindingRule({
	command: "editor.action.quickCommand",
	keybinding: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyP,
});

export const quickOpen = createAction({
	id: "custom.quick-open",
	label: "Quick Open",
	keybind: [KeyMod.CtrlCmd | KeyCode.KeyP],
	run: (a) => a.get(IQuickInputService).quickAccess.show("@"),
});
