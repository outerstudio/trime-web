<script lang="ts">
    import IconButton from "$lib/Component/IconButton.svelte";
    import { DEFAULT_FALLBACK_COLORS, colorKeys } from "trime-web-core";
    import { bumpPreview } from "./utils/revision";

    export var fallbackColors: { [id: string]: string };

    var newFrom = "";
    var newTo = "";
    $: entries = Object.entries(fallbackColors);

    const addEntry = () => {
        if (!newFrom.trim() || !newTo.trim()) return;
        fallbackColors[newFrom.trim()] = newTo.trim();
        fallbackColors = fallbackColors;
        bumpPreview();
        newFrom = "";
        newTo = "";
    };
    const removeEntry = (id: string) => {
        delete fallbackColors[id];
        fallbackColors = fallbackColors;
        bumpPreview();
    };
    const resetBuiltin = () => {
        fallbackColors = { ...DEFAULT_FALLBACK_COLORS };
        bumpPreview();
    };
</script>

<div class="flex flex-col gap-2 p-2">
    <p class="text-xs opacity-70">未寫明的顔色會沿此鏈查找。使用者條目覆蓋程式内置預設。</p>
    <div class="flex justify-end">
        <IconButton
            icon="mdi:restore"
            on:click={resetBuiltin}
            class="variant-ringed h-8 shrink-0 rounded-md px-2 text-sm hover:variant-ghost"
        >
            恢復内置鏈
        </IconButton>
    </div>
    {#each entries as [from]}
        <div class="flex h-8 items-center gap-1">
            <span class="variant-ringed code h-8 min-w-0 grow truncate rounded-md px-2 leading-8">{from}</span>
            <span class="shrink-0 opacity-70">→</span>
            <input
                bind:value={fallbackColors[from]}
                class="variant-ringed h-8 w-[40%] min-w-0 rounded-md px-2 font-mono"
            />
            <IconButton
                icon="mdi:close"
                on:click={() => removeEntry(from)}
                class="variant-ringed h-8 w-8 shrink-0 rounded-md hover:variant-ghost"
            />
        </div>
    {/each}
    <div class="flex h-8 items-center gap-1">
        <input
            list="fb-from"
            bind:value={newFrom}
            placeholder="顔色 id"
            class="variant-ringed h-8 w-[40%] min-w-0 rounded-md px-2 font-mono"
        />
        <span class="shrink-0 opacity-70">→</span>
        <input
            list="fb-to"
            bind:value={newTo}
            placeholder="後備指向"
            class="variant-ringed h-8 min-w-0 grow rounded-md px-2 font-mono"
        />
        <IconButton
            icon="mdi:plus"
            on:click={addEntry}
            class="variant-ringed h-8 shrink-0 rounded-md px-2 text-sm hover:variant-ghost"
        >
            添加
        </IconButton>
        <datalist id="fb-from">
            {#each colorKeys as meta}<option value={meta.id}>{meta.label}</option>{/each}
        </datalist>
        <datalist id="fb-to">
            {#each colorKeys as meta}<option value={meta.id}>{meta.label}</option>{/each}
        </datalist>
    </div>
</div>
