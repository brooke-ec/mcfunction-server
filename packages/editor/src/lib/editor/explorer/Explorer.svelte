<script>
	import Tree from "./tree/Tree.svelte";
	import User from "./User.svelte";
</script>

<div class="explorer">
	<User />
	<Tree />
</div>

<style lang="scss">
	.explorer {
		background-color: var(--vscode-editorActionList-background);
		color: var(--editorActionList-foreground);
		grid-area: explorer;
		padding-top: 10px;
		overflow-x: auto;
		height: 100%;

		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
