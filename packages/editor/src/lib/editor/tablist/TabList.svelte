<script lang="ts" module>
	import * as monaco from "monaco-editor";
	import { editor } from "../monaco";
	import Tab from "./Tab.svelte";

	export function openTab(path: string) {
		if (tabs.some((m) => m === path)) return;

		const model = monaco.editor.createModel("123", "mcfunction", monaco.Uri.file(path));
		tabs.push(path);

		editor.setModel(model);
		selected = path;
	}

	export function closeTab(path: string) {
		monaco.editor.getModel(monaco.Uri.file(path))?.dispose();
		const index = tabs.indexOf(path);
		tabs.splice(index, 1);

		if (tabs.length === 0) switchTab(null);
		else if (selected === path) switchTab(tabs[Math.min(Math.max(0, index - 1), tabs.length - 1)]);
	}

	export function switchTab(path: string | null) {
		if (path) editor.setModel(monaco.editor.getModel(monaco.Uri.file(path)));
		else editor.setModel(null);
		selected = path;
	}

	let selected = $state<string | null>(null);
	let tabs = $state<string[]>([]);
</script>

<div class="tab-list">
	{#each tabs as path (path)}
		<Tab {path} active={selected === path} />
	{/each}
</div>

<style lang="scss">
	.tab-list {
		background-color: var(--vscode-textBlockQuote-border);
		display: flex;
	}
</style>
