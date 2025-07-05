<script lang="ts">
	import Node from "./Node.svelte";
	import { Tree } from "melt/builders";
	import items from "./test.json";

	const { root: attrs, children } = new Tree({ items });
</script>

<div {...attrs}>
	<Node node={children[0]} />
</div>
