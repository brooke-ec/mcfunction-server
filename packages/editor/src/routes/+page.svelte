<script lang="ts">
	import Editor from "$lib/Editor.svelte";
	import "greset";
</script>

<Editor />

<style lang="scss">
	:global(body) {
		overflow: hidden;
		max-width: 100vw;
		max-height: 100vh;
	}

	:global(::selection) {
		background-color: var(--vscode-selection-background);
	}
</style>
