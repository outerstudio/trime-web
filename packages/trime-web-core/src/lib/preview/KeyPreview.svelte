<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import type { ColorScheme } from "../model/colorScheme";
    import type { Keyboard } from "../model/keyboard";
    import type { Style } from "../model/style";
    import type { Key } from "../model/key";
    import type { PresetKey } from "../model/presetKey";
    import { resolvedRgba } from "../utils/color";
    import { trimeKeyLabel, isFunctionalClick, symbolLabel, keyFaceSize, activeTrigger } from "../utils/labels";
    import { snap } from "../utils/snap";

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
    export var hideSymbols: boolean = false;
    /** Preview-only ascii_mode face toggle (host-controlled). */
    export var asciiMode: boolean = false;

    const [holdNone, holdBubble] = [0, 1];
    var holdState = holdNone;
    $: if (!selected) holdState = holdNone;

    $: dw = keyboard.width > 0 ? keyboard.width : style.key_width || 10;
    $: width = key.width > 0 ? key.width : dw;
    // Trime 3.3.11 reads functional from preset_keys, not from an individual
    // preset_keyboards/.../keys item.
    $: functional = isFunctionalClick(
        activeTrigger(key, { asciiMode }),
        undefined,
        presetKeys,
    );
    $: enterLabel = style.enter_labels && style.enter_labels.default ? style.enter_labels.default : "Enter";
    $: labelCtx = { asciiMode, activeIsClick: true };
    $: label = snap(
        revision,
        trimeKeyLabel(key, presetKeys, enterLabel, spaceLabel, labelCtx, keyboard.label_transform),
    );
    $: void asciiMode;
    $: symbol = snap(revision, symbolLabel(key.long_click, key.label_symbol, presetKeys, enterLabel));
    $: showSymbol = !!(symbol && !hideSymbols);
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
    $: keyBg = snap(revision, (key.colors[bgId] && key.colors[bgId].rgba()) || resolvedRgba(scheme, bgId, fallbackColors));
    $: keyFg = snap(revision, (key.colors[fgId] && key.colors[fgId].rgba()) || resolvedRgba(scheme, fgId, fallbackColors));
    $: symbolColor = snap(revision, resolvedRgba(scheme, "key_symbol_color", fallbackColors));
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

<div class="twr-key-slot" style:width={`${width}%`} style:height={`${rowHeight}px`} style:padding={`0 ${hGap / 2}px`}>
    <div class="twr-key-frame">
        {#if holdState === holdBubble && !spacer}
            <div
                class="twr-popup"
                class:twr-popup-left={coordinate.col < row.length / 2}
                class:twr-popup-right={coordinate.col >= row.length / 2}
                style:background-color={previewBg}
                style:transform={`translateY(${style.popup_bottom_margin || 0}px)`}
            >
                <div class="twr-popup-text" style:color={previewFg} style:font-size={`${style.popup_text_size || 20}px`}>
                    {key.preview || label}
                </div>
            </div>
        {/if}
        {#if !spacer}
            <button
                type="button"
                class="twr-key-btn"
                style:background-color={keyBg}
                style:border-radius={`${keyCorner}px`}
                style:box-shadow={shadowR ? `0 ${shadowR}px ${shadowR}px ${shadow}` : undefined}
                on:click={onClick}
            >
                {#if showSymbol}
                    <div
                        class="twr-symbol"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:padding-top={`${Math.max(1, scale)}px`}
                        style:transform={`translate(${symbolOx}px, ${symbolOy}px)`}
                    >
                        <span class="twr-truncate">{symbol}</span>
                    </div>
                {/if}
                <div
                    class="twr-label"
                    style:color={keyFg}
                    style:font-size={`${fontSize}px`}
                    style:padding-top={showSymbol ? `${symbolSize * 0.45}px` : "0"}
                    style:transform={`translate(${textOx}px, ${textOy}px)`}
                >
                    <span class="twr-truncate">{label}</span>
                </div>
                {#if hint}
                    <div
                        class="twr-hint"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:transform={`translate(${hintOx}px, ${hintOy}px)`}
                    >
                        <span class="twr-truncate">{hint}</span>
                    </div>
                {/if}
            </button>
            {#if selected}
                <span
                    class="pointer-events-none absolute -right-0.5 -top-0.5 z-10 text-primary-500 drop-shadow-sm"
                    aria-hidden="true"
                >
                    <Icon icon="mdi:hand-pointing-down" width="16" height="16" class="rotate-45" />
                </span>
            {/if}
        {/if}
    </div>
</div>

<style>
    .twr-key-slot {
        flex-shrink: 0;
        box-sizing: border-box;
    }
    .twr-key-frame {
        position: relative;
        height: 100%;
        width: 100%;
    }
    .twr-popup {
        position: absolute;
        top: -2.75rem;
        display: flex;
        height: 2.5rem;
        min-width: 2.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 0.375rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        z-index: 2;
    }
    .twr-popup-left {
        left: 0;
    }
    .twr-popup-right {
        right: 0;
    }
    .twr-popup-text {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    .twr-key-btn {
        position: absolute;
        height: 100%;
        width: 100%;
        overflow: hidden;
        border: 0;
        padding: 0;
        cursor: pointer;
    }
    .twr-symbol {
        position: absolute;
        top: 0;
        display: flex;
        width: 100%;
        justify-content: center;
        overflow: hidden;
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        line-height: 1;
        box-sizing: border-box;
    }
    .twr-label {
        position: absolute;
        top: 0;
        display: flex;
        height: 100%;
        width: 100%;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        line-height: 1;
        box-sizing: border-box;
    }
    .twr-hint {
        position: absolute;
        bottom: 0;
        display: flex;
        width: 100%;
        justify-content: center;
        overflow: hidden;
        padding-left: 0.125rem;
        padding-right: 0.125rem;
        line-height: 1;
        box-sizing: border-box;
    }
    .twr-truncate {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
