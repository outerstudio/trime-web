<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { get } from "svelte/store";
    import { browser } from "$app/environment";
    import KeyboardLoad from "./KeyboardLoad.svelte";
    import { Theme, parseThemeYaml, themeFromObject, themeToYaml } from "trime-web-core";
    import { toastError } from "$lib/utils/error";
    import { bumpPreview, persistHideKeySymbols } from "./utils/revision";
    import { syncPersistHideStore } from "./utils/recovery";

    const toastStore = getToastStore();
    const nameEmpty = "空的";
    /** YYMMDD-HHmmss 或 YYYYMMDD-HHmmss，接在主題名後的儲存槽顯示用後綴 */
    const SAVE_TIME_SUFFIX = /-\d{6}-\d{6}$|-\d{8}-\d{6}$/;

    export var theme: Theme;
    export var customThemes: object[];
    const dispatch = createEventDispatcher();

    if (!customThemes || customThemes.length === 0) {
        customThemes = new Array(10).fill(0).map((_, index) => readSlot(index));
    }

    function slotKey(index: number): string {
        return `customTrimeTheme${index}`;
    }
    function slotMetaKey(index: number): string {
        return `customTrimeThemeMeta${index}`;
    }
    function stripSaveTime(name: string): string {
        var raw = (name || "").trim();
        if (!raw || raw === nameEmpty) return "";
        var base = raw.replace(SAVE_TIME_SUFFIX, "");
        return base || raw;
    }
    /** 精簡時間：YYMMDD-HHmmss，例如 260822-040612 */
    function saveTimestamp(): string {
        var d = new Date();
        var p = (n: number) => String(n).padStart(2, "0");
        var yy = String(d.getFullYear()).slice(-2);
        return `${yy}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    }
    /** 槽位列表用的顯示名（帶時間）；不寫進 theme.name */
    function slotLabelWithTime(name: string): string {
        var base = stripSaveTime(name);
        if (!base) base = "theme";
        return `${base}-${saveTimestamp()}`;
    }
    function readSlotMetaLabel(index: number): string {
        if (!browser) return "";
        try {
            var raw = localStorage.getItem(slotMetaKey(index));
            if (!raw) return "";
            var meta = JSON.parse(raw);
            return meta && typeof meta.label === "string" ? meta.label.trim() : "";
        } catch {
            return "";
        }
    }
    function readSlot(index: number): object {
        var raw = browser && localStorage.getItem(slotKey(index));
        if (raw) {
            try {
                var { obj } = parseThemeYaml(raw);
                if (obj && typeof obj === "object") {
                    var metaLabel = readSlotMetaLabel(index);
                    var yamlName = typeof (obj as any).name === "string" ? (obj as any).name : "";
                    // 舊槽：時間戳寫在 name 裡 → 顯示用原字串，載入時再剝掉
                    var slotLabel = metaLabel || (SAVE_TIME_SUFFIX.test(yamlName) ? yamlName : "") || yamlName;
                    return { ...(obj as object), _slotLabel: slotLabel || nameEmpty };
                }
            } catch (err) {
                toastError(toastStore, `parse custom theme failed: ${(err as Error).message}`);
            }
        }
        return { name: nameEmpty, _slotLabel: nameEmpty };
    }
    function slotLabel(item: any): string {
        if (item && typeof item._slotLabel === "string" && item._slotLabel.trim()) return item._slotLabel;
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
            var metaLabel = readSlotMetaLabel(index);
            var yamlName = typeof (spec as any).name === "string" ? (spec as any).name : "";
            customThemes[index] = {
                ...(spec as object),
                _slotLabel: metaLabel || (SAVE_TIME_SUFFIX.test(yamlName) ? yamlName : "") || yamlName || nameEmpty,
            };
            // Full replace of the current editor theme — not a merge.
            theme = themeFromObject(spec);
            // 槽位時間戳只是列表標籤；主題名稱保持乾淨
            theme.name = stripSaveTime(theme.name) || theme.name;
            syncPersistHideStore(theme);
            bumpPreview();
            dispatch("done");
        } catch (err) {
            toastError(toastStore, `load theme failed: ${(err as Error).message}`);
        }
    }
    function removeCustom(index: number): void {
        localStorage.removeItem(slotKey(index));
        localStorage.removeItem(slotMetaKey(index));
        customThemes[index] = { name: nameEmpty, _slotLabel: nameEmpty };
        dispatch("done");
    }
    function overrideCustom(index: number): void {
        if (!theme) return;
        try {
            // Keep theme.name free of slot timestamps (also cleans older polluted saves).
            theme.name = stripSaveTime(theme.name) || theme.name || "theme";
            var stampLabel = slotLabelWithTime(theme.name);
            // Full replace of this slot with the current theme. Do not embed
            // builtin preset_keys — that is only for phone export.
            var yaml = themeToYaml(theme, {
                includeBuiltinPresets: false,
                persistHideKeySymbols: get(persistHideKeySymbols),
            });
            localStorage.setItem(slotKey(index), yaml);
            localStorage.setItem(slotMetaKey(index), JSON.stringify({ label: stampLabel }));
            var obj = parseThemeYaml(yaml).obj as object;
            customThemes[index] = { ...obj, _slotLabel: stampLabel };
            customThemes = customThemes;
            theme = theme;
        } catch (err) {
            toastError(toastStore, `save to local storage failed: ${(err as Error).message}`);
        }
        dispatch("done");
    }
</script>

<div class="grid min-w-0 grid-cols-2 gap-2">
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
