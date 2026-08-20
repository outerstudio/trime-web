<script lang="ts">
    import type { LayoutData } from "./$types";
    import { browser } from "$app/environment";
    import { onMount, setContext } from "svelte";
    import { writable } from "svelte/store";
    import "../app.postcss";
    import { page } from "$app/stores";
    import { Toast } from "@skeletonlabs/skeleton";
    import { LightSwitch } from "@skeletonlabs/skeleton";
    import { autoModeWatcher, initializeStores } from "@skeletonlabs/skeleton";
    import Icon from "@iconify/svelte";
    import { persisted } from "$lib/utils/persisted";
    import CoffeeSupport from "$lib/Component/CoffeeSupport.svelte";

    export var data: LayoutData;

    initializeStores();

    var credits: [string, string][] = data.credits;

    /** 主題列表及其顯示名稱 */
    const themes: { [key: string]: string } = {
        skeleton: "Skeleton",
        wintry: "Wintry",
        modern: "Modern",
        rocket: "Rocket",
        seafoam: "Seaform",
        vintage: "Vintage",
        sahara: "Sahara",
        hamlindigo: "Hamlindigo",
        "gold-nouveau": "Gold Nouveau",
        crimson: "Crimson",
    };

    /** 主題選擇控件綁定值 */
    var theme = setContext("data-theme", persisted("data-theme", "wintry"));
    /** 暗色模式監聽值 */
    var darkMode = setContext("darkMode", writable(false));
    var themeMenuOpen = false;
    var coffeeOpen = false;

    // 設置頁面主題
    $: if (browser) {
        let attr = document.body.attributes.getNamedItem("data-theme");
        if (attr && themes[$theme]) {
            attr.value = $theme;
        }
    }

    const updateDarkMode = () => {
        $darkMode = document.documentElement.classList.contains("dark");
    };

    const pickTheme = (id: string) => {
        $theme = id;
        themeMenuOpen = false;
    };

    if (browser) {
        // 暗色模式監聽值初始化
        updateDarkMode();

        // 判斷使用者的語言，繁體中文與簡體中文何者為先
        for (let lang of navigator.languages) {
            switch (lang.toLowerCase()) {
                case "zh":
                case "zh-cn":
                    // 簡體優先，則採用簡體字型
                    document.documentElement.lang = "cmn-Hans-CN";
                    break;

                case "zh-tw":
                case "zh-hk":
                case "zh-mo":
                    // 繁體優先，則採用繁體字型
                    document.documentElement.lang = "cmn-Hant-CN";
                    break;

                default:
                    continue;
            }
        }
    }

    onMount(() => {
        autoModeWatcher();
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
                    class="hidden h-8 max-w-[9rem] items-center px-2.5 text-xs leading-none text-surface-300 md:inline-flex lg:max-w-[16rem]"
                    title="滿載愛意製作，請讓咖啡爲愛發電"
                >
                    <span class="truncate">
                        滿載愛意製作<span class="mx-1 opacity-40">·</span>請讓咖啡爲愛發電
                    </span>
                </div>
                <button
                    type="button"
                    class="variant-filled-success inline-flex h-8 shrink-0 items-center gap-1.5 px-2.5 text-xs font-medium !leading-none !text-surface-900 transition hover:brightness-110 active:brightness-95 sm:px-3 sm:text-sm"
                    title="請我喝杯咖啡"
                    on:click={() => (coffeeOpen = true)}
                >
                    <span class="leading-none whitespace-nowrap">請我喝杯咖啡</span>
                    <Icon icon="mdi:coffee" class="block h-4 w-4 shrink-0" />
                </button>
            </div>
        </div>

        <h2 class="h3 max-w-[min(42vw,20rem)] truncate text-center font-bold sm:max-w-[36vw]">
            {$page.data.title}
        </h2>

        <div class="flex shrink-0 items-center justify-self-end gap-1 sm:gap-2">
            <LightSwitch
                on:click={updateDarkMode}
                class="variant-ghost"
                height="h-8"
                width="w-16"
            />
            <div class="relative">
                <button
                    type="button"
                    class="variant-ghost btn-icon btn-icon-sm"
                    title="界面主題"
                    aria-label="界面主題"
                    aria-expanded={themeMenuOpen}
                    on:click={() => (themeMenuOpen = !themeMenuOpen)}
                >
                    <Icon icon="mdi:palette" />
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
                                class:variant-soft={$theme === id}
                                class:variant-ghost={$theme !== id}
                                on:click={() => pickTheme(id)}
                            >
                                {label}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            <a
                title="倉庫"
                class="variant-ghost btn-icon btn-icon-sm"
                target="_blank"
                href="https://github.com/garyyeap/trime-tool.github.io"
            >
                <Icon icon="mdi:github" />
            </a>
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
                <a target="_blank" href={credit[1]} class="min-w-0 shrink grow px-1 text-center text-sm whitespace-nowrap">
                    {credit[0]}
                </a>
            {/each}
        </div>
    </div>
</div>
