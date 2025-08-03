<script lang="ts" module>
	import { getModel } from "./explorer/tree/Tree.svelte";
	import { getTabs } from "./tablist/model.svelte";

	export function refresh() {
		getTabs().forEach((tab) => tab.refresh());
		getModel().refresh();
	}
</script>

<script lang="ts">
	import { isLoading, setLoading } from "../../routes/Loading.svelte";
	import type { Attachment } from "svelte/attachments";
	import Explorer from "./explorer/Explorer.svelte";
	import TabList from "./tablist/TabList.svelte";
	import { create } from "./monaco";

	const attach: Attachment<HTMLElement> = (element) => {
		setLoading(true);
		const editor = create(element);
		editor.onDidScrollChange(() => setLoading(false));

		return () => editor.dispose();
	};
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main {@attach attach} tabindex="0">
	{#if !isLoading()}
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
		grid-template-columns: 20vw 80vw;
		grid-template-rows: 35px auto;
		grid-template-areas:
			"explorer tablist"
			"explorer editor";
	}
</style>
