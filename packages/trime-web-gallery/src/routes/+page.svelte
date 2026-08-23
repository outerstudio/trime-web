<script lang="ts">
    import type { PageData } from "./$types";
    import { base } from "$app/paths";
    import { themeFromYaml } from "$lib/loadTheme";
    import LazyPreview from "$lib/components/LazyPreview.svelte";

    export var data: PageData;

    function pageHref(page: number): string {
        if (page <= 1) return `${base}/`;
        return `${base}/?page=${page}`;
    }

    /** Compact page list: 1 … n-1 n n+1 … last */
    function pageItems(current: number, total: number): Array<number | "gap"> {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        var items: Array<number | "gap"> = [1];
        var start = Math.max(2, current - 1);
        var end = Math.min(total - 1, current + 1);
        if (start > 2) items.push("gap");
        for (let p = start; p <= end; p++) items.push(p);
        if (end < total - 1) items.push("gap");
        items.push(total);
        return items;
    }

    $: pages = pageItems(data.page, data.totalPages);
</script>

{#if !data.total}
    <p class="opacity-70">尚無主題</p>
{:else}
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-sm opacity-70">
        <span>共 {data.total} 個主題</span>
        {#if data.totalPages > 1}
            <span>第 {data.page} / {data.totalPages} 頁</span>
        {/if}
    </div>

    <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.themes as item (item.id)}
            {@const theme = themeFromYaml(item.yaml)}
            <li>
                <a
                    href="{base}/{item.id}/"
                    class="card block space-y-3 border border-surface-500/20 p-3 transition hover:border-primary-500/50 hover:shadow-md"
                    data-sveltekit-preload-data="hover"
                >
                    <LazyPreview {theme} schemeIndex={0} keyboardIndex={0} designWidth={280} />
                    <div class="min-w-0 space-y-0.5 px-0.5">
                        <div class="truncate font-semibold">{item.title}</div>
                        {#if item.author}
                            <div class="truncate text-xs opacity-70">{item.author}</div>
                        {/if}
                        {#if item.description}
                            <p class="line-clamp-2 text-xs text-surface-600 dark:text-surface-300">
                                {item.description}
                            </p>
                        {/if}
                    </div>
                </a>
            </li>
        {/each}
    </ul>

    {#if data.totalPages > 1}
        <nav
            class="mt-6 flex flex-wrap items-center justify-center gap-1.5"
            aria-label="主題列表分頁"
        >
            {#if data.page > 1}
                <a href={pageHref(data.page - 1)} class="btn variant-ghost-surface btn-sm">
                    上一頁
                </a>
            {:else}
                <span class="btn variant-ghost-surface btn-sm pointer-events-none opacity-40">上一頁</span>
            {/if}

            {#each pages as item, i (typeof item === "number" ? item : `gap-${i}`)}
                {#if item === "gap"}
                    <span class="px-1 text-sm opacity-50" aria-hidden="true">…</span>
                {:else}
                    <a
                        href={pageHref(item)}
                        class="btn btn-sm min-w-[2.25rem] {item === data.page
                            ? 'variant-filled-primary'
                            : 'variant-ghost-surface'}"
                        aria-current={item === data.page ? "page" : undefined}
                    >
                        {item}
                    </a>
                {/if}
            {/each}

            {#if data.page < data.totalPages}
                <a href={pageHref(data.page + 1)} class="btn variant-ghost-surface btn-sm">
                    下一頁
                </a>
            {:else}
                <span class="btn variant-ghost-surface btn-sm pointer-events-none opacity-40">下一頁</span>
            {/if}
        </nav>
    {/if}
{/if}
