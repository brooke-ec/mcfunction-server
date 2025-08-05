import { browser } from "$app/environment";
import { ofetch } from "ofetch";

export type Info = {
	homepage: { name: string; url: string } | null;
	contributors: string[];
	uuid: string | null;
	namespace: string;
	version: string;
	title: string;
};

export let info: Info;
export const task: Promise<Info> = browser ? ofetch("/info").then((i) => (info = i)) : new Promise(() => {});
