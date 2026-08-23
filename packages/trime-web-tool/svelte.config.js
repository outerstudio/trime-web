import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const basePath = process.env.BASE_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            // Per-package build output; root scripts/build-pages.mjs assembles into dist-pages/
            pages: "build",
            assets: "build",
        }),
        paths: {
            // Honor BASE_PATH in build and in path-prefix local gateway (`npm run dev`)
            base: !basePath || basePath === "/" ? "" : basePath.replace(/\/$/, ""),
        },
    },
};

export default config;
