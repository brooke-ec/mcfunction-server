<script lang="ts">
	import type { Attachment } from "svelte/attachments";
	import { getActive, getTabs } from "./model.svelte";
	import Cover from "./Cover.svelte";
	import Sortable from "sortablejs";
	import Tab from "./Tab.svelte";

	const sortable: Attachment<HTMLElement> = (element) => {
		const s = new Sortable(element, {
			animation: 150,
		});

		return s.destroy.bind(s);
	};

	let active = $derived(getActive());
</script>

<svelte:head>
	<title>
		{(active ? (active.dirty ? "● " : "") + active.name + " - " : "") + "mcfunction-server"}
	</title>
</svelte:head>

<div class="tab-list" {@attach sortable}>
	{#each getTabs() as tab (tab.model.uri.path)}
		<Tab {tab} />
	{/each}
	{#if active !== null}
		<button class="save codicon codicon-save" aria-label="save file" onclick={() => active.save()}></button>
	{/if}
</div>

<Cover />

<style lang="scss">
	.tab-list {
		background-color: var(--vscode-textBlockQuote-border);
		display: flex;
	}

	.save {
		transition: background-color 150ms ease-in-out;
		margin: 5px 5px 5px auto;
		border-radius: 5px;
		background: none;
		min-width: 25px;
		font-size: 14px;
		border: none;

		&:hover {
			background-color: var(--vscode-list-focusBackground);
		}
	}
</style>
