<script lang="ts" module>
	const toaster = new Toaster<string>({ closeDelay: 10000 });
	export const addToast = toaster.addToast;

	export function error(e: unknown) {
		addToast({ data: e instanceof Error ? e.message : "An unknown error occurred" });
		console.error(e);
	}

	Promise.prototype.catchToast = function () {
		return this.catch((e) => {
			error(e);
			throw e;
		});
	};
</script>

<script lang="ts">
	import { Toaster } from "melt/builders";
	import Toast from "./Toast.svelte";
</script>

<div {...toaster.root} class="container">
	{#each toaster.toasts as toast (toast.id)}
		<Toast {toast} />
	{/each}
</div>

<style lang="scss">
	.container {
		background-color: transparent;
		color: inherit;
		border: none;

		overflow: hidden;

		position: fixed;
		inset: unset;
		bottom: 0px;
		right: 0px;
	}
</style>
