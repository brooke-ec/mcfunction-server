import { browser } from "$app/environment";
import type { Attachment } from "svelte/attachments";

const PICKUP_THRESHOLD = 10;

interface Point {
	x: number;
	y: number;
}

let startpos: Point | null = null;
let current = $state<string | null>(null);
let dragging = $state(false);
let target = $state<string | null>(null);

export const getId = () => (dragging ? current : null);
export const getTarget = () => target;

export const pickup: (id: string) => Attachment<HTMLElement> = (id) => (element) => {
	function move(e: PointerEvent) {
		if (!startpos || current != id) return;

		if (dragging) {
			const found =
				document
					.elementFromPoint(e.clientX, e.clientY)
					?.closest("[data-drop-target]")
					?.getAttribute("data-drop-target") ?? null;
			target = found?.endsWith(id) ? null : found;
		} else {
			const distance = Math.abs(e.clientX - startpos.x) + Math.abs(e.clientY - startpos.y);
			if (distance > PICKUP_THRESHOLD) dragging = true;
		}
	}

	function down(e: PointerEvent) {
		current = id;
		startpos = {
			x: e.clientX,
			y: e.clientY,
		};
	}

	function up(e: PointerEvent) {
		current = null;
		startpos = null;
		dragging = false;
		target = null;
	}

	window.addEventListener("pointermove", move, true);
	element.addEventListener("pointerdown", down, true);
	window.addEventListener("pointerup", up, true);

	return () => {
		window.removeEventListener("pointermove", move);
		element.removeEventListener("pointerdown", down);
		window.removeEventListener("pointerup", up);
	};
};

let position = $state<Point>({ x: 0, y: 0 });
const move = (e: PointerEvent) => (position = { x: e.clientX, y: e.clientY });
if (browser) window.addEventListener("pointermove", move, true);

export const sticky: Attachment<HTMLElement> = (element) => {
	$effect(() => {
		element.style.position = "absolute";
		element.style.left = `${position.x - 5}px`;
		element.style.top = `${position.y - 10}px`;
	});
};
