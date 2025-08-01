<script lang="ts">
	import Toaster from "$lib/toast/Toaster.svelte";
	import "greset";
</script>

<Toaster />

<!-- Import the editor functionality completely on the clientside -->
{#await import("$lib/editor/Editor.svelte") then { default: Editor }}
	<Editor />
{/await}

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
