<script lang="ts">
	import { Progress, type Toaster } from "melt/builders";
	import { fly } from "svelte/transition";

	let { toast }: { toast: Toaster<string>["toasts"][number] } = $props();

	const progress = new Progress({ value: () => toast.percentage });
</script>

<div {...toast.content} class="toast" transition:fly={{ duration: 250, x: "100%" }}>
	<div {...progress.root}>
		<div {...progress.progress}></div>
	</div>

	<div class="container">
		<div class="icon codicon codicon-error"></div>
		<p {...toast.description}>{toast.data}</p>
		<button {...toast.close} aria-label="dismiss alert" class="codicon codicon-close"></button>
	</div>
</div>

<style lang="scss">
	.toast {
		background-color: var(--vscode-editorWidget-background);
		border-radius: 0 0 5px 5px;
		margin: 0 20px 10px 0;
		min-width: 35vw;
	}

	[data-melt-progress-root] {
		background-color: var(--vscode-textBlockQuote-border);
		overflow: hidden;
		height: 3px;
		width: 100%;
	}

	[data-melt-progress-progress] {
		transform: translateX(calc(100% - var(--progress)));
		background-color: var(--vscode-errorForeground);
		height: 100%;
	}

	.container {
		padding: 3px;
		padding-top: 6px;
		display: flex;
		gap: 5px;
	}

	.icon {
		color: var(--vscode-errorForeground);
		font-size: 20px !important;
	}

	p {
		padding-bottom: 5px;
	}

	button {
		margin-left: auto;
	}
</style>
