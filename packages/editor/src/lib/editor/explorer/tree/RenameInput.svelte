<script lang="ts">
	import { submitRename } from "./Tree.svelte";

	const PATTERN = /^[_a-z-0-9.]+$/;

	const { label, blacklist } = $props<{ label: string; blacklist: string[] }>();

	let reference = $state<HTMLInputElement>();
	$effect(() => reference?.select());

	let value = $state(label);
	let blacklisted = $derived(blacklist.includes(value));
	let valid = $derived(PATTERN.test(value));
	let allowed = $derived(!blacklisted && valid);

	function submit() {
		if (!allowed) value = label;
		submitRename(value);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === "Enter" && allowed) submit();
		else if (event.key === "Escape") {
			value = label;
			submit();
		}
	}
</script>

<div class="container">
	<input
		bind:this={reference}
		autocapitalize="off"
		spellcheck="false"
		autocomplete="off"
		autocorrect="off"
		onblur={submit}
		{onkeydown}
		type="text"
		bind:value
	/>
	{#if !allowed}
		<div class="errors">
			{#if !valid}
				<div class="error">
					{#if value.length === 0}
						Name cannot be empty.
					{:else if !PATTERN.test(value)}
						Name contains invalid characters.
					{/if}
				</div>
			{/if}

			{#if blacklisted}
				<div class="error">An item <b>{value}</b> already exists at this location.</div>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
		padding: 0 0 0 5px;
		flex-grow: 1;
	}

	input[type="text"] {
		border: 1px solid var(--vscode-selection-background);
		background-color: transparent;
		font-size: 14px;
		color: inherit;
		outline: none;
		width: 100%;
	}

	.errors {
		flex-direction: column;
		padding: 4px 0 0 4px;
		position: absolute;
		inset-inline: 1px;
		display: flex;
		z-index: 10;
		gap: 5px;
	}

	.error {
		background-color: var(--vscode-inputValidation-errorBackground);
		border: 1px solid var(--vscode-inputValidation-errorBorder);
		color: var(--vscode-inputValidation-errorForeground);
		padding: 0 5px 0 5px;
	}
</style>
