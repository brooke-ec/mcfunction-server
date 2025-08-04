<script lang="ts">
	import Unauthenticated from "./Unauthenticated.svelte";
	import Loading from "./Loading.svelte";
	import * as info from "$lib/session";

	import "greset";
	import "$lib/global.scss";
</script>

{#await info.task then { authenticated }}
	{#if authenticated}
		<!-- Import the editor functionality completely on the clientside -->
		{#await import("$lib/editor/Editor.svelte") then { default: Editor }}
			<Editor />
		{/await}
	{:else}
		<Unauthenticated />
	{/if}
{/await}

<Loading />
