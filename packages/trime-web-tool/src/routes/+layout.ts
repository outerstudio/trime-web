import type { LayoutLoad } from "./$types";

export const ssr: boolean = false;
export const prerender: boolean = true;
export const trailingSlash: string = "always";

var credits: [string, string][] = [
    ["Svelte Kit", "https://kit.svelte.dev"],
    ["Skeleton", "https://www.skeleton.dev"],
    ["Tailwind CSS", "https://tailwindcss.com"],
    ["Trime 同文輸入法", "https://github.com/osfans/trime"],
];

export const load: LayoutLoad = (_) => {
    return {
        credits: credits,
    };
};
