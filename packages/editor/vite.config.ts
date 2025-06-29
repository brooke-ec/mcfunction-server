import { nodePolyfills } from "vite-plugin-node-polyfills";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { custom } from "./plugin";

export default defineConfig({
	plugins: [sveltekit(), custom(), nodePolyfills({ include: ["path"] })],
	server: {
		proxy: {
			"/api/": {
				target: "http://localhost:7070",
				changeOrigin: true,
			},
		},
	},
});
