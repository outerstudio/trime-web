<script lang="ts">
    import { scale } from "svelte/transition";
    import { flip } from "svelte/animate";
    import Icon from "@iconify/svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import { Keyboard } from "trime-web-renderer";
    import Thumbnail from "./Thumbnail.svelte";
    import { resolvedRgba } from "trime-web-renderer";
    import { bumpPreview, previewRevision, snap } from "./utils/revision";
    import { builtinDefaultColorScheme } from "trime-web-renderer";
    import { nextIndexed } from "./utils/common";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { toastWarn } from "$lib/utils/error";

    export var keyboards: Keyboard[];
    export var indexKeyboard: number;
    export var currentKeyboard: Keyboard;
    export var defaultWidth: number = 10;
    var layoutChrome = builtinDefaultColorScheme();
    const toastStore = getToastStore();

    var clip = new Keyboard();
    const copyLayout = () => {
        clip = currentKeyboard.clone();
    };
    const pasteLayout = () => {
        var next = clip.clone();
        var used = keyboards.map((k, i) => (i === indexKeyboard ? "" : k.schemaId));
        if (next.schemaId && used.includes(next.schemaId)) {
            toastWarn(toastStore, `鍵盤代碼「${next.schemaId}」已存在，已自動改名`);
            next.schemaId = nextIndexed(used, next.schemaId, "keyboard");
        }
        keyboards[indexKeyboard] = next;
    };
    const selectLayout = (index: number) => {
        indexKeyboard = index;
    };
    const addLayout = () => {
        var kb = currentKeyboard ? currentKeyboard.clone() : new Keyboard();
        kb.name = nextIndexed(
            keyboards.map((k) => k.name),
            kb.name,
            "鍵盤",
        );
        kb.schemaId = nextIndexed(
            keyboards.map((k) => k.schemaId),
            kb.schemaId,
            "keyboard",
        );
        keyboards.push(kb);
        keyboards = keyboards;
        indexKeyboard = keyboards.length - 1;
        bumpPreview();
    };
    const delLayout = () => {
        if (keyboards.length <= 1) return;
        keyboards.splice(indexKeyboard, 1);
        keyboards = keyboards;
        if (indexKeyboard >= keyboards.length) indexKeyboard = keyboards.length - 1;
    };

    var dragFrom = -1;
    var dragOver = -1;
    var suppressClick = false;

    const onDragStart = (event: DragEvent, index: number) => {
        dragFrom = index;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
        }
    };
    const onDragOver = (event: DragEvent, index: number) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        dragOver = index;
    };
    const onDrop = (event: DragEvent, to: number) => {
        event.preventDefault();
        var from = dragFrom;
        dragFrom = -1;
        dragOver = -1;
        if (from < 0 || from === to) return;
        var selectedId = currentKeyboard && currentKeyboard.id;
        var next = keyboards.slice();
        var moved = next.splice(from, 1)[0];
        next.splice(to, 0, moved);
        keyboards = next;
        if (selectedId !== undefined) {
            var i = next.findIndex((k) => k.id === selectedId);
            if (i >= 0) indexKeyboard = i;
        }
        suppressClick = true;
        bumpPreview();
    };
    const onDragEnd = () => {
        dragFrom = -1;
        dragOver = -1;
    };
    const onSelect = (index: number) => {
        if (suppressClick) {
            suppressClick = false;
            return;
        }
        selectLayout(index);
    };
</script>

<div class="flex items-center gap-2 px-2">
        {#each keyboards as layout, index (layout.id)}
            <div
                role="listitem"
                animate:flip={{ duration: 250 }}
                transition:scale={{ duration: 250 }}
                class="relative h-20 w-32 shrink-0"
                class:opacity-40={index !== indexKeyboard && dragFrom !== index}
                class:opacity-50={dragFrom === index}
                class:ring-2={dragOver === index && dragFrom !== index}
                draggable="true"
                on:dragstart={(e) => onDragStart(e, index)}
                on:dragover={(e) => onDragOver(e, index)}
                on:drop={(e) => onDrop(e, index)}
                on:dragend={onDragEnd}
            >
                <button
                    type="button"
                    on:click={() => onSelect(index)}
                    style:background-color={resolvedRgba(layoutChrome, "back_color")}
                    style:border-color={resolvedRgba(layoutChrome, "border_color")}
                    class:border-2={index === indexKeyboard}
                    class:border-dashed={index === indexKeyboard}
                    class="flex h-full w-full cursor-grab flex-col rounded-md border p-2 active:cursor-grabbing active:scale-95"
                >
                    <Thumbnail keyboard={layout} scheme={layoutChrome} defaultWidth={layout.width || defaultWidth} />
                </button>
            <span
                style:color={resolvedRgba(layoutChrome, "hilited_candidate_text_color")}
                style:background-color={resolvedRgba(layoutChrome, "hilited_candidate_back_color")}
                class="absolute bottom-0.5 right-0.5 rounded-md border p-0.5 text-xs"
            >
                {snap($previewRevision, layout.name)}
            </span>
            {#if index === indexKeyboard}
                {#if keyboards.length > 1}
                    <IconButton
                        icon="mdi:trash-can-outline"
                        on:click={delLayout}
                        class="variant-filled absolute left-0 top-0 rounded-full p-1 hover:variant-ghost active:scale-[90%]"
                    />
                {/if}
                <IconButton
                    icon="mdi:content-copy"
                    on:click={copyLayout}
                    class="variant-filled absolute right-6 top-0 rounded-full p-1 hover:variant-ghost active:scale-[90%]"
                />
                <IconButton
                    icon="mdi:content-paste"
                    on:click={pasteLayout}
                    class="variant-filled absolute right-0 top-0 rounded-full p-1 hover:variant-ghost active:scale-[90%]"
                />
            {/if}
        </div>
    {/each}
    <button
        on:click={addLayout}
        type="button"
        class="variant-ghost flex h-20 w-32 shrink-0 items-center justify-center rounded-md p-0"
    >
        <Icon height="32" icon="mdi:plus" />
    </button>
</div>
