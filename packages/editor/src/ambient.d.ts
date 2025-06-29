declare module "*.json?theme" {
	const src: import("monaco-editor").editor.IStandaloneThemeData;
	export default src;
}
