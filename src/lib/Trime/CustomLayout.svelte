<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { browser } from "$app/environment";
    import KeyboardLoad from "./KeyboardLoad.svelte";
    import { Theme } from "./model/theme";
    import { parseThemeYaml, themeFromObject, themeToYaml } from "./utils/theme";
    import { toastError } from "$lib/utils/error";
    import { bumpPreview } from "./utils/revision";

    const toastStore = getToastStore();
    const nameEmpty = "空的";

    export var theme: Theme;
    export var customThemes: object[];
    const dispatch = createEventDispatcher();

    if (!customThemes || customThemes.length === 0) {
        customThemes = new Array(10).fill(0).map((_, index) => {
            var raw = browser && localStorage.getItem(`customTrimeTheme${index}`);
            if (raw) {
                try {
                    var { obj } = parseThemeYaml(raw);
                    if (obj && typeof obj === "object") return obj;
                } catch (err) {
                    toastError(toastStore, `parse custom theme failed: ${(err as Error).message}`);
                }
            }
            return { name: nameEmpty };
        });
    }

    function slotKey(index: number): string {
        return `customTrimeTheme${index}`;
    }
    function slotLabel(item: any): string {
        if (item && typeof item.name === "string" && item.name.trim()) return item.name;
        return nameEmpty;
    }
    function isEmptySlot(item: any): boolean {
        return !item || (!item.preset_keyboards && !item.preset_color_schemes && !item.style);
    }
    function loadCustom(index: number): void {
        // Prefer the slot on disk so we never load a stale in-memory copy.
        try {
            var raw = browser ? localStorage.getItem(slotKey(index)) : null;
            var spec = raw ? parseThemeYaml(raw).obj : customThemes[index];
            if (isEmptySlot(spec)) return;
            customThemes[index] = spec;
            // Full replace of the current editor theme — not a merge.
            theme = themeFromObject(spec);
            bumpPreview();
            dispatch("done");
        } catch (err) {
            toastError(toastStore, `load theme failed: ${(err as Error).message}`);
        }
    }
    function removeCustom(index: number): void {
        localStorage.removeItem(slotKey(index));
        customThemes[index] = { name: nameEmpty };
        dispatch("done");
    }
    function overrideCustom(index: number): void {
        if (!theme) return;
        try {
            // Full replace of this slot with the current theme. Do not embed
            // builtin preset_keys — that is only for phone export.
            var yaml = themeToYaml(theme, { includeBuiltinPresets: false });
            localStorage.setItem(slotKey(index), yaml);
            customThemes[index] = parseThemeYaml(yaml).obj;
        } catch (err) {
            toastError(toastStore, `save to local storage failed: ${(err as Error).message}`);
        }
        dispatch("done");
    }
</script>

<div class="grid grid-cols-2 gap-2">
    {#each customThemes as item, index}
        <KeyboardLoad
            on:load={() => loadCustom(index)}
            on:remove={() => removeCustom(index)}
            on:override={() => overrideCustom(index)}
            remove
            override
            keyboard={{ name: slotLabel(item) }}
            loadTitle="以此檔案覆蓋當前主題"
            saveTitle="將當前主題存入此位"
        />
    {/each}
</div>
