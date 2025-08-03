<script lang="ts">
	import { createFunction } from "../explorer/tree/Tree.svelte";
	import { getActive } from "./model.svelte";

	let tab = $derived(getActive());
</script>

{#if tab?.loading !== false}
	<div class="cover">
		{#if tab === null}
			<img src="/favicon.ico" alt="mcfunction server logo" />
			<h1>mcfunction-server</h1>
			<div class="suggestions">
				<ul>
					<li>
						<span class="codicon codicon-new-file"></span>
						<button class="a" onclick={createFunction}> New Function </button>
					</li>
				</ul>
				<ul>
					<li>
						<span class="codicon codicon-github-inverted"></span>
						<a href="https://github.com/brooke-ec/mcfunction-server" target="_blank"> View on GitHub </a>
					</li>
					<li>
						<span class="codicon codicon-bug"></span>
						<a href="https://github.com/brooke-ec/mcfunction-server/issues" target="_blank">
							Bug Tracker
						</a>
					</li>
				</ul>
			</div>
		{:else if tab.loading}
			<span class="loader"></span>
			<span class="caption">Loading...</span>
		{/if}
	</div>
{/if}

<style lang="scss">
	.cover {
		position: absolute;
		bottom: 0px;
		right: 0px;

		height: calc(100vh - 35px);
		width: 80vw;

		background-color: var(--vscode-editor-background);
		z-index: 6;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	.suggestions {
		display: flex;
		gap: 10vw;

		ul {
			list-style: none;

			li {
				gap: 10px;
				display: flex;
				margin: 5px 0;
				align-items: center;
			}
		}
	}

	.caption {
		text-transform: lowercase;
		color: var(--vscode-disabledForeground);
	}

	.loader {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		position: relative;
		animation: rotate 1s linear infinite;
	}

	.loader::before {
		content: "";
		box-sizing: border-box;
		position: absolute;
		inset: 0px;
		border-radius: 50%;
		border: 5px solid #fff;
		animation: prixClipFix 2s linear forwards;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes prixClipFix {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 50%);
		}
	}
</style>
