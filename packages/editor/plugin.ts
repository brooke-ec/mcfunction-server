import { convertTheme } from "monaco-vscode-textmate-theme-converter";
import type { Plugin, TransformResult } from "vite";

const themeRE = /\.json\?theme$/;

export function custom(): Plugin {
	return {
		name: "custom",
		enforce: "pre",
		transform(src: string, id: string): TransformResult | undefined {
			if (themeRE.test(id)) {
				return {
					code: JSON.stringify(convertTheme(JSON.parse(src))),
					map: null,
				};
			}
		},
		// Force do full reload as monaco doesn't play nicely with HMR (or maybe it's just me)
		handleHotUpdate({ server }) {
			server.ws.send({ type: "full-reload" });
			return [];
		},
	};
}
