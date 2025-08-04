<script lang="ts">
	import "monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css";
	import mcfunction from "mc-dp-icons/fileicons/imgs/mcf_load.svg";
	import { setLoading } from "./Loading.svelte";
	import { info } from "$lib/session";
	import { onMount } from "svelte";

	onMount(() => setLoading(false));

	function onclick(e: MouseEvent) {
		if (e.target instanceof HTMLButtonElement) {
			const target = e.target;

			window.getSelection()?.selectAllChildren(target);
			navigator.clipboard.writeText(target.textContent);
			target.classList.add("clicked");
			setTimeout(() => target.classList.remove("clicked"), 2000);
		}
	}
</script>

<svelte:head>
	<title>{info.title}</title>
</svelte:head>

<main>
	<div class="container">
		<img src={mcfunction} alt="mcfunction logo" />
		<div class="details">
			<div>
				<h1>{info.title}</h1>
				<p class="error">you are not authenticated</p>
			</div>
			<p>Log in using the <button class="code" {onclick}>/editor</button> command in-game.</p>
			{#if info.homepage}
				<div class="link">
					<span class="codicon codicon-home"></span>
					<a href={info.homepage.url} target="_blank">{info.homepage.name}</a>
				</div>
			{/if}
		</div>
	</div>
</main>

<style lang="scss">
	main {
		padding-left: 10vw;
		height: 100vh;
		width: 100vw;

		display: flex;
		align-items: center;
	}

	.container {
		align-items: start;
		display: flex;
		gap: 20px;
	}

	img {
		min-width: 125px;
		margin-top: 8px;
		width: 10vw;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.error {
		font-variant: small-caps;
		color: #ed8796;
	}

	.code {
		background-color: #181926;
		border-radius: 5px;
		padding: 2px 5px;

		&::before,
		&::after {
			transition: opacity 250ms ease-in-out;
			background-color: #181926;
			position: absolute;
			opacity: 0;
		}

		&::before {
			margin-top: -15px;
			margin-left: 19px;
			transform: rotate(45deg);
			content: "";
			height: 10px;
			width: 10px;
		}

		&::after {
			margin-left: -54.5px;
			border-radius: 5px;
			content: "Copied!";
			margin-top: -35px;
			padding: 3px;
		}

		&:global(.clicked)::before,
		&:global(.clicked)::after {
			opacity: 1;
		}
	}

	.link {
		gap: 10px;
		display: flex;
		margin: 5px 0;
		align-items: center;

		.codicon-home::before {
			content: "\eb06";
		}
	}
</style>
