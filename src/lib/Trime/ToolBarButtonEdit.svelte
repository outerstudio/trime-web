<script lang="ts">
    import type { ToolBarButton } from "trime-web-core";

    export var button: ToolBarButton;

    var optionText = "";
    var sizeText = "";
    $: optionText = button.foreground.option_styles.join(", ");
    $: sizeText = (button.size.length ? button.size : button.foreground.size).join(", ");

    const applyOptions = () => {
        button.foreground.option_styles = optionText
            .split(/[,，]/)
            .map((s) => s.trim())
            .filter(Boolean);
    };
    const applySize = () => {
        button.size = sizeText
            .split(/[,，\s]+/)
            .map((s) => Number(s.trim()))
            .filter((n) => !Number.isNaN(n));
    };
</script>

<div class="flex flex-col gap-1 p-2">
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">action</span>
        <input bind:value={button.action} placeholder="preset_keys id" class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">long_press</span>
        <input
            bind:value={button.long_press_action}
            class="variant-ringed h-8 grow rounded-md px-2 font-mono"
        />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">style</span>
        <input
            bind:value={button.foreground.style}
            placeholder="ic@arrow_left 或 圖片/文字"
            class="variant-ringed h-8 grow rounded-md px-2 font-mono"
        />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">option_styles</span>
        <input
            bind:value={optionText}
            on:change={applyOptions}
            placeholder="中, En"
            class="variant-ringed h-8 grow rounded-md px-2 font-mono"
        />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">size w,h</span>
        <input bind:value={sizeText} on:change={applySize} placeholder="40, 40" class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">font_size</span>
        <input type="number" bind:value={button.foreground.font_size} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">padding</span>
        <input type="number" bind:value={button.foreground.padding} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">fg_normal</span>
        <input bind:value={button.foreground.normal} placeholder="配色 id" class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">fg_highlight</span>
        <input bind:value={button.foreground.highlight} class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">bg type</span>
        <select bind:value={button.background.type} class="variant-ringed h-8 rounded-md px-2">
            <option value="rectangle">方形</option>
            <option value="circle">圓形</option>
        </select>
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">corner_radius</span>
        <input type="number" bind:value={button.background.corner_radius} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">bg_normal</span>
        <input bind:value={button.background.normal} placeholder="配色 id" class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">bg_highlight</span>
        <input bind:value={button.background.highlight} class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">v_inset</span>
        <input type="number" bind:value={button.background.vertical_inset} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
    <div class="flex items-center gap-2">
        <span class="w-28 font-mono text-xs">h_inset</span>
        <input type="number" bind:value={button.background.horizontal_inset} class="variant-ringed h-8 w-24 rounded-md px-2" />
    </div>
</div>
