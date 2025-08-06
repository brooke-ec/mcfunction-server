<script lang="ts" module>
	import { getModel } from "./explorer/tree/Tree.svelte";
	import { getTabs } from "./tablist/model.svelte";

	export function refresh() {
		getTabs().forEach((tab) => tab.refresh());
		getModel().refresh();
	}
</script>

<script lang="ts">
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import { isLoading, setLoading } from "../../routes/Loading.svelte";
	import type { Attachment } from "svelte/attachments";
	import Explorer from "./explorer/Explorer.svelte";
	import Toaster from "./toaster/Toaster.svelte";
	import TabList from "./tablist/TabList.svelte";
	import { create, editor } from "./monaco";

	const attach: Attachment<HTMLElement> = (element) => {
		setLoading(true);
		create(element).then(() => editor.onDidScrollChange(() => setLoading(false)));
		return () => editor.dispose();
	};
</script>

<Toaster />

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main {@attach attach} tabindex="0" style="--mcfunction-icon: url({mcfunction})">
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

	:global([aria-label="quick open function"]) {
		align-items: center;
		display: flex;

		&::before {
			content: "";

			position: relative;
			margin-right: -5px;
			margin-left: 5px;

			height: 16px;
			width: 16px;

			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
			background-image: var(--mcfunction-icon);
		}
	}
</style>
