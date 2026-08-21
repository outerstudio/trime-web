<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import type { ColorScheme } from "trime-web-renderer";
    import type { Keyboard } from "trime-web-renderer";
    import type { Style } from "trime-web-renderer";
    import type { PresetKey } from "trime-web-renderer";
    import { hideKeySymbols, previewAsciiMode } from "./utils/revision";
    import { PreviewStage } from "trime-web-renderer/preview";

    export var sticky: boolean = true;
    export var landscape: boolean = false;
    export var scheme: ColorScheme;
    export var keyboard: Keyboard;
    export var style: Style;
    export var fallbackColors: { [id: string]: string } = {};
    export var presetKeys: PresetKey[] = [];
    export var selected: { row: number; col: number };
    export var revision: number = 0;

    /** ~ contemporary phone portrait; landscape flips the ratio. */
    const PHONE_AR = 9 / 19.5;
    /** Map the phone frame's short side to this many theme dp (Trime-ish). */
    const PHONE_SHORT_DP = 360;

    var phoneOverlay = false;
    var viewportW = 0;
    var viewportH = 0;
    var inlineWidth = 0;

    $: phoneAr = landscape ? 1 / PHONE_AR : PHONE_AR;
    // Fit phone frame inside the viewport while keeping aspect ratio.
    $: phoneBox = fitPhoneFrame(viewportW, viewportH, phoneAr);
    // Landscape must not keep the 360 portrait baseline — that stretches row
    // height while the pane is only moderately wider (tall thin keys).
    $: inlineDesignWidth = landscape ? Math.max(640, inlineWidth || 640) : 360;
    // Phone overlay: short side = 360dp so keyboard_height:300 ≈ 300/360 of
    // the short edge (real device), not 300 CSS px inside a huge desktop frame.
    $: phoneShortPx = landscape ? phoneBox.height : phoneBox.width;
    $: phoneDesignWidth =
        phoneShortPx > 0
            ? Math.max(320, Math.round((phoneBox.width / phoneShortPx) * PHONE_SHORT_DP))
            : landscape
              ? 780
              : 360;

    const dispatch = createEventDispatcher();

    function fitPhoneFrame(vw: number, vh: number, ar: number): { width: number; height: number } {
        var maxH = Math.max(280, vh * 0.92);
        var maxW = Math.max(180, vw * 0.92);
        var height = maxH;
        var width = height * ar;
        if (width > maxW) {
            width = maxW;
            height = width / ar;
        }
        return { width, height };
    }

    const openPhone = () => {
        phoneOverlay = true;
    };
    const closePhone = () => {
        phoneOverlay = false;
    };
    const onKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && phoneOverlay) closePhone();
    };
</script>

<svelte:window bind:innerWidth={viewportW} bind:innerHeight={viewportH} on:keydown={onKeydown} />

<div class="flex w-full flex-col gap-1">
    <div bind:clientWidth={inlineWidth} class="w-full">
        <PreviewStage
            {landscape}
            {scheme}
            {keyboard}
            {style}
            {fallbackColors}
            {presetKeys}
            {selected}
            {revision}
            hideSymbols={$hideKeySymbols}
            asciiMode={$previewAsciiMode}
            designWidth={inlineDesignWidth}
            on:clicked={(e) => dispatch("clicked", e.detail)}
        />
    </div>
    <div
        class="mx-1 flex w-auto flex-wrap items-center justify-end gap-0.5 self-end rounded-md bg-surface-200 p-0.5 dark:bg-surface-700"
    >
        <button
            type="button"
            title="僅預覽中／西文鍵面（ascii_mode），不改主題"
            on:click={() => previewAsciiMode.update((v) => !v)}
            class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
            class:bg-surface-50={$previewAsciiMode}
            class:dark:bg-surface-500={$previewAsciiMode}
        >
            <Icon height="16" icon={$previewAsciiMode ? "mdi:alphabetical-variant" : "mdi:ideogram-cjk"} />
            {$previewAsciiMode ? "西文顯示" : "中文顯示"}
        </button>
        <button
            type="button"
            title="隱藏鍵面上方的長按符號（僅預覽）"
            on:click={() => hideKeySymbols.update((v) => !v)}
            class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
            class:bg-surface-50={$hideKeySymbols}
            class:dark:bg-surface-500={$hideKeySymbols}
        >
            <Icon height="16" icon={$hideKeySymbols ? "mdi:label-off-outline" : "mdi:label-outline"} />
            {$hideKeySymbols ? "顯示角標" : "隱藏角標"}
        </button>
        <button
            type="button"
            title="以手機螢幕比例置中預覽"
            on:click={openPhone}
            class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
        >
            <Icon height="16" icon="mdi:cellphone" />
            手機比例
        </button>
        <button
            type="button"
            title={landscape ? "預覽: 横屏" : "預覽: 竪屏"}
            on:click={() => {
                landscape = !landscape;
            }}
            class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
            class:bg-surface-50={landscape}
            class:dark:bg-surface-500={landscape}
        >
            <Icon height="16" icon={landscape ? "mdi:crop-landscape" : "mdi:crop-portrait"} />
            {landscape ? "横屏" : "竪屏"}
        </button>
        <button
            type="button"
            title={sticky ? "取消置頂" : "置頂預覽"}
            on:click={() => dispatch("sticky")}
            class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
            class:bg-surface-50={sticky}
            class:dark:bg-surface-500={sticky}
        >
            <Icon height="16" icon={sticky ? "mdi:pin" : "mdi:pin-off"} />
            {sticky ? "取消置頂" : "置頂預覽"}
        </button>
    </div>
</div>

{#if phoneOverlay}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3"
        role="dialog"
        aria-modal="true"
        aria-label="手機比例預覽"
        tabindex="-1"
        on:click={closePhone}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="relative flex flex-col overflow-hidden rounded-[1.75rem] border-[6px] border-surface-600 bg-surface-900 shadow-xl"
            style:width={`${phoneBox.width}px`}
            style:height={`${phoneBox.height}px`}
            on:click|stopPropagation
        >
            <div class="flex h-7 shrink-0 items-center justify-center gap-2 bg-black/40 px-3">
                <span class="h-2 w-16 rounded-full bg-surface-600/80"></span>
                <button
                    type="button"
                    title={landscape ? "切換竪屏" : "切換横屏"}
                    on:click={() => {
                        landscape = !landscape;
                    }}
                    class="absolute left-2 top-1 flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs hover:variant-ghost"
                >
                    <Icon height="16" icon={landscape ? "mdi:crop-portrait" : "mdi:crop-landscape"} />
                    {landscape ? "竪屏" : "横屏"}
                </button>
                <button
                    type="button"
                    title="關閉"
                    on:click={closePhone}
                    class="absolute right-2 top-1 rounded-full p-1 hover:variant-ghost"
                >
                    <Icon height="18" icon="mdi:close" />
                </button>
            </div>
            <div class="flex min-h-0 flex-1 flex-col">
                <div class="min-h-0 flex-1 bg-gradient-to-b from-surface-800/40 to-surface-900/80"></div>
                <div class="w-full shrink-0">
                    <PreviewStage
                        {landscape}
                        {scheme}
                        {keyboard}
                        {style}
                        {fallbackColors}
                        {presetKeys}
                        {selected}
                        {revision}
                        hideSymbols={$hideKeySymbols}
                        asciiMode={$previewAsciiMode}
                        rounded={false}
                        designWidth={phoneDesignWidth}
                        on:clicked={(e) => dispatch("clicked", e.detail)}
                    />
                </div>
            </div>
        </div>
    </div>
{/if}
