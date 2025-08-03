<script lang="ts">
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import type { ModelTab } from "./model.svelte";

	let { tab }: { tab: ModelTab } = $props();

	let mouseover = $state<boolean>(false);
</script>

<div class="tab" class:active={tab.active}>
	<button class="switcher" role="tab" onclick={tab.switch.bind(tab)}>
		<img draggable="false" width="16" src={mcfunction} alt="MC Function Icon" class="icon" />
		<span class="function-name">{tab.name}</span>
	</button>
	<button
		class:codicon-circle-filled={tab.dirty && !mouseover}
		class:codicon-close={!tab.dirty || mouseover}
		onpointerenter={() => (mouseover = true)}
		onpointerleave={() => (mouseover = false)}
		onclick={tab.close.bind(tab)}
		class="close-button codicon"
		aria-label="close tab"
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
		transition: background-color 150ms ease-in-out;
		color: var(--vscode-icon-foreground);
		aspect-ratio: 1 / 1;
		height: min-content;
		border-radius: 5px;
		position: absolute;
		margin-top: 7px;
		padding: 2px;

		&:hover {
			background-color: var(--vscode-list-focusBackground);
		}
	}
</style>
