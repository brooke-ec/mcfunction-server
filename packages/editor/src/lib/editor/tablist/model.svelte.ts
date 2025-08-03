import { DEFAULT_MODEL, editor, SCOPE_MCFUNCTION } from "../monaco";
import * as monaco from "monaco-editor";
import { ofetch } from "ofetch";

let active = $state<ModelTab | null>(null);
let tabs = $state<ModelTab[]>([]);

export const getTabs = () => tabs;
export const getActive = () => active;

export class ModelTab {
	public readonly model: monaco.editor.ITextModel;
	public loading = $state<boolean>(false);

	private currentId = $state<number>(0);
	private savedId = $state<number>(0);

	private constructor(model: monaco.editor.ITextModel) {
		this.model = model;

		this.model.onDidChangeContent(() => (this.currentId = this.model.getAlternativeVersionId()));
	}

	public static add(path: string): ModelTab {
		let result = tabs.find((t) => t.path == path);

		if (!result) {
			const model = monaco.editor.createModel("# Loading...\n", SCOPE_MCFUNCTION, monaco.Uri.file(path));
			result = new ModelTab(model);
			tabs.push(result);
			result.refresh();
		}

		return result;
	}

	public get name(): string {
		return this.model.uri.path.split("/").pop() || "Untitled";
	}

	public get path() {
		return this.model.uri.path;
	}

	public get active(): boolean {
		return this === active;
	}

	public get dirty(): boolean {
		return this.currentId !== this.savedId;
	}

	public get siblings(): ModelTab[] {
		const index = tabs.indexOf(this);
		return [...tabs.slice(index + 1), ...tabs.slice(0, index)];
	}

	public switch(): void {
		if (this.active) return;

		editor.setModel(this.model);
		active = this;
	}

	public close(): void {
		if (this.dirty && !confirm("You have unsaved changes. Are you sure you want to close this tab?")) return;

		if (this.active) {
			active = this.siblings.pop() ?? null;
			editor.setModel(active?.model ?? DEFAULT_MODEL);
		}

		const index = tabs.indexOf(this);
		tabs.splice(index, 1);
		this.model.dispose();
	}

	public async refresh() {
		if (this.loading) return;
		const first = this.currentId === 0;

		this.loading = true;
		const content = await ofetch(this.path, { baseURL: "/api/file" }).catchToast();
		this.loading = false;

		if (content === this.model.getValue()) return;

		if (first) this.model.setValue(content);
		else this.model.pushEditOperations([], [{ range: this.model.getFullModelRange(), text: content }], () => null);
		this.savedId = this.currentId;
	}
}
