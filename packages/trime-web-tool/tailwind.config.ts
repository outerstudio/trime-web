import { join } from "path";
import type { Config } from "tailwindcss";

// 1. Import the Skeleton plugin
import { getThemeProperties, skeleton } from "@skeletonlabs/tw-plugin";

const crimsonProps = { ...getThemeProperties("crimson") };
for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const) {
    crimsonProps[`--color-primary-${step}`] = crimsonProps[`--color-success-${step}`];
}
crimsonProps["--on-primary"] = crimsonProps["--on-success"];

const config = {
    // 2. Opt for dark mode to be handled via the class method
    darkMode: "selector",

    content: [
        "./src/**/*.{html,js,svelte,ts}",
        // 3. Append the path to the Skeleton package
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}"),
    ],

    theme: {
        extend: {},
    },

    plugins: [
        skeleton({
            themes: {
                // Custom "crimson" replaces the red preset so links / .code / primary UI use green.
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
