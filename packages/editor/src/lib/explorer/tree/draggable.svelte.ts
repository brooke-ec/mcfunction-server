import { browser } from "$app/environment";
import type { Attachment } from "svelte/attachments";
import { select } from "./Tree.svelte";

const PICKUP_THRESHOLD = 10;

interface Point {
	x: number;
	y: number;
}

let state = $state<{ downpos: Point; source: string; dragging: boolean; target: string | null } | null>(null);
let position = $state<Point>({ x: 0, y: 0 });

export const getSource = () => (state?.dragging ? state.source : null);
export const getTarget = () => state?.target ?? null;

export const pickup: (id: string, disabled?: boolean) => Attachment<HTMLElement> = (id, disabled) => (element) => {
	function down(e: PointerEvent) {
		if (!disabled && e.button == 0)
			state = {
				downpos: { x: e.clientX, y: e.clientY },
				dragging: false,
				target: null,
				source: id,
			};
	}

	element.addEventListener("pointerdown", down, true);
	return () => element.removeEventListener("pointerdown", down);
};

function move(e: PointerEvent) {
	position = { x: e.clientX, y: e.clientY };

	if (!state) return;
	else if (state.dragging) {
		const found =
			document
				.elementFromPoint(e.clientX, e.clientY)
				?.closest("[data-drop-target]")
				?.getAttribute("data-drop-target") ?? null;
		state.target = found?.endsWith(state.source) ? null : found;
	} else {
		const distance = Math.abs(e.clientX - state.downpos.x) + Math.abs(e.clientY - state.downpos.y);
		if (distance > PICKUP_THRESHOLD) {
			state.dragging = true;
			select(state.source);
		}
	}
}

export const sticky: Attachment<HTMLElement> = (element) => {
	$effect(() => {
		element.style.position = "absolute";
		element.style.left = `${position.x - 5}px`;
		element.style.top = `${position.y - 10}px`;
	});
};

const up = (e: PointerEvent) => (state = null);

if (browser) {
	window.addEventListener("pointermove", move, true);
	window.addEventListener("pointerup", up, true);
}
