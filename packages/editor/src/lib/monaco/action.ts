export type ActionDefinition = import("monaco-editor").editor.IActionDescriptor & { alias?: string };
export type DefinitionFactory = (monaco: typeof import("monaco-editor")) => ActionDefinition;
import { editor, monaco } from "$lib/Editor.svelte";

export class ActionDescriptor {
	private readonly _define: DefinitionFactory;
	private _definition: ActionDefinition | null = null;

	constructor(define: DefinitionFactory) {
		this._define = define;
	}

	public get id() {
		return this.definition.id;
	}

	public get definition() {
		if (!this._definition) throw new Error("Action has not been defined yet");
		return this._definition;
	}

	public define() {
		if (monaco === null || editor === null) throw new Error("Editor is not initialized");

		const raw = this._define(monaco);
		editor.addAction(raw);
		const result = editor.getAction(raw.id)!;

		this._definition = { ...raw, id: result.id };
		return result;
	}
}
