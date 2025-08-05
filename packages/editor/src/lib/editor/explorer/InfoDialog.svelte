<script lang="ts" module>
	import { ofetch } from "ofetch";
	let isOpen = $state(false);

	type Library = {
		name: string;
		version: string;
		repository: string;
		license: string;
		licenseText: string;
	};

	export const close = () => (isOpen = false);
	export function open() {
		if (!promise)
			promise = ofetch<Library[]>("/oss-licenses.json").then((list) =>
				list.toSorted((a, b) => a.name.localeCompare(b.name)),
			);
		isOpen = true;
	}

	let promise = $state<Promise<Library[]>>();
</script>

<script lang="ts">
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg";
	import { fade, fly, slide } from "svelte/transition";
	import { Accordion } from "melt/builders";
	import { info } from "$lib/session";

	const accordion = new Accordion();

	let headerHeight = $state(0);
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="background" transition:fade={{ duration: 125 }} onclick={close}></div>
	<div class="container">
		<div class="dialog" transition:fly={{ duration: 150, y: 50 }}>
			<div class="close">
				<button class="codicon codicon-close" aria-label="close dialog" onclick={close}></button>
			</div>
			<div class="header">
				<img src={mcfunction} alt="mcfunction server icon" height={headerHeight} />
				<div bind:clientHeight={headerHeight}>
					<h3>mcfunction-server</h3>
					<p class="small">version {info.version}</p>
				</div>
			</div>
			<div class="scrollable">
				<div>Made possible thanks to open source libraries:</div>
				{#await promise!}
					<div class="center"><div class="basic-spinner"></div></div>
				{:then licenses}
					{#each licenses as license}
						{@const fold = accordion.getItem({ id: license.name })}
						<div class="library">
							<div {...fold.heading} class="library">
								<button {...fold.trigger}>
									<span class="codicon codicon-heart-filled"></span>
									{license.name}
									<span class="small"> - {license.version}</span>
									<span
										class="codicon codicon-chevron-{fold.isExpanded ? 'up' : 'down'}"
										style="margin-left: auto"
									></span>
								</button>
							</div>
							{#if fold.isExpanded}
								<div {...fold.content} transition:slide={{ duration: 150 }}>
									<p class="license-text">
										{license.licenseText}
									</p>
								</div>
							{/if}
						</div>
					{/each}
				{/await}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.scrollable {
		flex-direction: column;
		overflow-y: auto;
		display: flex;
		width: 100%;
		gap: 10px;
	}

	.library {
		background-color: var(--vscode-textBlockQuote-border);
		border-radius: 10px;
		margin-right: 10px;

		button {
			display: flex;
			align-items: center;
			gap: 5px;

			text-align: left;
			padding: 5px;
			width: 100%;

			.codicon {
				margin-top: 3px;
			}
		}

		.license-text {
			white-space: pre-wrap;
			font-size: 12px;
			padding: 5px;
		}
	}

	.background,
	.container {
		position: fixed;
		z-index: 1000;
		height: 100vh;
		width: 100vw;
		left: 0;
		top: 0;
	}

	.small {
		color: var(--vscode-disabledForeground);
	}

	.background {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(8px);
	}

	.container {
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.dialog {
		background-color: var(--vscode-editor-background);
		pointer-events: all;
		border-radius: 10px;
		padding: 20px;
		padding-top: 10px;

		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 10px;

		max-height: 90vh;
		max-width: 70vw;
		width: 70vw;
	}

	.header {
		margin-right: 10vw;
		display: flex;
		gap: 10px;

		div {
			height: min-content;
			white-space: nowrap;
		}
	}

	.center {
		justify-content: center;
		align-items: center;
		display: flex;
		width: 100%;
	}

	.close {
		position: relative;
		margin-left: auto;

		button {
			margin-left: -10px;
			position: absolute;
			font-size: 20px;
		}
	}
</style>
