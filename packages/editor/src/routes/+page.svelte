<script lang="ts">
	import Toaster from "$lib/toast/Toaster.svelte";

	import "greset";
	import "$lib/global.scss";
	import Loading from "./Loading.svelte";
</script>

<Toaster />

<!-- Import the editor functionality completely on the clientside -->
{#await import("$lib/editor/Editor.svelte") then { default: Editor }}
	<Editor />
{/await}

<Loading />
