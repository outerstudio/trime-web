<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { ColorScheme } from "./model/colorScheme";
    import type { Keyboard } from "./model/keyboard";
    import type { Style } from "./model/style";
    import type { Key } from "./model/key";
    import type { PresetKey } from "./model/presetKey";
    import { resolvedRgba } from "./utils/color";
    import { trimeKeyLabel, isFunctionalClick, symbolLabel, keyFaceSize } from "./utils/labels";
    import { snap, hideKeySymbols } from "./utils/revision";

    export var landscape: boolean = false;
    export var scheme: ColorScheme;
    export var keyboard: Keyboard;
    export var style: Style;
    export var fallbackColors: { [id: string]: string } = {};
    export var presetKeys: PresetKey[] = [];
    export var key: Key;
    export var row: Key[];
    export var selected: boolean;
    export var coordinate: { row: number; col: number };
    export var previewWidth: number = 0;
    export var hGap: number = 1;
    export var corner: number = 8;
    export var rowHeight: number = 44;
    export var revision: number = 0;
    export var scale: number = 1;
    export var spaceLabel: string = "明月拼音";

    const [holdNone, holdBubble] = [0, 1];
    var holdState = holdNone;
    $: if (!selected) holdState = holdNone;

    $: dw = keyboard.width > 0 ? keyboard.width : style.key_width || 10;
    $: width = key.width > 0 ? key.width : dw;
    // Trime 3.3.11 reads functional from preset_keys, not from an individual
    // preset_keyboards/.../keys item.
    $: functional = isFunctionalClick(key.click, undefined, presetKeys);
    $: enterLabel = style.enter_labels && style.enter_labels.default ? style.enter_labels.default : "Enter";
    $: labelCtx = { asciiMode: keyboard.ascii_mode === 1, activeIsClick: true };
    $: label = snap(
        revision,
        trimeKeyLabel(key, presetKeys, enterLabel, spaceLabel, labelCtx, keyboard.label_transform),
    );
    $: symbol = snap(revision, symbolLabel(key.long_click, key.label_symbol, presetKeys, enterLabel));
    $: showSymbol = !!(symbol && !$hideKeySymbols);
    $: hint = snap(revision, key.hint || "");
    $: fontSize =
        keyFaceSize(
            label,
            key.key_text_size,
            style.key_text_size,
            style.key_long_text_size,
        ) * scale;
    $: symbolSize = (key.symbol_text_size || style.symbol_text_size || 10) * scale;
    $: keyCorner = corner * scale;

    $: bgId = functional ? "off_key_back_color" : "key_back_color";
    $: fgId = functional ? "off_key_text_color" : "key_text_color";
    $: pressBgId = functional ? "hilited_off_key_back_color" : "hilited_key_back_color";
    $: pressFgId = functional ? "hilited_off_key_text_color" : "hilited_key_text_color";
    $: keyBg = snap(revision, (key.colors[bgId] && key.colors[bgId].rgba()) || resolvedRgba(scheme, bgId, fallbackColors));
    $: keyFg = snap(revision, (key.colors[fgId] && key.colors[fgId].rgba()) || resolvedRgba(scheme, fgId, fallbackColors));
    $: pressBg = snap(
        revision,
        (key.colors[pressBgId] && key.colors[pressBgId].rgba()) || resolvedRgba(scheme, pressBgId, fallbackColors),
    );
    $: pressFg = snap(
        revision,
        (key.colors[pressFgId] && key.colors[pressFgId].rgba()) || resolvedRgba(scheme, pressFgId, fallbackColors),
    );
    $: symbolColor = snap(
        revision,
        resolvedRgba(scheme, selected ? "hilited_key_symbol_color" : "key_symbol_color", fallbackColors),
    );
    $: previewBg = snap(revision, resolvedRgba(scheme, "preview_back_color", fallbackColors));
    $: previewFg = snap(revision, resolvedRgba(scheme, "preview_text_color", fallbackColors));
    $: shadow = snap(revision, resolvedRgba(scheme, "shadow_color", fallbackColors));
    $: shadowR = style.shadow_radius || 0;
    $: void landscape;
    $: void previewWidth;
    $: symbolOx = (key.key_symbol_offset_x || keyboard.key_symbol_offset_x) * scale;
    $: symbolOy = (key.key_symbol_offset_y || keyboard.key_symbol_offset_y) * scale;
    $: textOx = (key.key_text_offset_x || keyboard.key_text_offset_x) * scale;
    $: textOy = (key.key_text_offset_y || keyboard.key_text_offset_y) * scale;
    $: hintOx = (key.key_hint_offset_x || keyboard.key_hint_offset_x) * scale;
    $: hintOy = (key.key_hint_offset_y || keyboard.key_hint_offset_y) * scale;
    $: spacer = !key.click && !key.label && !key.clickEmpty && key.width > 0 && !key.long_click;

    const dispatch = createEventDispatcher();
    const onClick = () => {
        if (selected) {
            holdState = holdState === holdBubble ? holdNone : holdBubble;
        } else {
            dispatch("clicked");
        }
    };
</script>

<div style:width={`${width}%`} style:height={`${rowHeight}px`} style:padding={`0 ${hGap / 2}px`} class="shrink-0">
    <div class="relative h-full w-full">
        {#if holdState === holdBubble && !spacer}
            <div
                class="absolute -top-11 flex h-10 min-w-10 items-center justify-center rounded-md px-2"
                class:left-0={coordinate.col < row.length / 2}
                class:right-0={coordinate.col >= row.length / 2}
                style:background-color={previewBg}
                style:transform={`translateY(${style.popup_bottom_margin || 0}px)`}
            >
                <div class="px-2" style:color={previewFg} style:font-size={`${style.popup_text_size || 20}px`}>
                    {key.preview || label}
                </div>
            </div>
        {/if}
        {#if !spacer}
            <button
                style:background-color={selected ? pressBg : keyBg}
                style:border-radius={`${keyCorner}px`}
                style:box-shadow={shadowR ? `0 ${shadowR}px ${shadowR}px ${shadow}` : undefined}
                class="absolute h-full w-full overflow-hidden"
                on:click={onClick}
            >
                {#if showSymbol}
                    <div
                        class="absolute top-0 flex w-full justify-center overflow-hidden px-0.5"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:line-height="1"
                        style:padding-top={`${Math.max(1, scale)}px`}
                        style:transform={`translate(${symbolOx}px, ${symbolOy}px)`}
                    >
                        <span class="max-w-full truncate">{symbol}</span>
                    </div>
                {/if}
                <div
                    class="absolute top-0 flex h-full w-full items-center justify-center overflow-hidden px-0.5"
                    style:color={selected ? pressFg : keyFg}
                    style:font-size={`${fontSize}px`}
                    style:line-height="1"
                    style:padding-top={showSymbol ? `${symbolSize * 0.45}px` : "0"}
                    style:transform={`translate(${textOx}px, ${textOy}px)`}
                >
                    <span class="max-w-full truncate">{label}</span>
                </div>
                {#if hint}
                    <div
                        class="absolute bottom-0 flex w-full justify-center overflow-hidden px-0.5"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:line-height="1"
                        style:transform={`translate(${hintOx}px, ${hintOy}px)`}
                    >
                        <span class="max-w-full truncate">{hint}</span>
                    </div>
                {/if}
            </button>
        {/if}
    </div>
</div>
