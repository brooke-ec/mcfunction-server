<script lang="ts">
	import type { Tree, TreeItem } from "melt/builders";
	import { slide } from "svelte/transition";
	import NodeList from "./NodeList.svelte";

	import folderClosed from "mc-dp-icons/fileicons/imgs/folder.svg?no-inline";
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg?no-inline";
	import folderOpen from "mc-dp-icons/fileicons/imgs/folder_open.svg?no-inline";
	import namespaceClosed from "mc-dp-icons/fileicons/imgs/namespace.svg?no-inline";
	import namespaceOpen from "mc-dp-icons/fileicons/imgs/namespace_open.svg?no-inline";

	let { children, level = 0 }: { children: Tree<TreeItem>["children"]; level?: number } = $props();

	function icon(node: Tree<TreeItem>["children"][number]) {
		if (!node.children) return mcfunction;
		else if (node.expanded) return level ? folderOpen : namespaceOpen;
		else return level ? folderClosed : namespaceClosed;
	}
</script>

{#each children as node}
	<li style="list-style-type: none">
		<button {...node.attrs}>
			{#each { length: level }}<span class="indent"></span>{/each}
			<span class="icon" style="background-image: url({icon(node)});"></span>
			<span class="label">{node.id.split("/").pop()}</span>
		</button>
		{#if node.children && node.expanded}
			<ol transition:slide={{ duration: 150 }}>
				<NodeList children={node.children} level={level + 1} />
			</ol>
		{/if}
	</li>
{/each}

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

		&:hover,
		&:focus {
			background-color: var(--vscode-list-hoverBackground);
		}

		&[data-selected] {
			background-color: var(--vscode-list-focusBackground);
		}

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
		}
	}
</style>
