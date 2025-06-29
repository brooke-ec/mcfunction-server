import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { custom } from "./plugin";

export default defineConfig({
	plugins: [sveltekit(), custom()],
	server: {
		proxy: {
			"/api/": {
				target: "http://localhost:7070",
				changeOrigin: true,
			},
		},
	},
});
