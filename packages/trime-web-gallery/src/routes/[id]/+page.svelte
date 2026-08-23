<script lang="ts">
    import type { PageData } from "./$types";
    import { themeFromYaml } from "$lib/loadTheme";
    import LazyPreview from "$lib/components/LazyPreview.svelte";
    import GalleryExportBar from "$lib/components/GalleryExportBar.svelte";

    export var data: PageData;

    $: theme = themeFromYaml(data.yaml);
    $: pairs = theme.colorSchemes.flatMap((_, si) =>
        theme.keyboards.map((_, ki) => ({ si, ki })),
    );
</script>

<article class="space-y-6">
    <header class="space-y-2">
        <h1 class="h2 font-bold">{data.meta.title}</h1>
        {#if data.meta.author}
            <p class="text-sm opacity-80">作者：{data.meta.author}</p>
        {/if}
        {#if data.meta.description}
            <p class="text-sm text-surface-600 dark:text-surface-300">{data.meta.description}</p>
        {/if}
        <p class="text-xs opacity-60">
            {data.schemeCount} 配色 × {data.keyboardCount} 鍵盤
        </p>
    </header>

    <section class="space-y-3">
        <GalleryExportBar {theme} rawYaml={data.yaml} />
    </section>

    <section class="space-y-3">
        <div
            class="grid grid-cols-1 gap-4 sm:grid-cols-2"
            style="grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));"
        >
            {#each pairs as { si, ki } (`${si}-${ki}`)}
                <LazyPreview
                    {theme}
                    schemeIndex={si}
                    keyboardIndex={ki}
                    designWidth={300}
                    lazy={true}
                    controls={true}
                />
            {/each}
        </div>
    </section>
</article>
