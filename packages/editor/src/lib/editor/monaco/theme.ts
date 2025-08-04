import * as monaco from "monaco-editor";
import { editor } from ".";

const STORAGE_KEY = "selected-theme";
const DEFAULT_THEME = "catppuccin-macchiato";

const THEMES: Record<string, () => Promise<{ default: monaco.editor.IStandaloneThemeData }>> = {
	"catppuccin-latte": () => import("@catppuccin/vscode/themes/latte.json?theme"),
	"catppuccin-frappe": () => import("@catppuccin/vscode/themes/frappe.json?theme"),
	"catppuccin-macchiato": () => import("@catppuccin/vscode/themes/macchiato.json?theme"),
	"catppuccin-mocha": () => import("@catppuccin/vscode/themes/mocha.json?theme"),
};

export const themes = Object.keys(THEMES);

export async function switchTheme(id: string) {
	await loadTheme(id);
	editor.updateOptions({ theme: id });
	localStorage.setItem(STORAGE_KEY, id);
}

async function loadTheme(id: string) {
	if (!THEMES[id]) throw new Error(`Theme ${id} not found`);

	const theme = await THEMES[id]();
	monaco.editor.defineTheme(id, theme.default);
}

export const selectedTheme = () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;

export const loadSelectedTheme = () => loadTheme(selectedTheme());
