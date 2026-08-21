<script lang="ts">
    import { scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import Icon from "@iconify/svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import { ColorScheme } from "trime-web-renderer";
    import ColorSwatch from "./ColorSwatch.svelte";
    import { nextIndexed } from "./utils/common";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { toastWarn } from "$lib/utils/error";

    export var colorSchemes: ColorScheme[];
    export var indexSchema: number;
    export var currentSchema: ColorScheme;
    export var fallbackColors: { [id: string]: string } = {};

    const toastStore = getToastStore();
    var clipSchema = new ColorScheme();
    const copySchema = () => {
        clipSchema = currentSchema.clone();
    };
    const pasteSchema = () => {
        var next = clipSchema.clone();
        var used = colorSchemes.map((s, i) => (i === indexSchema ? "" : s.schemaId));
        if (used.includes(next.schemaId)) {
            toastWarn(toastStore, `配色代碼「${next.schemaId}」已存在，已自動改名`);
            next.schemaId = nextIndexed(used, next.schemaId, "scheme");
        }
        colorSchemes[indexSchema] = next;
    };
    const selectSchema = (index: number) => {
        indexSchema = index;
    };
    const addSchema = () => {
        var next = currentSchema.clone();
        var used = colorSchemes.map((s) => s.schemaId);
        next.schemaId = nextIndexed(used, next.schemaId, "scheme");
        next.name = nextIndexed(
            colorSchemes.map((s) => s.name),
            next.name,
            "配色",
        );
        colorSchemes.push(next);
        colorSchemes = colorSchemes;
        indexSchema = colorSchemes.length - 1;
    };
    const delSchema = () => {
        if (colorSchemes.length <= 1) return;
        colorSchemes.splice(indexSchema, 1);
        colorSchemes = colorSchemes;
        if (indexSchema >= colorSchemes.length) indexSchema = colorSchemes.length - 1;
    };
</script>

<div class="flex items-center gap-2 px-2">
    {#each colorSchemes as schema, index (schema.id)}
        <div animate:flip={{ duration: 250 }} transition:scale={{ duration: 250 }} class="relative h-14 w-28 shrink-0">
            <ColorSwatch
                scheme={schema}
                {fallbackColors}
                label={schema.name || schema.schemaId}
                selected={index === indexSchema}
                on:click={() => selectSchema(index)}
            />
            {#if index === indexSchema}
                {#if colorSchemes.length > 1}
                    <IconButton
                        icon="mdi:trash-can-outline"
                        height={12}
                        on:click={delSchema}
                        class="variant-filled absolute left-0 top-0 h-5 w-5 rounded-full p-0 hover:variant-ghost active:scale-[90%]"
                    />
                {/if}
                <IconButton
                    icon="mdi:content-copy"
                    height={12}
                    on:click={copySchema}
                    class="variant-filled absolute right-5 top-0 h-5 w-5 rounded-full p-0 hover:variant-ghost active:scale-[90%]"
                />
                <IconButton
                    icon="mdi:content-paste"
                    height={12}
                    on:click={pasteSchema}
                    class="variant-filled absolute right-0 top-0 h-5 w-5 rounded-full p-0 hover:variant-ghost active:scale-[90%]"
                />
            {/if}
        </div>
    {/each}
    <button
        type="button"
        on:click={addSchema}
        class="variant-ghost flex h-14 w-28 shrink-0 items-center justify-center rounded-md p-0"
    >
        <Icon height="24" icon="mdi:plus" />
    </button>
</div>
