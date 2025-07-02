declare module "*.json?theme" {
	const src: import("monaco-editor").editor.IStandaloneThemeData;
	export default src;
}

declare module "monaco-editor/esm/vs/base/common/actions" {
	export class Separator {
		constructor();
	}
}
