<script lang="ts">
    import { getToastStore } from "@skeletonlabs/skeleton";
    import {
        type Theme,
        sectionToYaml,
        themeToExportYaml,
    } from "trime-web-core";
    import { base } from "$app/paths";
    import IconButton from "./IconButton.svelte";
    import InstallGuideModal from "./InstallGuideModal.svelte";
    import { GALLERY_OPEN_THEME_KEY } from "$lib/catalog";

    export var theme: Theme;
    /** Raw catalog YAML text (preferred for open-in-editor / full download). */
    export var rawYaml: string = "";

    const toastStore = getToastStore();
    const timeoutDelay = 2000;
    var copied = "";
    var installGuideOpen = false;

    const serializeOpts = () => ({ persistHideKeySymbols: false });

    const EXPORT_TOOL_URL = "https://trime-web.outerstudio.com/tool/";
    const EXPORT_BANNER = `# 由同文鍵盤設計工具產生: ${EXPORT_TOOL_URL}\n`;
    const withExportBanner = (yaml: string): string => {
        var body = yaml.replace(/^# 由同文鍵盤設計工具產生:.*\r?\n/, "");
        return EXPORT_BANNER + body;
    };

    const exportFile = (data: string, filename: string) => {
        var anchor = document.createElement("a");
        var blob = new Blob([data], { type: "application/yaml; charset=utf-8" });
        var url = window.URL.createObjectURL(blob);
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
    };

    const markCopied = (name: string) => {
        copied = name;
        setTimeout(() => (copied = ""), timeoutDelay);
    };

    const fullYaml = () => {
        if (rawYaml.trim()) return withExportBanner(rawYaml);
        return withExportBanner(themeToExportYaml(theme, serializeOpts()));
    };

    const exportTheme = () => {
        exportFile(fullYaml(), `${themeFileBase()}.trime.yaml`);
    };

    const themeFileBase = () => (theme.name || "theme").trim() || "theme";

    const exportSection = (section: string, filename: string) => {
        exportFile(
            withExportBanner(sectionToYaml(theme, section, serializeOpts())),
            `${themeFileBase()}-${filename}.yaml`,
        );
    };

    const copySection = async (section: string) => {
        try {
            await navigator.clipboard.writeText(
                withExportBanner(sectionToYaml(theme, section, serializeOpts())),
            );
            markCopied(section);
            toastStore.trigger({
                message: "已複製到剪貼簿",
                timeout: 2000,
                background: "variant-filled-success",
            });
        } catch (err) {
            toastStore.trigger({
                message: `複製失敗: ${(err as Error).message}`,
                timeout: 3500,
                background: "variant-filled-error",
            });
        }
    };

    const openInEditor = () => {
        try {
            sessionStorage.setItem(GALLERY_OPEN_THEME_KEY, fullYaml());
        } catch (err) {
            toastStore.trigger({
                message: `無法寫入暫存: ${(err as Error).message}`,
                timeout: 3500,
                background: "variant-filled-error",
            });
            return;
        }
        // Same-origin path on Pages; in local multi-port dev, user may need absolute tool URL.
        window.location.assign("/tool/?from=gallery");
    };

    const classNames =
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm variant-ringed hover:variant-ghost";
    const backClassNames =
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium variant-filled-secondary";
</script>

<div class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center gap-2">
        <a class={backClassNames} href="{base}/" data-sveltekit-preload-data="hover">
            ← 返回列表
        </a>
        <button
            type="button"
            class={backClassNames}
            title="安裝辦法"
            on:click={() => (installGuideOpen = true)}
        >
            安裝辦法
        </button>
    </div>

    <InstallGuideModal bind:open={installGuideOpen} />

    <div class="flex flex-wrap items-center gap-2">
        <IconButton icon="mdi:export" class={classNames} on:click={exportTheme}>下載主題</IconButton>
        <IconButton
            icon="mdi:export"
            class={classNames}
            on:click={() => exportSection("style", "style")}
        >
            下載樣式
        </IconButton>
        <IconButton
            icon="mdi:export"
            class={classNames}
            on:click={() => exportSection("preset_keyboards", "keyboards")}
        >
            下載鍵盤
        </IconButton>
        <IconButton
            icon="mdi:export"
            class={classNames}
            on:click={() => exportSection("preset_color_schemes", "schemes")}
        >
            下載配色
        </IconButton>

        <span
            class="mx-1 inline-block h-5 w-0.5 shrink-0 self-center rounded-full bg-surface-500/70 dark:bg-surface-300/50"
            aria-hidden="true"
        ></span>

        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("preset_color_schemes")}
        >
            {copied === "preset_color_schemes" ? "已複製配色" : "複製配色"}
        </IconButton>
        <IconButton icon="mdi:content-copy" class={classNames} on:click={() => copySection("style")}>
            {copied === "style" ? "已複製樣式" : "複製樣式"}
        </IconButton>
        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("preset_keyboards")}
        >
            {copied === "preset_keyboards" ? "已複製鍵盤" : "複製鍵盤"}
        </IconButton>
        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("preedit")}
        >
            {copied === "preedit" ? "已複製預編輯區" : "複製預編輯區"}
        </IconButton>
        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("tool_bar")}
        >
            {copied === "tool_bar" ? "已複製工具欄" : "複製工具欄"}
        </IconButton>
        <IconButton icon="mdi:content-copy" class={classNames} on:click={() => copySection("window")}>
            {copied === "window" ? "已複製候選窗口" : "複製候選窗口"}
        </IconButton>
        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("preset_keys")}
        >
            {copied === "preset_keys" ? "已複製主題鍵" : "複製主題鍵"}
        </IconButton>
        <IconButton
            icon="mdi:content-copy"
            class={classNames}
            on:click={() => copySection("fallback_colors")}
        >
            {copied === "fallback_colors" ? "已複製後備顏色" : "複製後備顏色"}
        </IconButton>

        <span
            class="mx-1 inline-block h-5 w-0.5 shrink-0 self-center rounded-full bg-surface-500/70 dark:bg-surface-300/50"
            aria-hidden="true"
        ></span>

        <IconButton
            title="在編輯器開啟"
            icon="mdi:pencil-box-outline"
            class="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm variant-filled-primary"
            on:click={openInEditor}
        >
            在編輯器開啟
        </IconButton>
    </div>
</div>
