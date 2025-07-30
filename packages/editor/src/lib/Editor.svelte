<script lang="ts" module>
	export let editor: import("monaco-editor").editor.IStandaloneCodeEditor | null = null;
	export let monaco: typeof import("monaco-editor") | null = null;
</script>

<script lang="ts">
	import placeholder from "./monaco/language/placeholder.txt?raw";
	import Explorer from "./explorer/Explorer.svelte";
	import type { Attachment } from "svelte/attachments";
	import * as actions from "./actions";
	import TabList from "./TabList/TabList.svelte";

	const attach: Attachment<HTMLElement> = (element) => {
		const observer = new ResizeObserver(() => {
			editor?.layout({
				width: element.clientWidth * 0.8,
				height: element.clientHeight - 35,
			});
		});

		import("./monaco/client").then(async (client) => {
			monaco = client.monaco;
			editor = monaco.editor.create(element, {
				theme: "catppuccin-macchiato",
				language: "mcfunction",
				value: placeholder,
			});

			observer.observe(element);
			for (const action of Object.values(actions)) action.define();

			// editor.createContextKey("editorFocused", false);
			editor.focus();
		});

		return () => {
			observer.unobserve(element);
			editor?.dispose();
			editor = null;
		};
	};
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main {@attach attach} tabindex="0">
	<Explorer />
	<TabList />
</main>

<style lang="scss">
	main {
		height: 100vh;
		outline: none;
		width: 100%;

		display: grid;
		grid-template-columns: repeat(2, auto);
		grid-template-rows: repeat(2, auto);
		grid-template-areas:
			"explorer tablist"
			"explorer editor";
	}
</style>
