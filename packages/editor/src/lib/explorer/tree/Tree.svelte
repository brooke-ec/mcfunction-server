<script lang="ts" module>
	import { Tree } from "melt/builders";
	import { ModelNode, popl, type ModelRoot } from "./model.svelte";

	let model = $state<ModelRoot>(ModelNode.create());

	// svelte-ignore non_reactive_update
	let tree: Tree<ModelNode> | null = null;

	export const select = (id: string) => tree?.select(id);

	let renaming = $state<{ id: string; submit: (value: string) => void } | null>(null);
	export const renamingId = () => renaming?.id ?? null;
	export function submitRename(value: string) {
		renaming?.submit(value);
		renaming = null;
	}

	export function expand(id: string | null) {
		if (!tree) throw new Error("Tree not initialized");
		while (id !== null) {
			tree.expand(id);
			id = popl(id).remaining;
		}
	}

	export const rename = (id: string) => new Promise<string>((submit) => (renaming = { id, submit }));

	async function create(factory: (parent: ModelNode) => ModelNode) {
		if (!tree?.selected) throw new Error("No file selected");
		let parent = model.resolve(tree.selected);
		if (parent.isFunction()) parent = parent.parent;

		expand(parent.id);
		const result = factory(parent);

		const name = await rename(result.id);
		if (!name) result.delete();
		else result.name = name;
	}

	export const createFunction = () => create((parent) => parent.createFunction(""));
	export const createDirectory = () => create((parent) => parent.createDirectory(""));

	export const refresh = () => model.refresh();
</script>

<script lang="ts">
	import Node from "./Node.svelte";
	import { onMount } from "svelte";

	tree = new Tree({ items: [model] });
	onMount(refresh);
</script>

{#if tree}
	<div {...tree.root}>
		{#if tree.children[0]}
			<Node node={tree.children[0]} />
		{/if}
	</div>
{/if}
