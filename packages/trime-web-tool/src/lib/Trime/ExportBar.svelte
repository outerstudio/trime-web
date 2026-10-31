<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import IconButton from "$lib/Component/IconButton.svelte";
    import { get } from "svelte/store";
    import {
        Theme,
        mergeTheme,
        parseThemeYaml,
        sectionToYaml,
        themeToExportYaml,
        TRIGGER_SLOTS,
        ANDROID_KEY_NAMES,
        BUILTIN_PRESET_KEYS,
    } from "trime-web-core";
    import { exportFile } from "./utils/common";
    import { getDateTimeString } from "./utils/format";
    import { saveTheme, THEME_STORAGE_KEY, syncPersistHideStore } from "./utils/recovery";
    import { toastError, toastWarn } from "$lib/utils/error";
    import { persistHideKeySymbols, bumpPreview } from "./utils/revision";
    import { pasteThemeFromClipboard, commitMergedTheme } from "./utils/themePaste";
    import ExportPreviewCollage from "./ExportPreviewCollage.svelte";

    export var theme: Theme;

    const dispatch = createEventDispatcher();
    const toastStore = getToastStore();
    const timeoutDelay = 2000;
    var copied: string = "";
    var collage: { captureAndDownload: () => Promise<void> } | undefined;
    var previewBusy = false;
    var pasteBusy = false;
    const markCopied = (name: string) => {
        copied = name;
        setTimeout(() => (copied = ""), timeoutDelay);
    };

    const warnDanglingPresetRefs = () => {
        var known = new Set<string>([
            ...ANDROID_KEY_NAMES,
            ...Object.keys(BUILTIN_PRESET_KEYS),
            ...theme.presetKeys.map((p) => p.id),
        ]);
        var missing = new Set<string>();
        for (let kb of theme.keyboards) {
            for (let key of kb.keys) {
                for (let slot of TRIGGER_SLOTS) {
                    var v = key.getTrigger(slot);
                    // Plain letters/numbers and free text are valid actions. Restrict
                    // this heuristic to preset-like identifiers to avoid warning for
                    // every q/w/e key or ordinary text macro.
                    var looksLikePreset = typeof v === "string" && /^[A-Za-z][\w.]*_[\w.]+$/.test(v);
                    if (looksLikePreset && !known.has(v as string)) {
                        missing.add(v as string);
                    }
                }
            }
        }
        if (missing.size) {
            toastWarn(
                toastStore,
                `鍵盤引用了不存在的主題鍵: ${[...missing].join(", ")}（請核對 preset_keys 的 id 是否與 click 一致）`,
            );
        }
    };

    const serializeOpts = () => ({ persistHideKeySymbols: get(persistHideKeySymbols) });

    /** YAML 註解；Trime／Rime 會忽略 `#` 行。 */
    const EXPORT_TOOL_URL = "https://trime-web.outerstudio.com/tool/";
    const EXPORT_BANNER = `# 由同文鍵盤設計工具產生: ${EXPORT_TOOL_URL}\n`;
    const withExportBanner = (yaml: string): string => {
        var body = yaml.replace(/^# 由同文鍵盤設計工具產生:.*\r?\n/, "");
        return EXPORT_BANNER + body;
    };

    const exportTheme = () => {
        warnDanglingPresetRefs();
        exportFile(
            withExportBanner(themeToExportYaml(theme, serializeOpts())),
            `${theme.name || "theme"}-${getDateTimeString()}.trime.yaml`,
        );
        dispatch("done");
    };
    const exportPreviewImage = async () => {
        if (previewBusy || !collage) return;
        previewBusy = true;
        try {
            await collage.captureAndDownload();
            dispatch("done");
        } catch (err) {
            toastError(toastStore, `導出預覽圖失敗: ${(err as Error).message}`);
        } finally {
            previewBusy = false;
        }
    };
    const exportSection = (section: string, filename: string) => {
        exportFile(
            withExportBanner(sectionToYaml(theme, section, serializeOpts())),
            `${filename}-${getDateTimeString()}.yaml`,
        );
        dispatch("done");
    };
    const copySection = async (section: string) => {
        try {
            await navigator.clipboard.writeText(withExportBanner(sectionToYaml(theme, section, serializeOpts())));
            markCopied(section);
        } catch (err) {
            toastError(toastStore, `copy failed: ${(err as Error).message}`);
        }
        dispatch("done");
    };

    const resetTheme = () => {
        if (!confirm("重置為預設主題（一份配色、一張鍵盤）？")) return;
        theme = new Theme();
        theme.targetTrimeVersion = "3.3.12";
        persistHideKeySymbols.set(false);
        saveTheme(THEME_STORAGE_KEY, theme);
        bumpPreview();
        dispatch("done");
    };

    var importFileInput: HTMLInputElement;
    const importYaml = (data: string) => {
        try {
            var { obj, warnings } = parseThemeYaml(data);
            commitMergedTheme(theme, mergeTheme(theme, obj));
            theme = theme;
            syncPersistHideStore(theme);
            bumpPreview();
            if (warnings.length) {
                toastError(toastStore, warnings.join("\n"));
            }
        } catch (err) {
            toastError(toastStore, `解析 YAML 失敗: ${(err as Error).message}`);
        } finally {
            dispatch("done");
        }
    };
    const onImportYaml = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        var input = event.currentTarget;
        if (input.files && input.files.length > 0) {
            for (let file of input.files) {
                let reader = new FileReader();
                reader.onload = () => importYaml(reader.result as string);
                reader.readAsText(file);
            }
        }
    };
    const pasteYaml = async () => {
        if (pasteBusy) return;
        pasteBusy = true;
        try {
            var result = await pasteThemeFromClipboard(theme, { confirm: true });
            if (!result.ok) {
                if (result.reason !== "cancel" && result.message) {
                    toastError(toastStore, result.message);
                }
                return;
            }
            commitMergedTheme(theme, result.theme);
            theme = theme;
            syncPersistHideStore(theme);
            bumpPreview();
            if (result.warnings.length) {
                toastError(toastStore, result.warnings.join("\n"));
            }
            toastStore.trigger({
                message: `已粘貼並合併：${result.label}`,
                timeout: 2500,
                hoverable: true,
                background: "variant-filled-success",
            });
        } finally {
            pasteBusy = false;
            dispatch("done");
        }
    };

    const classNames =
        "h-8 w-full p-2 gap-2 flex items-center justify-center rounded-md variant-ringed hover:variant-ghost";
</script>

<ExportPreviewCollage bind:this={collage} {theme} />
<div class="grid grid-cols-2 gap-2">
    <IconButton
        title="導入 .trime.yaml"
        icon="mdi:import"
        on:click={() => importFileInput.click()}
        class={classNames}
    >
        導入主題
        <div class="h-0 w-0 overflow-hidden">
            <input type="file" bind:this={importFileInput} accept=".yaml,.yml" on:change={onImportYaml} />
        </div>
    </IconButton>
    <IconButton
        title="從剪貼簿粘貼完整主題或局部片段。亦可在非輸入框處按 Ctrl+V / ⌘V"
        icon="mdi:content-paste"
        disabled={pasteBusy}
        on:click={pasteYaml}
        class={classNames}
    >
        粘貼(主題、樣式...)
    </IconButton>
    <IconButton title="導出 xxx.trime.yaml" icon="mdi:export" on:click={exportTheme} class={classNames}>
        導出主題
    </IconButton>
    <IconButton
        title="匯出所有配色×鍵盤的預覽拼圖（PNG，無選中手指）"
        icon="mdi:export"
        disabled={previewBusy}
        on:click={exportPreviewImage}
        class={classNames}
    >
        {previewBusy ? "產生預覽中…" : "導出預覽圖"}
    </IconButton>
    <IconButton icon="mdi:export" on:click={() => exportSection("style", "style")} class={classNames}>導出樣式</IconButton>
    <IconButton
        icon="mdi:export"
        on:click={() => exportSection("preset_color_schemes", "schemes")}
        class={classNames}
    >
        導出配色
    </IconButton>
    <IconButton
        icon="mdi:export"
        on:click={() => exportSection("preset_keyboards", "keyboards")}
        class={classNames}
    >
        導出鍵盤
    </IconButton>
    <IconButton
        icon={copied === "style" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("style")}
        class={classNames}
    >
        複製樣式
    </IconButton>
    <IconButton
        icon={copied === "preset_color_schemes" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("preset_color_schemes")}
        class={classNames}
    >
        複製配色
    </IconButton>
    <IconButton
        icon={copied === "preset_keyboards" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("preset_keyboards")}
        class={classNames}
    >
        複製鍵盤
    </IconButton>
    <IconButton
        icon={copied === "preedit" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("preedit")}
        class={classNames}
    >
        複製預編輯區
    </IconButton>
    <IconButton
        icon={copied === "window" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("window")}
        class={classNames}
    >
        複製候選窗口
    </IconButton>
    <IconButton
        icon={copied === "tool_bar" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("tool_bar")}
        class={classNames}
    >
        複製工具欄
    </IconButton>
    <IconButton
        icon={copied === "fallback_colors" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("fallback_colors")}
        class={classNames}
    >
        複製後備顔色
    </IconButton>
    <IconButton
        icon={copied === "preset_keys" ? "mdi:check" : "mdi:content-copy"}
        on:click={() => copySection("preset_keys")}
        class={classNames}
    >
        複製主題鍵
    </IconButton>
    <IconButton title="重置為預設配色與樣式，並删除全部鍵盤" icon="mdi:restore" on:click={resetTheme} class={classNames}>
        重置
    </IconButton>
</div>
