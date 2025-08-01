<script lang="ts">
	import * as monaco from "monaco-editor";
	import { onMount } from "svelte";

	let tabs = $state<monaco.editor.ITextModel[]>([]);
	function refresh() {
		tabs = monaco.editor.getModels();
	}

	monaco.editor.onWillDisposeModel(refresh);
	monaco.editor.onDidCreateModel(refresh);
	onMount(refresh);
</script>

<div class="tab-list">
	{#each tabs as tab}
		{tab.id}
	{/each}
</div>

<style lang="scss">
	.tab-list {
		background-color: var(--vscode-textBlockQuote-border);
		min-height: 35px;
	}
</style>
