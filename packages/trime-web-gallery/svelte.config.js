import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const basePath = process.env.BASE_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            pages: "build",
            assets: "build",
            fallback: undefined,
            precompress: false,
            strict: true,
        }),
        paths: {
            // Honor BASE_PATH in build and in path-prefix local gateway (`npm run dev`)
            base: !basePath || basePath === "/" ? "" : basePath.replace(/\/$/, ""),
        },
        prerender: {
            entries: ["*"],
        },
    },
};

export default config;
