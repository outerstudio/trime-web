<script lang="ts">
    import { onMount } from "svelte";
    import Icon from "@iconify/svelte";
    import type { Theme } from "trime-web-core";
    import { PreviewStage } from "trime-web-core/preview";

    export var theme: Theme;
    export var schemeIndex: number = 0;
    export var keyboardIndex: number = 0;
    export var designWidth: number = 320;
    /** When true, mount PreviewStage only after the cell enters the viewport. */
    export var lazy: boolean = true;
    export var label: string = "";
    /** Preview toolbar: 中文／手機比例／豎屏（不含置頂、隱藏角標）. */
    export var controls: boolean = false;

    var visible = !lazy;
    var root: HTMLElement | undefined;

    var asciiMode = false;
    var landscape = false;
    var phoneOverlay = false;
    var viewportW = 0;
    var viewportH = 0;
    var inlineWidth = 0;

    /** ~ contemporary phone portrait; landscape flips the ratio. */
    const PHONE_AR = 9 / 19.5;
    const PHONE_SHORT_DP = 360;

    $: scheme = theme.colorSchemes[schemeIndex] ?? theme.colorSchemes[0];
    $: keyboard = theme.keyboards[keyboardIndex] ?? theme.keyboards[0];
    $: schemeName = scheme?.name || scheme?.schemaId || `配色 ${schemeIndex + 1}`;
    $: keyboardName = keyboard?.name || keyboard?.schemaId || `鍵盤 ${keyboardIndex + 1}`;

    $: phoneAr = landscape ? 1 / PHONE_AR : PHONE_AR;
    $: phoneBox = fitPhoneFrame(viewportW, viewportH, phoneAr);
    $: inlineDesignWidth = landscape
        ? Math.max(640, inlineWidth || designWidth || 640)
        : designWidth;
    $: phoneShortPx = landscape ? phoneBox.height : phoneBox.width;
    $: phoneDesignWidth =
        phoneShortPx > 0
            ? Math.max(320, Math.round((phoneBox.width / phoneShortPx) * PHONE_SHORT_DP))
            : landscape
              ? 780
              : 360;

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
        if (!controls || !phoneOverlay) return;
        if (e.key === "Escape") closePhone();
    };

    onMount(() => {
        if (!lazy || !root || typeof IntersectionObserver === "undefined") {
            visible = true;
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    visible = true;
                    io.disconnect();
                }
            },
            { rootMargin: "120px" },
        );
        io.observe(root);
        return () => io.disconnect();
    });
</script>

<svelte:window bind:innerWidth={viewportW} bind:innerHeight={viewportH} on:keydown={onKeydown} />

<figure bind:this={root} class="flex flex-col gap-1.5">
    {#if label || (scheme && keyboard)}
        <figcaption class="truncate px-0.5 text-xs text-surface-600 dark:text-surface-300">
            {label || `${schemeName} · ${keyboardName}`}
        </figcaption>
    {/if}
    <div class="overflow-hidden rounded-md border border-surface-500/25 bg-surface-500/5">
        {#if visible && scheme && keyboard}
            <div bind:clientWidth={inlineWidth} class="w-full">
                <PreviewStage
                    trimeVersion={theme.targetTrimeVersion}
                    {scheme}
                    {keyboard}
                    {landscape}
                    style={theme.style}
                    fallbackColors={theme.fallbackColors}
                    presetKeys={theme.presetKeys}
                    selected={{ row: -1, col: -1 }}
                    designWidth={inlineDesignWidth}
                    asciiMode={asciiMode}
                    showSelectedMark={false}
                    rounded={false}
                />
            </div>
        {:else}
            <div class="flex aspect-[5/4] items-center justify-center text-xs opacity-50">載入預覽…</div>
        {/if}
    </div>

    {#if controls && visible && scheme && keyboard}
        <div
            class="mx-0.5 flex w-auto flex-wrap items-center justify-end gap-0.5 self-end rounded-md bg-surface-200 p-0.5 dark:bg-surface-700"
        >
            <button
                type="button"
                title="僅預覽中／西文鍵面（ascii_mode），不改主題"
                on:click={() => (asciiMode = !asciiMode)}
                class="flex items-center gap-0.5 rounded-md px-2 py-1 text-xs hover:bg-surface-300 dark:hover:bg-surface-600"
                class:bg-surface-50={asciiMode}
                class:dark:bg-surface-500={asciiMode}
            >
                <Icon height="16" icon={asciiMode ? "mdi:alphabetical-variant" : "mdi:ideogram-cjk"} />
                {asciiMode ? "西文顯示" : "中文顯示"}
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
        </div>
    {/if}
</figure>

{#if controls && phoneOverlay && scheme && keyboard}
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
                        trimeVersion={theme.targetTrimeVersion}
                        {scheme}
                        {keyboard}
                        {landscape}
                        style={theme.style}
                        fallbackColors={theme.fallbackColors}
                        presetKeys={theme.presetKeys}
                        selected={{ row: -1, col: -1 }}
                        asciiMode={asciiMode}
                        showSelectedMark={false}
                        rounded={false}
                        designWidth={phoneDesignWidth}
                    />
                </div>
            </div>
        </div>
    </div>
{/if}
