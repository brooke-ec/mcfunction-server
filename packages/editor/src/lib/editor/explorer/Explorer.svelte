<script>
	import Tree from "./tree/Tree.svelte";
</script>

<div class="explorer">
	<Tree />
</div>

<style lang="scss">
	.explorer {
		background-color: var(--vscode-editorActionList-background);
		color: var(--editorActionList-foreground);
		grid-area: explorer;
		padding-top: 10px;
		overflow-x: auto;
		min-width: 20vw;
		height: 100%;
	}
</style>
