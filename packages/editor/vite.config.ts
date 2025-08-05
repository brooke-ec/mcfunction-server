import { createViteLicensePlugin as licensePlugin } from "rollup-license-plugin";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { custom } from "./plugin";

export default defineConfig({
	plugins: [
		nodePolyfills({ include: ["path"] }),
		sveltekit(),
		custom(),
		licensePlugin({
			licenseOverrides: { "mc-dp-icons@4.0.2": "AGPL-3.0-or-later", "runed@0.23.4": "MIT" },
			includePackages: () => ["node_modules/greset", "node_modules/syntax-mcfunction", "licenses/javalin"],
		}),
	],
	server: {
		proxy: {
			"^/(api)|(login)|(logout)|(info)/?.*": {
				target: "http://localhost:7070",
				changeOrigin: true,
			},
		},
	},
});
