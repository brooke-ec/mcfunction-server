<script lang="ts">
	import { getId, getTarget, pickup, sticky } from "./draggable.svelte";
	import type { Tree, TreeItem } from "melt/builders";
	import { showContextmenu } from "$lib/monaco";
	import { slide } from "svelte/transition";
	import Node from "./Node.svelte";

	import folderClosed from "mc-dp-icons/fileicons/imgs/folder.svg?no-inline";
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import folderOpen from "mc-dp-icons/fileicons/imgs/folder_open.svg?no-inline";
	import namespaceClosed from "mc-dp-icons/fileicons/imgs/namespace.svg?no-inline";
	import namespaceOpen from "mc-dp-icons/fileicons/imgs/namespace_open.svg?no-inline";

	let { node, level = -1 }: { node: Tree<TreeItem>["children"][number]; level?: number } = $props();
	let label = $derived(node.id.split("/")[0]);
	let icon = $derived.by(() => {
		if (!node.children) return mcfunction;
		else if (node.expanded) return level ? folderOpen : namespaceOpen;
		else return level ? folderClosed : namespaceClosed;
	});

	function oncontextmenu(e: MouseEvent) {
		e.preventDefault();
		showContextmenu(e, [
			{
				id: "copy-file",
				label: "Copy",
				run: async () => alert("Copy File"),
			},
			"separator",
			{
				id: "copy-path",
				label: "Copy Function Path",
				run: async () => alert("Copy Path"),
			},
		]);
	}
</script>

{#if getId() == node.id}
	<div {@attach sticky} class="dragging">{label}</div>
{/if}

<li
	style="list-style-type: none"
	class:target={getTarget() == node.id}
	data-drop-target={!node.children ? undefined : node.id}
>
	<button class:item={!getId()} {...node.attrs} {oncontextmenu} {@attach pickup(node.id)}>
		{#if level == -1}
			<p class="title">FUNCTIONS</p>
		{:else}
			{#each { length: level }}<span class="indent"></span>{/each}
			<span class="icon" style="background-image: url({icon});"></span>
			<span class="label">{label}</span>
		{/if}
	</button>
	{#if node.children && (node.expanded || level < 0)}
		<ol transition:slide={{ duration: 150 }}>
			{#each node.children as child}
				<Node node={child} level={level + 1} />
			{/each}
		</ol>
	{/if}
</li>

<style lang="scss">
	button {
		transition: background-color 150ms ease-in-out;
		background-color: transparent;
		padding: 0 0 0 10px;
		text-align: left;
		font-size: 14px;
		color: inherit;
		display: flex;
		outline: none;
		border: none;
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
			width: 16px;
		}

		.label {
			padding: 1px 0 1px 5px;
			user-select: none;
		}

		.title {
			text-transform: uppercase;
			font-weight: bold;
			font-size: 14px;
		}
	}

	.item:not(:has(.title)) {
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
		background-color: var(--vscode-minimapSlider-background) !important;
	}
</style>
