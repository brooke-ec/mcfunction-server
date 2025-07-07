<script lang="ts" module>
	import { Tree, type TreeItem } from "melt/builders";
	import * as model from "./model.svelte";

	let tree = $state<Tree<TreeItem> | null>(null);

	export const select = (id: string) => tree?.select(id);

	export function newFile() {
		if (!tree?.selected) throw new Error("No file selected");
		model.newFile("new_function", tree.selected);
	}
</script>

<script lang="ts">
	import Node from "./Node.svelte";
	import { structure } from "./model.svelte";

	$effect(() => {
		tree = new Tree({ items: structure });
	});
</script>

{#if tree}
	<div {...tree.root}>
		{#if tree.children[0]}
			<Node node={tree.children[0]} />
		{/if}
	</div>
{/if}
