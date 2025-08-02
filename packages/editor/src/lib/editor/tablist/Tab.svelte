<script lang="ts">
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import { closeTab, switchTab } from "./TabList.svelte";
	import * as monaco from "monaco-editor";
	import { onMount } from "svelte";

	let { path, active }: { path: string; active: boolean } = $props();

	let mouseover = $state<boolean>(false);
	let lastSaved = $state<number>(0);
	let current = $state<number>(0);

	onMount(() => {
		const model = monaco.editor.getModel(monaco.Uri.file(path))!;

		current = model.getAlternativeVersionId();
		lastSaved = current;

		const event = model.onDidChangeContent(() => {
			current = model.getAlternativeVersionId();
		});

		return () => event.dispose();
	});

	function close() {
		if (lastSaved !== current)
			if (!confirm("You have unsaved changes. Are you sure you want to close this tab?")) return;
		closeTab(path);
	}
</script>

<div class="tab" class:active>
	<button class="switcher" role="tab" onclick={() => switchTab(path)}>
		<img draggable="false" width="16" src={mcfunction} alt="MC Function Icon" class="icon" />
		<span class="function-name">{path.split("/").pop()}</span>
	</button>
	<button
		class:codicon-circle-filled={!mouseover && lastSaved !== current}
		class:codicon-close={mouseover || lastSaved === current}
		onpointerenter={() => (mouseover = true)}
		onpointerleave={() => (mouseover = false)}
		class="close-button codicon"
		aria-label="close tab"
		onclick={close}
	></button>
</div>

<style lang="scss">
	.tab {
		background-color: var(--vscode-editorActionList-background);
		border-top: 1px solid transparent;
		padding-right: 25px;
		position: relative;
		user-select: none;

		&.active {
			border-top: 1px solid var(--vscode-icon-foreground);
			background-color: var(--vscode-editor-background);
		}
	}

	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
	}

	.switcher {
		white-space: nowrap;
		padding-bottom: 5px;
		padding-left: 10px;
		padding-right: 5px;
		height: 100%;
	}

	.function-name {
		font-size: 14px;
	}

	.close-button {
		color: var(--vscode-icon-foreground);
		aspect-ratio: 1 / 1;
		height: min-content;
		border-radius: 3px;
		position: absolute;
		margin-top: 7px;
		padding: 2px;

		&:hover {
			background-color: var(--vscode-list-focusBackground);
		}
	}
</style>
