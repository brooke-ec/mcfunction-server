<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import Explorer from "./explorer/Explorer.svelte";
	import TabList from "./tablist/TabList.svelte";
	import { create } from "./monaco";

	let loading = $state(true);

	const attach: Attachment<HTMLElement> = (element) => {
		loading = true;
		const editor = create(element);
		editor.onDidScrollChange(() => (loading = false));

		return () => editor.dispose();
	};
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main {@attach attach} tabindex="0">
	{#if !loading}
		<Explorer />
		<TabList />
	{/if}
</main>

<style lang="scss">
	main {
		height: 100vh;
		outline: none;
		width: 100%;

		display: grid;
		grid-template-columns: repeat(2, auto);
		grid-template-rows: repeat(2, auto);
		grid-template-areas:
			"explorer tablist"
			"explorer editor";
	}
</style>
