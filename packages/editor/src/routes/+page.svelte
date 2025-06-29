<script lang="ts">
	import Explorer from "$lib/explorer/Explorer.svelte";
	import Editor from "$lib/monaco";
	import "greset";
</script>

<main>
	<Explorer />
	<div class="editor">
		<Editor />
	</div>
</main>

<style lang="scss">
	main {
		height: 100vh;
		display: flex;
	}

	.editor {
		flex-grow: 1;
		overflow: hidden;
	}
</style>
