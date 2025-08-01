import { addToast } from "$lib/toast/Toaster.svelte";
import type { TreeItem } from "melt/builders";
import { ofetch } from "ofetch";

//? Filesystem Model paths/locations/ids are reversed from traditional paths.
// For example "namespace/directory/function" is represented as "function/directory/namespace".

export type ModelDirectory = ModelNode & { children: ModelNode[] };
export type ModelRoot = ModelDirectory & { parent: undefined };
export type ModelFunction = ModelNode & { children: undefined; parent: ModelNode };

export class ModelNode implements TreeItem {
	public name = $state<string>("");
	public parent = $state<ModelDirectory>();
	public children = $state<ModelNode[]>();

	private constructor(name: string, parent: ModelDirectory | undefined, children: boolean) {
		this.name = name;
		this.parent = parent;
		this.children = children ? [] : undefined;
	}

	public static create(): ModelRoot {
		return new ModelNode("", undefined, true) as ModelRoot;
	}

	public get id(): string {
		if (!this.parent) return this.name;
		return `${this.name}/${this.parent.id}`;
	}

	public get path(): string {
		if (!this.parent) return this.name;
		return `${this.parent.id}/${this.name}`;
	}

	public get siblings(): ModelNode[] {
		if (!this.parent) return [];
		return this.parent.children.filter((c) => c !== this);
	}

	public isFunction(): this is ModelFunction {
		return this.children === undefined;
	}

	public isDirectory(): this is ModelDirectory {
		return this.children !== undefined;
	}

	public isRoot(): this is ModelRoot {
		return this.parent === undefined && this.isDirectory();
	}

	public resolve(path: string): ModelNode {
		if (path === "") return this;
		if (!this.isDirectory()) throw new Error(`'${this.id}' is not a directory`);

		const { segment, remaining } = popr(path);

		const child = this.children.find((c) => c.name === segment);
		if (!child) throw new Error(`'${this.id}' has no child '${segment}'`);

		if (remaining) return child.resolve(remaining);
		else return child;
	}

	public createFunction(path: string): ModelFunction {
		const { segment, remaining } = popl(path);
		if (remaining) return this.createDirectory(remaining).createFunction(segment);

		if (!this.isDirectory()) throw new Error(`'${this.id}' is not a directory`);

		let child = this.children.find((c) => c.name === segment && c.isFunction()) as ModelFunction | undefined;
		if (!child) this.children.push((child = new ModelNode(segment, this, false) as ModelFunction));
		return child;
	}

	public createDirectory(path: string): ModelDirectory {
		if (!this.isDirectory()) throw new Error(`'${this.id}' is not a directory`);

		const { segment, remaining } = popr(path);
		let child = this.children.find((c) => c.name === segment && c.isDirectory()) as ModelDirectory | undefined;
		if (!child) this.children.push((child = new ModelNode(segment, this, true) as ModelDirectory));

		if (remaining) return child.createDirectory(remaining);
		else return child;
	}

	public async delete() {
		if (!this.parent) throw new Error("Cannot delete root node");
		if (!this.parent.isDirectory()) throw new Error(`'${this.id}' parent is not a directory`);

		const index = this.parent.children.indexOf(this);
		if (index === -1) throw new Error(`'${this.id}' is not a child of '${this.parent.id}'`);

		await ofetch(this.path, {
			baseURL: "/api/file",
			method: "DELETE",
		}).catchToast();

		this.parent.children.splice(index, 1);
	}

	public move(destination: ModelDirectory): void {
		if (!this.parent) throw new Error("Cannot move root node");
		if (destination === this.parent) return; // No move needed

		if (destination.includes(this.name))
			throw new Error(`'${destination.id}' already has a child named '${this.name}'`);

		// Update references to perform the move
		this.parent.children.splice(this.parent.children.indexOf(this), 1);
		destination.children.push(this);
		this.parent = destination;
	}

	public copy(destination: ModelDirectory): ModelNode {
		if (destination.includes(this.name))
			throw new Error(`'${destination.id}' already has a child named '${this.name}'`);

		const result = new ModelNode(this.name, destination, this.isDirectory()) as ModelDirectory;
		for (const child of this.children ?? []) child.copy(result);
		destination.children.push(result);
		return result;
	}

	public includes(node: string | ModelNode) {
		if (!this.isDirectory()) throw new Error(`'${this.id}' is not a directory`);
		if (typeof node === "string") return this.children.some((c) => c.name === node);
		else return this.children.includes(node);
	}

	public async refresh() {
		if (!this.isDirectory()) throw new Error(`'${this.id}' is not a directory`);

		const response = await ofetch<string[]>("/api/index").catchToast();

		this.children = [];
		for (const path of response) this.createFunction(path.split("/").reverse().join("/") + "/");
	}
}

function pop(path: string, pattern: RegExp) {
	let segment: string | undefined = undefined;
	const remaining = path.replace(pattern, (_, s) => {
		segment = s;
		return "";
	});

	if (segment === undefined) return { segment: path, remaining: null };
	else return { segment, remaining };
}

export const popr = (path: string) => pop(path, /([^\/]*)\/$/);
export const popl = (path: string) => pop(path, /^([^\/]*)\//);
