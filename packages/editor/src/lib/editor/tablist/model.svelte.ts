import { DEFAULT_MODEL, editor, SCOPE_MCFUNCTION } from "../monaco";
import * as monaco from "monaco-editor";

let active = $state<ModelTab | null>(null);
let tabs = $state<ModelTab[]>([]);

export const getTabs = () => tabs;
export const getActive = () => active;

export class ModelTab {
	public readonly model: monaco.editor.ITextModel;
	private currentId = $state<number>(0);
	private savedId = $state<number>(0);

	private constructor(model: monaco.editor.ITextModel) {
		this.model = model;

		this.model.onDidChangeContent(() => (this.currentId = this.model.getAlternativeVersionId()));
		this.currentId = model.getAlternativeVersionId();
		this.savedId = this.currentId;
	}

	public static add(url: string): ModelTab {
		let result = tabs.find((t) => t.uri.path == url);

		if (!result) {
			const model = monaco.editor.createModel("# Loading...\n", SCOPE_MCFUNCTION, monaco.Uri.file(url));
			result = new ModelTab(model);
			tabs.push(result);
		}

		return result;
	}

	public get name(): string {
		return this.model.uri.path.split("/").pop() || "Untitled";
	}

	public get uri(): monaco.Uri {
		return this.model.uri;
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
}
