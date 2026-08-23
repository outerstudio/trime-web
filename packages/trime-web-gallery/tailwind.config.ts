import { join } from "path";
import type { Config } from "tailwindcss";
import { getThemeProperties, skeleton } from "@skeletonlabs/tw-plugin";

const crimsonProps = { ...getThemeProperties("crimson") };
for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const) {
    crimsonProps[`--color-primary-${step}`] = crimsonProps[`--color-success-${step}`];
}
crimsonProps["--on-primary"] = crimsonProps["--on-success"];

const config = {
    darkMode: "selector",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}"),
    ],
    theme: {
        extend: {},
    },
    plugins: [
        skeleton({
            themes: {
                custom: [{ name: "crimson", properties: crimsonProps }],
                preset: [
                    "skeleton",
                    "wintry",
                    "modern",
                    "rocket",
                    "seafoam",
                    "vintage",
                    "sahara",
                    "hamlindigo",
                    "gold-nouveau",
                ],
            },
        }),
    ],
} satisfies Config;

export default config;
