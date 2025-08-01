export type ActionDefinition = import("monaco-editor").editor.IActionDescriptor & { alias?: string };
export type DefinitionFactory = (monaco: typeof import("monaco-editor")) => ActionDefinition;
import { editor } from ".";

export class ActionDescriptor {
	private _definition: ActionDefinition;

	constructor(definition: ActionDefinition) {
		this._definition = definition;
	}

	public get id() {
		return this.definition.id;
	}

	public get definition() {
		if (!this._definition) throw new Error("Action has not been defined yet");
		return this._definition;
	}

	public register() {
		editor.addAction(this._definition);
		const result = editor.getAction(this._definition.id)!;

		this._definition = { ...this._definition, id: result.id };
		return result;
	}
}
