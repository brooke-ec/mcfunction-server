<script lang="ts" module>
	let editor: import("monaco-editor").editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof import("monaco-editor") | null = null;
</script>

<script lang="ts">
	import placeholder from "./language/placeholder.txt?raw";
	import type { Attachment } from "svelte/attachments";

	const attach: Attachment<HTMLElement> = (element) => {
		import("./client").then(async (client) => {
			monaco = client.monaco;
			editor = monaco.editor.create(element, {
				theme: "catppuccin-macchiato",
				language: "mcfunction",
				automaticLayout: true,
				value: placeholder,
			});
		});

		return () => {
			editor?.dispose();
			editor = null;
		};
	};
</script>

<div {@attach attach}></div>

<style lang="scss">
	div {
		height: 100%;
		width: 100%;
	}
</style>
