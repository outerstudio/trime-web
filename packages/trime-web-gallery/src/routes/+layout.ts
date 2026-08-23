import type { LayoutLoad } from "./$types";

export const ssr = false;
export const prerender = true;
export const trailingSlash = "always";

var credits: [string, string][] = [
    ["Svelte Kit", "https://kit.svelte.dev"],
    ["Skeleton", "https://www.skeleton.dev"],
    ["Tailwind CSS", "https://tailwindcss.com"],
    ["Trime 同文輸入法", "https://github.com/osfans/trime"],
];

export const load: LayoutLoad = () => {
    return {
        title: "Trime 主題列表",
        credits,
    };
};
