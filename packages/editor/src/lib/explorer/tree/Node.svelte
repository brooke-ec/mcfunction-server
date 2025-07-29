<script lang="ts">
	import { getSource, getTarget, pickup, sticky } from "./draggable.svelte";
	import RenameInput from "./RenameInput.svelte";
	import { showContextmenu } from "$lib/monaco";
	import { slide } from "svelte/transition";
	import type { Tree } from "melt/builders";
	import { ModelNode } from "./model.svelte";
	import Node from "./Node.svelte";
	import {
		createFunction,
		createDirectory,
		renamingId,
		select,
		refresh,
		setClipboard,
		pasteClipboard,
		movingId,
		rename,
		remove,
	} from "./Tree.svelte";

	import folderClosed from "mc-dp-icons/fileicons/imgs/folder.svg?no-inline";
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import folderOpen from "mc-dp-icons/fileicons/imgs/folder_open.svg?no-inline";
	import namespaceClosed from "mc-dp-icons/fileicons/imgs/namespace.svg?no-inline";
	import namespaceOpen from "mc-dp-icons/fileicons/imgs/namespace_open.svg?no-inline";

	let { node, level = -1 }: { node: Tree<ModelNode>["children"][number]; level?: number } = $props();

	let renaming = $derived(renamingId() == node.id);
	let label = $derived(node.id.split("/")[0]);
	let isTitle = $derived(level == -1);
	let expanded = $derived(node.children?.length && (node.expanded || isTitle));

	let icon = $derived.by(() => {
		if (!node.children) return mcfunction;
		else if (expanded) return level ? folderOpen : namespaceOpen;
		else return level ? folderClosed : namespaceClosed;
	});

	let children = $derived.by(() =>
		node.children?.toSorted((a, b) => {
			if (a.item.isDirectory() !== b.item.isDirectory()) return a.item.isDirectory() ? -1 : 1;
			return a.item.name.localeCompare(b.item.name);
		}),
	);

	function oncontextmenu(e: MouseEvent) {
		e.preventDefault();
		select(node.id);
		showContextmenu(e, [
			{
				label: "New Function...",
				run: createFunction,
			},
			{
				label: "New Directory...",
				run: createDirectory,
			},
			"separator",
			{
				label: "Cut",
				run: async () => setClipboard(node.id, true),
			},
			{
				label: "Copy",
				run: async () => setClipboard(node.id, false),
			},
			{
				label: "Paste",
				run: async () => pasteClipboard(node.id),
			},
			"separator",
			{
				label: "Reanme...",
				run: async () => rename(node.id),
			},
			{
				label: "Delete",
				run: async () => remove(node.id),
			},
		]);
	}
</script>

{#if getSource() == node.id}
	<div {@attach sticky} class="dragging">{label}</div>
{/if}

<li
	style="list-style-type: none"
	class:target={getTarget() == node.id}
	data-drop-target={!children ? undefined : node.id}
>
	<div style="display: flex;">
		<button
			class:moving={getSource() == node.id || movingId() == node.id}
			{@attach pickup(node.id, isTitle || renaming)}
			class:passive={!!getSource() || isTitle}
			{...renaming ? {} : node.attrs}
			{oncontextmenu}
			class="item"
		>
			{#if isTitle}
				<p class="title">FUNCTIONS</p>
			{:else}
				{#each { length: level }}<span class="indent"></span>{/each}
				<span class="icon" style="background-image: url({icon});"></span>
				{#if renaming}
					<RenameInput {label} blacklist={node.item.siblings.map((c) => c.name)} />
				{:else}
					<span class="label">{label}</span>
				{/if}
			{/if}
		</button>
		{#if isTitle}
			<span class="actions">
				<button class="codicon codicon-new-file" aria-label="New File" onclick={createFunction}></button>
				<button class="codicon codicon-new-folder" aria-label="New Folder" onclick={createDirectory}></button>
				<button class="codicon codicon-refresh" aria-label="Refresh" onclick={refresh}></button>
			</span>
		{/if}
	</div>
	{#if children && expanded}
		<ol transition:slide={{ duration: 150 }}>
			{#each children as child (child.id)}
				<Node node={child} level={level + 1} />
			{/each}
		</ol>
	{/if}
</li>

<style lang="scss">
	button {
		transition: background-color 150ms ease-in-out;
		background-color: transparent;
		font-size: 14px;
		cursor: default;
		color: inherit;
		outline: none;
		border: none;
	}

	.item {
		padding: 0 0 0 10px;
		text-align: left;
		display: flex;
		width: 100%;

		.indent {
			border-left: 1px solid var(--vscode-tree-indentGuidesStroke);
			margin: 0 10px 0 9px;
		}

		.icon {
			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;

			min-height: 16px;
			min-width: 16px;
		}

		.label {
			padding: 1px 0 1px 5px;
			user-select: none;
		}

		&.moving :not(.indent) {
			opacity: 0.5;
		}
	}

	.title {
		text-transform: uppercase;
		font-weight: bold;
		font-size: 14px;
	}

	.actions {
		display: flex;
		gap: 2px;

		button {
			color: var(--vscode-icon-foreground);
			border-radius: 5px;
			padding: 3px;
		}
	}

	button:not(.passive) {
		cursor: pointer;

		&:hover,
		&:focus {
			background-color: var(--vscode-list-hoverBackground);
		}

		&[data-selected] {
			background-color: var(--vscode-list-focusBackground);
		}
	}

	.dragging {
		background-color: var(--vscode-list-focusBackground);
		padding: 3px 5px 3px 15px;
		pointer-events: none;
		border-radius: 10px;
		position: absolute;
		user-select: none;
		font-size: 12px;
		opacity: 0.75;
		z-index: 100;
	}

	.target {
		background-color: var(--vscode-minimapSlider-background);
	}
</style>
