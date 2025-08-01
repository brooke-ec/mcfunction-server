<script lang="ts" module>
	import { ModelNode, popl, type ModelDirectory, type ModelRoot } from "./model.svelte";
	import { renamingContext } from "$lib/Editor.svelte";
	import { Tree } from "melt/builders";

	let model = $state<ModelRoot>(ModelNode.create());

	// svelte-ignore non_reactive_update
	let tree: Tree<ModelNode> | null = null;

	// Renaming functionaility
	let renaming = $state<{ id: string; submit: (value: string) => void } | null>(null);
	export const renamingId = () => renaming?.id ?? null;
	export function submitRename(value: string) {
		renamingContext?.set(false);
		renaming?.submit(value);
		renaming = null;
	}

	const startRename = (id: string) =>
		new Promise<string>((submit) => {
			renamingContext?.set(true);
			renaming = { id, submit };
		});

	export async function rename() {
		const node = model.resolve(selected());
		const name = await startRename(node.id);
		if (node.name != name) await node.rename(name);
		select(node.id);
	}

	// Clipboard functionality
	let clipboard = $state<{ source: string; move: boolean } | null>(null);
	export const movingId = () => (clipboard?.move ? clipboard.source : null);
	export const canPaste = () => !!clipboard;

	export function setClipboard(move: boolean) {
		clipboard = { source: selected(), move };
	}

	export function pasteClipboard() {
		if (!clipboard) throw new Error("Clipboard is empty");
		paste(clipboard.source, selected(), clipboard.move);

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
		let parent = model.resolve(selected());
		if (parent.isFunction()) parent = parent.parent;

		expand(parent.id);
		const result = factory(parent);

		const name = await startRename(result.id);
		if (!name) result.delete();
		else {
			result.name = name;
			select(result.id);
			return result;
		}
	}

	export const refresh = () => model.refresh();

	export const createDirectory = () => create((parent) => parent.addDirectory(""));

	export async function createFunction() {
		const result = await create((parent) => parent.addFunction(""));

		if (result)
			await ofetch(result.path, {
				body: `# Function '${result.path}'`,
				baseURL: "/api/file",
				method: "PUT",
			});
	}

	export const select = (id: string) => tree?.select(id);

	export function selected() {
		if (tree?.selected === undefined) throw new Error("No item selected");
		return tree.selected;
	}

	export async function remove() {
		const node = model.resolve(selected());

		if (node.isRoot()) throw new Error("Cannot delete root node");

		if (!confirm(`Are you sure you want to delete '${node.name}'?`)) return;
		tree?.select("");
		node.delete();
	}

	export function paste(source: string, desination: string, move: boolean) {
		let d = model.resolve(desination);
		const s = model.resolve(source);
		if (d.isFunction()) d = d.parent;

		if (s.parent === d) return; // No move needed
		if (!d.isDirectory()) throw new Error(`'${d.id}' is not a directory`);

		if (d.includes(s.name)) alert(`Destination directory '${d.name}' already has a child named '${s.name}'`);
		else move ? s.move(d) : s.copy(d);
	}
</script>

<script lang="ts">
	import Node from "./Node.svelte";
	import { onMount } from "svelte";
	import { ofetch } from "ofetch";

	tree = new Tree({ items: [model] });
	onMount(refresh);
	tree.select("");
</script>

{#if tree}
	<ul class="tree" {...tree.root}>
		{#if tree.children[0]}
			<Node node={tree.children[0]} />
		{/if}
	</ul>
{/if}

<style lang="scss">
	.tree {
		height: 100%;
	}
</style>
