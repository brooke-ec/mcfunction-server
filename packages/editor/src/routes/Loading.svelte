<script lang="ts" module>
	let loading = $state(true);

	export function setLoading(value: boolean) {
		loading = value;
	}

	export const isLoading = () => loading;
</script>

<script lang="ts">
	import { fade } from "svelte/transition";
</script>

<svelte:head>
	{#if loading}
		<title>loading...</title>
	{/if}
</svelte:head>

{#if loading}
	<div class="container" transition:fade={{ delay: 500 }}>
		<span class="loader"></span>
	</div>
{/if}

<style lang="scss">
	.container {
		background-color: #1e202f;
		display: flex;
		flex-direction: column;
		position: fixed;
		justify-content: center;
		align-items: center;
		top: 0;
		left: 0;
		z-index: 1000;
		height: 100vh;
		width: 100vw;
	}

	.loader {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		position: relative;
		animation: rotate 1s linear infinite;
	}

	.loader::before,
	.loader::after {
		content: "";
		box-sizing: border-box;
		position: absolute;
		inset: 0px;
		border-radius: 50%;
		border: 5px solid #fff;
		animation: prixClipFix 2s linear forwards;
	}

	.loader::after {
		inset: 8px;
		transform: rotate3d(90, 90, 0, 180deg);
		border-color: #c6a0f6;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes prixClipFix {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		75%,
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
	}
</style>
