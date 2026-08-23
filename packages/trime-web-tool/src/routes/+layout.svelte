<script lang="ts">
    import type { LayoutData } from "./$types";
    import { browser } from "$app/environment";
    import { onMount, setContext } from "svelte";
    import { get, writable } from "svelte/store";
    import "../app.postcss";
    import { page } from "$app/stores";
    import { Toast } from "@skeletonlabs/skeleton";
    import {
        getModeAutoPrefers,
        initializeStores,
        modeCurrent,
        setModeCurrent,
        setModeUserPrefers,
    } from "@skeletonlabs/skeleton";
    import Icon from "@iconify/svelte";
    import { persisted } from "$lib/utils/persisted";
    import CoffeeSupport from "$lib/Component/CoffeeSupport.svelte";
    import BrandMark from "$lib/Component/BrandMark.svelte";
    import ScriptToggle from "$lib/Component/ScriptToggle.svelte";
    import { startScriptVariantWatch } from "$lib/utils/scriptVariant";

    export var data: LayoutData;

    initializeStores();

    var credits: [string, string][] = data.credits;

    /** 主題列表及其顯示名稱 */
    const themes: { [key: string]: string } = {
        skeleton: "Skeleton",
        crimson: "Crimson",
        modern: "Modern",
        rocket: "Rocket",
        seafoam: "Seaform",
        vintage: "Vintage",
        sahara: "Sahara",
        hamlindigo: "Hamlindigo",
        "gold-nouveau": "Gold Nouveau",
        wintry: "Wintry",
    };

    /** 主題選擇控件綁定值 */
    var theme = setContext("data-theme", persisted("data-theme", "wintry"));
    /** 暗色模式監聽值（Skeleton: modeCurrent true = 淺色） */
    var darkMode = setContext("darkMode", writable(false));
    var themeMenuOpen = false;
    var navMenuOpen = false;
    var coffeeOpen = false;

    const headerPillClass =
        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-900 px-2.5 text-sm font-medium text-surface-50 dark:bg-surface-50 dark:text-surface-900";
    const headerMenuRowClass =
        "flex w-full items-center gap-2 rounded-token px-2.5 py-2 text-left text-sm font-medium transition hover:bg-surface-500/15";

    // Same glyphs as Skeleton LightSwitch
    const sunPath =
        "M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM352 256c0 53-43 96-96 96s-96-43-96-96s43-96 96-96s96 43 96 96zm32 0c0-70.7-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128s128-57.3 128-128z";
    const moonPath =
        "M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z";

    // 設置頁面主題
    $: if (browser) {
        let attr = document.body.attributes.getNamedItem("data-theme");
        if (attr && themes[$theme]) {
            attr.value = $theme;
        }
    }

    // modeCurrent true = light → darkMode false
    $: if (browser) {
        $darkMode = !$modeCurrent;
    }

    const pickTheme = (id: string) => {
        $theme = id;
        themeMenuOpen = false;
    };

    const closeNavMenu = () => {
        navMenuOpen = false;
        themeMenuOpen = false;
    };

    const toggleNavMenu = () => {
        navMenuOpen = !navMenuOpen;
        if (!navMenuOpen) themeMenuOpen = false;
    };

    /** Skeleton: true = light, false = dark. Persist both stores + html.dark. */
    const toggleColorMode = () => {
        var next = !get(modeCurrent);
        setModeUserPrefers(next);
        setModeCurrent(next);
    };

    if (browser) {
        for (let lang of navigator.languages) {
            switch (lang.toLowerCase()) {
                case "zh":
                case "zh-cn":
                    document.documentElement.lang = "cmn-Hans-CN";
                    break;

                case "zh-tw":
                case "zh-hk":
                case "zh-mo":
                    document.documentElement.lang = "cmn-Hant-CN";
                    break;

                default:
                    continue;
            }
        }
    }

    onMount(() => {
        // Re-apply stored preference after hydrate (app.html already set class for FOUC).
        // Never call autoModeWatcher() — it ignores modeUserPrefers and follows OS only.
        setModeCurrent(getModeAutoPrefers());
        return startScriptVariantWatch();
    });
</script>

<svelte:head>
    <!-- 頁面標題: "内容標題 - 站點標題" -->
    <title>{$page.data.title}</title>
</svelte:head>

<div class="flex min-h-lvh flex-col">
    <!-- 頂部標題欄：左右等寛，標題真正置中 -->
    <header
        class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-surface-500/20 px-3 py-2 sm:gap-3 sm:px-4"
    >
        <div class="min-w-0 justify-self-start">
            <div
                class="inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-surface-500/30 bg-surface-500/10"
            >
                <div
                    class="hidden h-8 shrink-0 items-center px-2.5 text-xs leading-none whitespace-nowrap text-surface-600 xl:inline-flex dark:text-surface-300"
                    title="滿載愛意製作，請讓咖啡爲愛發電"
                >
                    <span>
                        滿載愛意製作<span class="mx-1 opacity-40">·</span>請讓咖啡爲愛發電
                    </span>
                </div>
                <button
                    type="button"
                    class="variant-filled-success inline-flex h-8 shrink-0 items-center gap-1.5 px-2.5 text-xs font-medium !leading-none !text-surface-900 transition hover:brightness-110 active:brightness-95 sm:px-3 sm:text-sm"
                    title="請網站作者喝杯咖啡"
                    on:click={() => (coffeeOpen = true)}
                >
                    <span class="leading-none whitespace-nowrap">請網站作者喝杯咖啡</span>
                    <Icon icon="mdi:coffee" class="block h-4 w-4 shrink-0" />
                </button>
            </div>
        </div>

        <a
            href="/"
            class="group z-10 flex min-w-0 max-w-[min(42vw,18rem)] items-center justify-center gap-1.5 justify-self-center sm:max-w-[36vw] sm:gap-2 lg:max-w-[40vw]"
            title="Trime Web 首頁"
        >
            <BrandMark size={30} />
            <h2 class="h3 truncate text-center font-bold transition group-hover:opacity-80">
                {$page.data.title}
            </h2>
        </a>

        <div class="relative justify-self-end">
            <!-- Desktop: full link row -->
            <div class="hidden items-center gap-1.5 lg:flex lg:gap-2">
                <a
                    href="/gallery/"
                    class={headerPillClass}
                    title="瀏覽其他人的主題"
                >
                    <Icon icon="mdi:view-gallery-outline" class="block h-4 w-4 shrink-0" />
                    <span>瀏覽其他人的主題</span>
                </a>
                <a
                    title="分享主題"
                    class={headerPillClass}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/outerstudio/trime-themes"
                >
                    <Icon icon="mdi:share-variant-outline" class="block h-4 w-4 shrink-0" />
                    <span>分享主題</span>
                </a>
                <a
                    title="Github"
                    class={headerPillClass}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/outerstudio/trime-web"
                >
                    <Icon icon="simple-icons:github" class="block h-4 w-4 shrink-0" />
                    <span>Github</span>
                </a>
                <div class="relative">
                    <button
                        type="button"
                        class={headerPillClass}
                        title="切換色系"
                        aria-label="切換色系"
                        aria-expanded={themeMenuOpen}
                        on:click={() => (themeMenuOpen = !themeMenuOpen)}
                    >
                        <Icon icon="mdi:palette-outline" class="block h-4 w-4 shrink-0" />
                        <span>切換色系</span>
                    </button>
                    {#if themeMenuOpen}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div class="fixed inset-0 z-40" on:click={() => (themeMenuOpen = false)}></div>
                        <div
                            class="variant-filled card absolute right-0 top-full z-50 mt-2 grid w-56 grid-cols-2 gap-1 p-2 shadow-xl"
                        >
                            <span class="col-span-2 px-1 pb-1 text-center text-xs opacity-70">界面主題</span>
                            {#each Object.entries(themes) as [id, label]}
                                <button
                                    type="button"
                                    class="btn btn-sm"
                                    class:variant-filled-primary={$theme === id}
                                    class:variant-ghost={$theme !== id}
                                    aria-pressed={$theme === id}
                                    on:click={() => pickTheme(id)}
                                >
                                    {label}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
                <ScriptToggle />
                <button
                    type="button"
                    class="flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-token ring-[1px] ring-surface-500/30 transition-all duration-200 {$modeCurrent
                        ? 'bg-surface-50'
                        : 'bg-surface-900'}"
                    role="switch"
                    aria-checked={$modeCurrent}
                    aria-label="切換淺色／深色"
                    title="切換淺色／深色"
                    on:click={toggleColorMode}
                >
                    <span
                        class="flex aspect-square h-full scale-[0.8] items-center justify-center rounded-token transition-all duration-200 {$modeCurrent
                            ? 'translate-x-[100%] bg-surface-900'
                            : 'bg-surface-50'}"
                    >
                        <svg
                            class="aspect-square w-[70%] {$modeCurrent ? 'fill-surface-50' : 'fill-surface-900'}"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            aria-hidden="true"
                        >
                            <path d={$modeCurrent ? sunPath : moonPath} />
                        </svg>
                    </span>
                </button>
            </div>

            <!-- Mobile: hamburger -->
            <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-900 text-surface-50 lg:hidden dark:bg-surface-50 dark:text-surface-900"
                title="選單"
                aria-label="選單"
                aria-expanded={navMenuOpen}
                on:click={toggleNavMenu}
            >
                <Icon icon={navMenuOpen ? "mdi:close" : "mdi:menu"} class="block h-5 w-5" />
            </button>
            {#if navMenuOpen}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="fixed inset-0 z-40 lg:hidden" on:click={closeNavMenu}></div>
                <div
                    class="variant-filled card absolute right-0 top-full z-50 mt-2 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-0.5 p-2 shadow-xl lg:hidden"
                >
                    <a href="/gallery/" class={headerMenuRowClass} on:click={closeNavMenu}>
                        <Icon icon="mdi:view-gallery-outline" class="block h-4 w-4 shrink-0" />
                        <span>瀏覽其他人的主題</span>
                    </a>
                    <a
                        class={headerMenuRowClass}
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/outerstudio/trime-themes"
                        on:click={closeNavMenu}
                    >
                        <Icon icon="mdi:share-variant-outline" class="block h-4 w-4 shrink-0" />
                        <span>分享主題</span>
                    </a>
                    <a
                        class={headerMenuRowClass}
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://github.com/outerstudio/trime-web"
                        on:click={closeNavMenu}
                    >
                        <Icon icon="simple-icons:github" class="block h-4 w-4 shrink-0" />
                        <span>Github</span>
                    </a>
                    <button
                        type="button"
                        class={headerMenuRowClass}
                        aria-expanded={themeMenuOpen}
                        on:click={() => (themeMenuOpen = !themeMenuOpen)}
                    >
                        <Icon icon="mdi:palette-outline" class="block h-4 w-4 shrink-0" />
                        <span class="grow">切換色系</span>
                        <Icon
                            icon={themeMenuOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                            class="block h-4 w-4 shrink-0 opacity-60"
                        />
                    </button>
                    {#if themeMenuOpen}
                        <div class="grid grid-cols-2 gap-1 px-1 pb-1">
                            {#each Object.entries(themes) as [id, label]}
                                <button
                                    type="button"
                                    class="btn btn-sm"
                                    class:variant-filled-primary={$theme === id}
                                    class:variant-ghost={$theme !== id}
                                    aria-pressed={$theme === id}
                                    on:click={() => pickTheme(id)}
                                >
                                    {label}
                                </button>
                            {/each}
                        </div>
                    {/if}
                    <div class="my-1 border-t border-surface-500/20"></div>
                    <div class="flex items-center justify-between gap-3 px-2.5 py-1.5">
                        <span class="text-sm font-medium">簡繁</span>
                        <ScriptToggle />
                    </div>
                    <div class="flex items-center justify-between gap-3 px-2.5 py-1.5">
                        <span class="text-sm font-medium">淺色／深色</span>
                        <button
                            type="button"
                            class="flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-token ring-[1px] ring-surface-500/30 transition-all duration-200 {$modeCurrent
                                ? 'bg-surface-50'
                                : 'bg-surface-900'}"
                            role="switch"
                            aria-checked={$modeCurrent}
                            aria-label="切換淺色／深色"
                            title="切換淺色／深色"
                            on:click={toggleColorMode}
                        >
                            <span
                                class="flex aspect-square h-full scale-[0.8] items-center justify-center rounded-token transition-all duration-200 {$modeCurrent
                                    ? 'translate-x-[100%] bg-surface-900'
                                    : 'bg-surface-50'}"
                            >
                                <svg
                                    class="aspect-square w-[70%] {$modeCurrent
                                        ? 'fill-surface-50'
                                        : 'fill-surface-900'}"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    aria-hidden="true"
                                >
                                    <path d={$modeCurrent ? sunPath : moonPath} />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </header>

    <Toast zIndex="z-[999]" position="t" />
    <CoffeeSupport bind:open={coffeeOpen} />

    <!-- 頁面内容插槽 -->
    <slot />

    <div class="sticky top-full flex justify-center px-2">
        <!-- 底部鏈接欄 -->
        <div class="variant-soft btn-group w-full max-w-2xl rounded-md">
            {#each credits as credit}
                <a
                    href={credit[1]}
                    target={credit[1].startsWith("http") ? "_blank" : undefined}
                    rel={credit[1].startsWith("http") ? "noopener noreferrer" : undefined}
                    class="min-w-0 shrink grow px-1 text-center text-sm whitespace-nowrap"
                >
                    {credit[0]}
                </a>
            {/each}
        </div>
    </div>
</div>
