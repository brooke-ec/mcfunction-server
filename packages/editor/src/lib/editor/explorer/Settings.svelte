<script lang="ts">
	import InfoDialog, * as dialog from "./InfoDialog.svelte";
	import { switchTheme, themes } from "../monaco/theme";
	import { showContextmenu } from "../monaco/menu";
	import { info } from "$lib/session";

	function selectTheme(e: MouseEvent) {
		showContextmenu(
			e,
			themes.map((id) => ({
				label: id.replace(/(^|-)./g, (x) => " " + x[x.length - 1].toUpperCase()),
				run: () => switchTheme(id),
			})),
		);
	}
</script>

<InfoDialog />

<div class="container">
	{#if !info.uuid?.match(/^[0-]*$/)}
		<img src="https://crafatar.com/avatars/{info.uuid}?overlay&size=8" alt="your minecraft head" width="32" />
	{:else}
		<span class="codicon codicon-account" style="font-size: 32px;"></span>
	{/if}
	<a class="codicon codicon-sign-out" href="/logout" aria-label="logout"></a>
	<button class="codicon codicon-symbol-color" aria-label="change theme" onclick={selectTheme}></button>
	<button class="codicon codicon-info" aria-label="information" onclick={dialog.open}></button>
</div>

<style lang="scss">
	.container {
		align-items: center;
		padding: 0 10px;
		display: flex;
		gap: 5px;
	}

	img {
		image-rendering: pixelated;
		border-radius: 5px;
	}

	a,
	button {
		transition: background-color 150ms ease-in-out;
		border-radius: 5px;
		padding: 3px;

		&:hover,
		&:focus {
			background-color: var(--vscode-list-hoverBackground);
		}
	}
</style>
