<script lang="ts">
	import NodeList from "./NodeList.svelte";
	import { Tree } from "melt/builders";
	import items from "./test.json";

	const { root: attrs, children } = new Tree({ items });
</script>

<div {...attrs}>
	<p class="title">FUNCTIONS</p>
	<NodeList {children} />
</div>

<style lang="scss">
	.title {
		padding-left: 10px;
		font-weight: bold;
		font-size: 14px;
	}
</style>
