import { DEFAULT_MODEL, editor, SCOPE_MCFUNCTION } from "../monaco";
import * as monaco from "monaco-editor";
import { ofetch, type FetchContext } from "ofetch";
import { addToast } from "../toaster/Toaster.svelte";

let active = $state<ModelTab | null>(null);
let tabs = $state<ModelTab[]>([]);

export const getTabs = () => tabs;
export const getActive = () => active;

export class ModelTab {
	public readonly model: monaco.editor.ITextModel;
	public loading = $state<boolean>(false);
	public path = $state<string>("");

	private currentId = $state<number>(0);
	private savedId = $state<number>(0);

	private constructor(path: string) {
		this.model = monaco.editor.createModel("# Loading...\n", SCOPE_MCFUNCTION);
		this.path = path;

		this.model.onDidChangeContent(() => (this.currentId = this.model.getAlternativeVersionId()));
	}

	public static add(path: string): ModelTab {
		let result = tabs.find((t) => t.path == path);

		if (!result) {
			result = new ModelTab(path);
			tabs.push(result);
			result.refresh();
		}

		return result;
	}

	public get name(): string {
		return this.path.split("/").pop() || "Untitled";
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
		if (!this.active) {
			editor.setModel(this.model);
			active = this;
		}

		editor.focus();
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
		if (this.loading || this.dirty) return;
		const first = this.currentId === 0;

		this.loading = true;
		const { content, error } = await ofetch<{ content: string; error: string | null }>(this.path, {
			baseURL: "/api/file",
		}).catchToast();
		this.loading = false;

		if (content === this.model.getValue()) return;

		if (first) this.model.setValue(content);
		else this.model.pushEditOperations([], [{ range: this.model.getFullModelRange(), text: content }], () => null);
		this.savedId = this.currentId;
		this.setError(error);
	}

	public async save() {
		if (!this.dirty) return;

		const id = this.currentId;

		const { error } = await ofetch<{ error: string | null }>(this.path, {
			body: this.model.getValue(),
			baseURL: "/api/file",
			method: "PUT",
		});

		this.setError(error);
		this.savedId = id;
	}

	private setError(error: string | null) {
		if (error === null) monaco.editor.setModelMarkers(this.model, "error", []);
		else {
			const match = /line (\d)/g.exec(error);
			const lineno = match ? parseInt(match[1]) : null;
			const range = lineno
				? {
						startLineNumber: lineno,
						endLineNumber: lineno,
						startColumn: 0,
						endColumn: this.model.getLineLength(lineno) + 1,
					}
				: this.model.getFullModelRange();

			monaco.editor.setModelMarkers(this.model, "error", [
				{
					...range,
					message: error,
					severity: monaco.MarkerSeverity.Error,
				},
			]);
		}
	}
}
