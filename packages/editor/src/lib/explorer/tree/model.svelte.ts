import type { TreeItem } from "melt/builders";

type TreeDirectory = TreeItem & { children: TreeItem[] };

let state = $state<TreeDirectory[]>([{ id: "/", children: [] }]);
export const structure = () => state;

export async function refresh() {
	state[0].children = (await import("./test.json")).default;
}

export function findDirectory(location: string): TreeDirectory {
	if (location === "/") return state[0];

	const path = location.split("/").reverse();
	let current: TreeItem = state[0];
	let parent = current;

	for (const segment of path) {
		if (!current.children) throw new Error(`Directory at '${location}' not found`);
		const found = current.children
			.filter((child) => child.id.split("/")[0] == segment)
			.sort((a, b) => Number(a.children) - Number(b.children))[0];
		if (!found) throw new Error(`'${location}' not found`);
		parent = current;
		current = found;
	}

	// @ts-ignore
	return current.children ? current : parent;
}

export function newFile(name: string, path: string) {
	const parent = findDirectory(path);
	const id = `${name}/${parent.id}`;
	parent.children.push({ id });
	return id;
}

refresh();
