<script lang="ts">
    import IconButton from "$lib/Component/IconButton.svelte";
    import Details from "$lib/Component/Details.svelte";
    import { ToolBar, ToolBarButton } from "./model/toolBar";
    import ToolBarButtonEdit from "./ToolBarButtonEdit.svelte";
    import { bumpPreview } from "./utils/revision";

    export var toolBar: ToolBar;

    var fontsText = "";
    $: fontsText = toolBar.button_font.join(", ");

    const applyFonts = () => {
        toolBar.button_font = fontsText
            .split(/[,，\s]+/)
            .map((s) => s.trim())
            .filter(Boolean);
        bumpPreview();
    };

    const ensurePrimary = () => {
        if (!toolBar.primary_button) toolBar.primary_button = new ToolBarButton();
        toolBar = toolBar;
        bumpPreview();
    };
    const clearPrimary = () => {
        toolBar.primary_button = null;
        toolBar = toolBar;
        bumpPreview();
    };
    const addButton = () => {
        toolBar.buttons = [...toolBar.buttons, new ToolBarButton()];
        bumpPreview();
    };
    const removeButton = (index: number) => {
        toolBar.buttons.splice(index, 1);
        toolBar.buttons = toolBar.buttons;
        bumpPreview();
    };
</script>

<div class="flex flex-col gap-2 p-2">
    <div class="flex items-center gap-2">
        <span class="shrink grow">按鈕間距</span>
        <input type="number" bind:value={toolBar.button_spacing} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28">按鈕字體</span>
        <input
            bind:value={fontsText}
            on:change={applyFonts}
            placeholder="symbol.ttf"
            class="variant-ringed h-8 grow rounded-md px-2 font-mono"
        />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28">背景樣式</span>
        <input bind:value={toolBar.back_style} class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>

    <div class="flex items-center gap-2">
        <span class="shrink grow">主按鈕</span>
        {#if toolBar.primary_button}
            <IconButton
                icon="mdi:close"
                on:click={clearPrimary}
                class="variant-ringed h-8 rounded-md px-2 hover:variant-ghost"
            >
                清除
            </IconButton>
        {:else}
            <IconButton
                icon="mdi:plus"
                on:click={ensurePrimary}
                class="variant-ringed h-8 rounded-md px-2 hover:variant-ghost"
            >
                添加
            </IconButton>
        {/if}
    </div>
    {#if toolBar.primary_button}
        <Details summary={`主按鍵 · ${toolBar.primary_button.displayFace()}`}>
            <ToolBarButtonEdit bind:button={toolBar.primary_button} />
        </Details>
    {/if}

    <div class="flex items-center gap-2">
        <span class="shrink grow">其他按鈕</span>
        <IconButton icon="mdi:plus" on:click={addButton} class="variant-ringed h-8 rounded-md px-2 hover:variant-ghost">
            添加
        </IconButton>
    </div>
    {#each toolBar.buttons as button, index}
        <Details summary={`#${index} · ${button.displayFace()}`}>
            <div class="flex justify-end p-1">
                <button type="button" class="text-xs opacity-70 hover:opacity-100" on:click={() => removeButton(index)}>
                    删除
                </button>
            </div>
            <ToolBarButtonEdit bind:button />
        </Details>
    {/each}
</div>
