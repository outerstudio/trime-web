import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

/** When set (by scripts/dev-pages.mjs), HMR connects through the path-prefix gateway. */
const proxyPort = process.env.DEV_PROXY_PORT;

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        noExternal: ["trime-web-core"],
    },
    server: proxyPort
        ? {
              origin: `http://127.0.0.1:${proxyPort}`,
              hmr: {
                  protocol: "ws",
                  host: "127.0.0.1",
                  clientPort: Number(proxyPort),
              },
          }
        : undefined,
});
