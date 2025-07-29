<script lang="ts" module>
	import { ModelNode, popl, type ModelDirectory, type ModelRoot } from "./model.svelte";
	import { Tree } from "melt/builders";

	let model = $state<ModelRoot>(ModelNode.create());

	// svelte-ignore non_reactive_update
	let tree: Tree<ModelNode> | null = null;

	// Renaming functionaility
	let renaming = $state<{ id: string; submit: (value: string) => void } | null>(null);
	export const renamingId = () => renaming?.id ?? null;
	export function submitRename(value: string) {
		renaming?.submit(value);
		renaming = null;
	}

	export const rename = (id: string) => new Promise<string>((submit) => (renaming = { id, submit }));

	// Clipboard functionality
	let clipboard = $state<{ source: string; move: boolean } | null>(null);
	export const movingId = () => (clipboard?.move ? clipboard.source : null);

	export function setClipboard(source: string, move: boolean) {
		clipboard = { source, move };
	}

	export function pasteClipboard(target: string) {
		if (!clipboard) throw new Error("Clipboard is empty");
		paste(clipboard.source, target, clipboard.move);

		if (clipboard.move) clipboard = null;
	}

	export function expand(id: string | null) {
		if (!tree) throw new Error("Tree not initialized");
		while (id !== null) {
			tree.expand(id);
			id = popl(id).remaining;
		}
	}

	async function create(factory: (parent: ModelNode) => ModelNode) {
		if (tree?.selected === undefined) throw new Error("No file selected");
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

	export const select = (id: string) => tree?.select(id);

	export function paste(source: string, desination: string, move: boolean) {
		const s = model.resolve(source);
		const d = model.resolve(desination);

		if (s.parent === d) return; // No move needed
		if (!d.isDirectory()) throw new Error(`'${d.id}' is not a directory`);

		if (d.includes(s.name)) alert(`Destination directory '${d.name}' already has a child named '${s.name}'`);
		else move ? s.move(d) : s.copy(d);
	}
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
