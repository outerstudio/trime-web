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
    } from "trime-web-renderer";
    import { exportFile } from "./utils/common";
    import { getDateTimeString } from "./utils/format";
    import { saveTheme, THEME_STORAGE_KEY, syncPersistHideStore } from "./utils/recovery";
    import { toastError, toastWarn } from "$lib/utils/error";
    import { persistHideKeySymbols, bumpPreview } from "./utils/revision";

    export var theme: Theme;

    const dispatch = createEventDispatcher();
    const toastStore = getToastStore();
    const timeoutDelay = 2000;
    var copied: string = "";
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

    const exportTheme = () => {
        warnDanglingPresetRefs();
        exportFile(themeToExportYaml(theme, serializeOpts()), `${theme.name || "theme"}-${getDateTimeString()}.trime.yaml`);
        dispatch("done");
    };
    const exportSection = (section: string, filename: string) => {
        exportFile(sectionToYaml(theme, section, serializeOpts()), `${filename}-${getDateTimeString()}.yaml`);
        dispatch("done");
    };
    const copySection = async (section: string) => {
        try {
            await navigator.clipboard.writeText(sectionToYaml(theme, section, serializeOpts()));
            markCopied(section);
        } catch (err) {
            toastError(toastStore, `copy failed: ${(err as Error).message}`);
        }
        dispatch("done");
    };

    const resetTheme = () => {
        if (!confirm("重置為預設主題（一份配色、一張鍵盤）？")) return;
        theme = new Theme();
        persistHideKeySymbols.set(false);
        saveTheme(THEME_STORAGE_KEY, theme);
        bumpPreview();
        dispatch("done");
    };

    var importFileInput: HTMLInputElement;
    const importYaml = (data: string) => {
        try {
            var { obj, warnings } = parseThemeYaml(data);
            theme = mergeTheme(theme, obj);
            syncPersistHideStore(theme);
            bumpPreview();
            if (warnings.length) {
                toastError(toastStore, warnings.join("\n"));
            }
        } catch (err) {
            toastError(toastStore, `failed to parse file: ${(err as Error).message}`);
        }
        dispatch("done");
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

    const classNames =
        "h-8 w-full p-2 gap-2 flex items-center justify-center rounded-md variant-ringed hover:variant-ghost";
</script>

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
    <IconButton title="導出 xxx.trime.yaml" icon="mdi:export" on:click={exportTheme} class={classNames}>
        導出主題
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
        icon={copied === "style" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("style")}
        class={classNames}
    >
        複製樣式
    </IconButton>
    <IconButton
        icon={copied === "preedit" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("preedit")}
        class={classNames}
    >
        複製 preedit
    </IconButton>
    <IconButton
        icon={copied === "window" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("window")}
        class={classNames}
    >
        複製 window
    </IconButton>
    <IconButton
        icon={copied === "tool_bar" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("tool_bar")}
        class={classNames}
    >
        複製 tool_bar
    </IconButton>
    <IconButton
        icon={copied === "fallback_colors" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("fallback_colors")}
        class={classNames}
    >
        複製回退
    </IconButton>
    <IconButton
        icon={copied === "preset_keys" ? "mdi:check" : "mdi:clipboard"}
        on:click={() => copySection("preset_keys")}
        class={classNames}
    >
        複製主題鍵
    </IconButton>
    <IconButton title="重置為預設配色與樣式，並删除全部鍵盤" icon="mdi:restore" on:click={resetTheme} class={classNames}>
        重置
    </IconButton>
</div>
