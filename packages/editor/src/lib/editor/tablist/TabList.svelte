<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { getTabs } from "./model.svelte";
	import Sortable from "sortablejs";
	import Tab from "./Tab.svelte";

	const sortable: Attachment<HTMLElement> = (element) => {
		const s = new Sortable(element, {
			animation: 150,
		});

		return s.destroy.bind(s);
	};
</script>

<div class="tab-list" {@attach sortable}>
	{#each getTabs() as tab (tab.model.uri.path)}
		<Tab {tab} />
	{/each}
</div>

<style lang="scss">
	.tab-list {
		background-color: var(--vscode-textBlockQuote-border);
		display: flex;
	}
</style>
