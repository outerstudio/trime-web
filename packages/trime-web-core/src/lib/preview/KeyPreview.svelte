<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import type { ColorScheme } from "../model/colorScheme";
    import type { Keyboard } from "../model/keyboard";
    import type { Style } from "../model/style";
    import type { Key } from "../model/key";
    import type { PresetKey } from "../model/presetKey";
    import { resolvedRgba, keyFaceColors } from "../utils/color";
    import { trimeKeyLabel, isFunctionalClick, symbolLabel, keyFaceSize, activeTrigger } from "../utils/labels";
    import { iconifyFromTrimeStyle } from "../model/toolBar";
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
    /** When false, hide the editor selection finger (e.g. phone-frame preview). */
    export var showSelectedMark: boolean = true;
    export var coordinate: { row: number; col: number };
    export var previewWidth: number = 0;
    export var hGap: number = 1;
    /** Scaled vertical_gap; Trime KeyView uses verticalGap/2 as top/bottom padding. */
    export var vGap: number = 1;
    export var corner: number = 8;
    export var rowHeight: number = 44;
    export var revision: number = 0;
    export var scale: number = 1;
    export var spaceLabel: string = "明月拼音";
    export var hideSymbols: boolean = false;
    /** Preview-only ascii_mode face toggle (host-controlled). */
    export var asciiMode: boolean = false;
    /** Icon label sizing changed in v3.3.12; does not affect exported YAML. */
    export var trimeVersion: "3.3.11" | "3.3.12" = "3.3.11";

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
    $: labelIcon = iconifyFromTrimeStyle(label);
    $: void asciiMode;
    $: symbol = snap(revision, symbolLabel(key.long_click, key.label_symbol, presetKeys, enterLabel));
    $: symbolIcon = iconifyFromTrimeStyle(symbol);
    $: showSymbol = !!(symbol && !hideSymbols);
    $: hint = snap(revision, key.hint || "");
    $: hintIcon = iconifyFromTrimeStyle(hint);
    $: previewFace = key.preview || label;
    $: previewIcon = iconifyFromTrimeStyle(previewFace);
    $: fontSize =
        snap(
            revision,
            keyFaceSize(
                label,
                key.key_text_size,
                style.key_text_size,
                style.key_long_text_size,
                trimeVersion,
            ),
        ) *
        scale;
    // Trime KeyboardView: symbolTextSize > 0 else fall back to keyTextSize
    $: symbolSize =
        snap(revision, key.symbol_text_size || style.symbol_text_size || style.key_text_size || 10) * scale;
    // Trime KeyView: key.roundCorner ?: keyboard.roundCorner (keyboard already falls back to style).
    $: keyCorner = (key.round_corner >= 0 ? key.round_corner : corner) * scale;

    $: colorFingerprint = snap(
        revision,
        Object.keys(key.colors)
            .sort()
            .map((id) => `${id}:${key.colors[id]?.toYaml() || ""}`)
            .join("|"),
    );
    $: faceColors = keyFaceColors(key, functional, scheme, fallbackColors);
    $: void colorFingerprint;
    $: keyBg = faceColors.bg;
    $: keyFg = faceColors.fg;
    $: symbolColor = faceColors.symbol;
    $: previewBg = snap(revision, resolvedRgba(scheme, "preview_back_color", fallbackColors));
    $: previewFg = snap(revision, resolvedRgba(scheme, "preview_text_color", fallbackColors));
    $: shadow = snap(revision, resolvedRgba(scheme, "shadow_color", fallbackColors));
    $: shadowR = style.shadow_radius || 0;
    $: void landscape;
    $: void previewWidth;
    // Trime: firstNonZero(key, keyboard, style). Style offsets not modeled yet.
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

<div
    class="twr-key-slot"
    style:width={`${width}%`}
    style:height={`${rowHeight}px`}
    style:padding={`${vGap / 2}px ${hGap / 2}px`}
>
    <div class="twr-key-frame">
        {#if holdState === holdBubble && !spacer}
            <div
                class="twr-popup"
                class:twr-popup-left={coordinate.col < row.length / 2}
                class:twr-popup-right={coordinate.col >= row.length / 2}
                style:background-color={previewBg}
                style:transform={`translateY(${style.popup_bottom_margin || 0}px)`}
            >
                <div
                    class="twr-popup-text"
                    style:color={previewFg}
                    style:font-size={`${(style.popup_text_size || 20) * scale}px`}
                >
                    {#if previewIcon}
                        <Icon
                            icon={previewIcon}
                            width={(style.popup_text_size || 20) * scale}
                            height={(style.popup_text_size || 20) * scale}
                            style="color: currentColor"
                        />
                    {:else}
                        {previewFace}
                    {/if}
                </div>
            </div>
        {/if}
        {#if !spacer}
            <!-- Gray face = content box after KeyView-style gap padding (matches drawable bounds). -->
            <!-- Use div not button: Tailwind preflight forces button background transparent. -->
            <div
                role="button"
                tabindex="0"
                class="twr-key-btn"
                style:background-color={keyBg || "transparent"}
                style:color={keyFg || undefined}
                style:border-radius={`${keyCorner}px`}
                style:box-shadow={shadowR ? `0 ${shadowR}px ${shadowR}px ${shadow}` : undefined}
                on:click={onClick}
                on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick();
                    }
                }}
            >
                {#if showSymbol}
                    <div
                        class="twr-symbol"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:transform={`translate(${symbolOx}px, ${symbolOy}px)`}
                    >
                        {#if symbolIcon}
                            <Icon icon={symbolIcon} width={symbolSize} height={symbolSize} style="color: currentColor" />
                        {:else}
                            <span class="twr-truncate">{symbol}</span>
                        {/if}
                    </div>
                {/if}
                <div
                    class="twr-label"
                    style:color={keyFg}
                    style:font-size={`${fontSize}px`}
                    style:transform={`translate(${textOx}px, ${textOy}px)`}
                >
                    {#if labelIcon}
                        <Icon icon={labelIcon} width={fontSize} height={fontSize} style="color: currentColor" />
                    {:else}
                        <span class="twr-truncate">{label}</span>
                    {/if}
                </div>
                {#if hint}
                    <div
                        class="twr-hint"
                        style:color={symbolColor}
                        style:font-size={`${symbolSize}px`}
                        style:transform={`translate(${hintOx}px, ${hintOy}px)`}
                    >
                        {#if hintIcon}
                            <Icon icon={hintIcon} width={symbolSize} height={symbolSize} style="color: currentColor" />
                        {:else}
                            <span class="twr-truncate">{hint}</span>
                        {/if}
                    </div>
                {/if}
            </div>
            {#if selected && showSelectedMark}
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
        display: flex;
        align-items: center;
        justify-content: center;
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
        margin: 0;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
    }
    .twr-symbol {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: flex-start;
        overflow: hidden;
        padding: 0 0.125rem;
        line-height: 1;
        font-weight: 400;
        box-sizing: border-box;
    }
    .twr-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 0 0.125rem;
        line-height: 1;
        font-weight: 400;
        box-sizing: border-box;
    }
    .twr-hint {
        position: absolute;
        bottom: 0;
        left: 0;
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: flex-end;
        overflow: hidden;
        padding: 0 0.125rem;
        line-height: 1;
        font-weight: 400;
        box-sizing: border-box;
    }
    .twr-truncate {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
