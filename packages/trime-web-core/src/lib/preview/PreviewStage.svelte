<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import type { ColorScheme } from "../model/colorScheme";
    import type { Keyboard } from "../model/keyboard";
    import type { Style } from "../model/style";
    import type { PresetKey } from "../model/presetKey";
    import { wrapKeys } from "../utils/layout";
    import { resolvedRgba } from "../utils/color";
    import { snap } from "../utils/snap";
    import KeyPreview from "./KeyPreview.svelte";
    import { iconifyFromTrimeStyle, type ToolBarButton } from "../model/toolBar";

    export var landscape: boolean = false;
    export var scheme: ColorScheme;
    export var keyboard: Keyboard;
    export var style: Style;
    export var fallbackColors: { [id: string]: string } = {};
    export var presetKeys: PresetKey[] = [];
    export var selected: { row: number; col: number };
    export var revision: number = 0;
    /** Logical Trime width used as scale baseline (phone frames also use 360). */
    export var designWidth: number = 360;
    export var rounded: boolean = true;
    /** Hide per-key long-click symbols in the preview (host-controlled). */
    export var hideSymbols: boolean = false;
    /** Preview-only ascii_mode face toggle (host-controlled). */
    export var asciiMode: boolean = false;
    /** When false, hide the editor selection finger on keys. */
    export var showSelectedMark: boolean = true;

    var previewWidth: number = 0;

    $: scale = previewWidth > 80 ? previewWidth / designWidth : 1;
    $: keyW = keyboard.width > 0 ? keyboard.width : style.key_width || 10;
    $: rows = snap(revision, wrapKeys(keyboard.keys, keyboard.columns, keyW));
    $: keyH = keyboard.height > 0 ? keyboard.height : style.key_height || 44;
    $: portH = keyboard.keyboard_height || style.keyboard_height || 0;
    $: landH = keyboard.keyboard_height_land || style.keyboard_height_land || 200;
    $: baseH = landscape
        ? landH / Math.max(rows.length, 1)
        : portH > 0
          ? portH / Math.max(rows.length, 1)
          : keyH;
    $: rowHeight = Math.max(28, Math.round(baseH * scale));
    $: hGap = (keyboard.horizontal_gap || style.horizontal_gap || 1) * scale;
    $: vGap = (keyboard.vertical_gap || style.vertical_gap || 1) * scale;
    // Trime KeyView keeps gaps as *inner* padding; do not add extra row margins.
    $: kbPadX =
        (landscape ? style.keyboard_padding_land || style.keyboard_padding : style.keyboard_padding) * scale;
    $: kbPadBottom =
        (landscape ? style.keyboard_padding_land_bottom || style.keyboard_padding_bottom : style.keyboard_padding_bottom) *
        scale;
    $: corner = keyboard.round_corner >= 0 ? keyboard.round_corner : style.round_corner;
    $: commentPos = style.comment_position || "right";
    $: pe = style.preedit;
    $: toolBar = style.toolBar;
    $: candH = (style.candidate_view_height || 28) * scale;
    $: padX = (style.candidate_padding || 5) * scale;
    $: candGap = (style.candidate_spacing || 0) * scale;
    $: candSize = (style.candidate_text_size || 22) * scale;
    $: labelSize = (style.label_text_size || 22) * scale;
    $: commentSize = (style.comment_text_size || 10) * scale;
    $: commentH = commentPos === "top" ? (style.comment_height || 12) * scale : 0;

    $: rootBg = snap(revision, resolvedRgba(scheme, "root_background", fallbackColors));
    $: candBg = snap(revision, resolvedRgba(scheme, "candidate_background", fallbackColors));
    $: kbBg = snap(revision, resolvedRgba(scheme, "keyboard_back_color", fallbackColors));
    $: textColor = snap(revision, resolvedRgba(scheme, "text_color", fallbackColors));
    $: textBack = snap(revision, resolvedRgba(scheme, "text_back_color", fallbackColors));
    $: hiliteText = snap(revision, resolvedRgba(scheme, "hilited_candidate_text_color", fallbackColors));
    $: hiliteBack = snap(revision, resolvedRgba(scheme, "hilited_candidate_back_color", fallbackColors));
    $: hiliteLabel = snap(revision, resolvedRgba(scheme, "hilited_label_color", fallbackColors));
    $: hiliteComment = snap(revision, resolvedRgba(scheme, "hilited_comment_text_color", fallbackColors));
    $: candText = snap(revision, resolvedRgba(scheme, "candidate_text_color", fallbackColors));
    $: commentText = snap(revision, resolvedRgba(scheme, "comment_text_color", fallbackColors));
    $: labelColor = snap(revision, resolvedRgba(scheme, "label_color", fallbackColors));

    const cands = [
        { label: "1", text: "同文", comment: "tyfw" },
        { label: "2", text: "输入", comment: "shur" },
        { label: "3", text: "主題", comment: "zt" },
    ];

    const dispatch = createEventDispatcher();
    const faceOf = (button: ToolBarButton): { icon: string; text: string } => {
        var raw = button.foreground.style || button.foreground.option_styles[0] || "";
        var icon = iconifyFromTrimeStyle(raw);
        return { icon, text: icon ? "" : raw || button.action };
    };
</script>

<div
    bind:clientWidth={previewWidth}
    class="twr-root"
    class:twr-rounded={rounded}
    style:background-color={rootBg || candBg}
>
    <div
        class="twr-preedit"
        style:background-color={textBack}
        style:height={`${Math.max(pe.font_size, 16) * scale}px`}
        style:padding-left={`${pe.horizontal_padding * scale}px`}
        style:padding-right={`${pe.horizontal_padding * scale}px`}
        style:opacity={pe.alpha}
    >
        <span style:color={textColor} style:font-size={`${pe.font_size * scale}px`} class="twr-leading-none">tyfw</span>
    </div>
    <div
        class="twr-candidates"
        style:background-color={candBg}
        style:height={`${candH + commentH}px`}
        style:gap={`${candGap}px`}
    >
        {#if toolBar.primary_button}
            {@const face = faceOf(toolBar.primary_button)}
            <span
                class="twr-toolbar-btn"
                style:background-color={resolvedRgba(scheme, toolBar.primary_button.background.normal, fallbackColors) ||
                    undefined}
                style:color={resolvedRgba(scheme, toolBar.primary_button.foreground.normal, fallbackColors) ||
                    commentText}
                style:border-radius={toolBar.primary_button.background.type === "circle"
                    ? "999px"
                    : `${toolBar.primary_button.background.corner_radius * scale}px`}
                style:font-size={`${toolBar.primary_button.foreground.font_size * scale}px`}
                style:padding={`${toolBar.primary_button.foreground.padding * scale}px`}
                style:width={toolBar.primary_button.size[0]
                    ? `${toolBar.primary_button.size[0] * scale}px`
                    : undefined}
                style:height={toolBar.primary_button.size[1]
                    ? `${toolBar.primary_button.size[1] * scale}px`
                    : undefined}
            >
                {#if face.icon}
                    <Icon height="1em" icon={face.icon} />
                {:else}
                    {face.text}
                {/if}
            </span>
        {/if}
        {#each cands as cand, index}
            <span
                class="twr-cand"
                class:twr-cand-col={commentPos === "top"}
                class:twr-cand-rel={commentPos === "overlay"}
                style:color={index === 0 ? hiliteText : candText}
                style:background-color={index === 0 ? hiliteBack : undefined}
                style:padding-left={`${padX}px`}
                style:padding-right={`${padX}px`}
                style:font-size={`${candSize}px`}
            >
                {#if commentPos === "top"}
                    <span
                        class="twr-leading-none"
                        style:color={index === 0 ? hiliteComment : commentText}
                        style:font-size={`${commentSize}px`}
                        style:height={`${commentH}px`}
                    >
                        {cand.comment}
                    </span>
                {/if}
                <span class="twr-cand-main">
                    <span style:color={index === 0 ? hiliteLabel : labelColor} style:font-size={`${labelSize}px`}>
                        {cand.label}.
                    </span>
                    {cand.text}
                    {#if commentPos === "right"}
                        <span
                            class="twr-comment-right"
                            style:color={index === 0 ? hiliteComment : commentText}
                            style:font-size={`${commentSize}px`}
                        >
                            {cand.comment}
                        </span>
                    {/if}
                    {#if commentPos === "overlay"}
                        <span
                            class="twr-comment-overlay"
                            style:color={index === 0 ? hiliteComment : commentText}
                            style:font-size={`${commentSize}px`}
                        >
                            {cand.comment}
                        </span>
                    {/if}
                </span>
            </span>
        {/each}
        <span class="twr-grow"></span>
        {#each toolBar.buttons as button}
            {@const face = faceOf(button)}
            <span
                class="twr-toolbar-btn"
                style:background-color={resolvedRgba(scheme, button.background.normal, fallbackColors) || undefined}
                style:color={resolvedRgba(scheme, button.foreground.normal, fallbackColors) || commentText}
                style:border-radius={button.background.type === "circle"
                    ? "999px"
                    : `${button.background.corner_radius * scale}px`}
                style:font-size={`${button.foreground.font_size * scale}px`}
                style:padding={`${button.foreground.padding * scale}px`}
                style:width={button.size[0] ? `${button.size[0] * scale}px` : undefined}
                style:height={button.size[1] ? `${button.size[1] * scale}px` : undefined}
            >
                {#if face.icon}
                    <Icon height="1em" icon={face.icon} />
                {:else}
                    {face.text}
                {/if}
            </span>
        {/each}
        {#if !toolBar.buttons.length}
            <span class="twr-chevron" style:color={commentText}>
                <Icon height={`${14 * scale}px`} icon="mdi:chevron-down" />
            </span>
        {/if}
    </div>
    <div
        style:background-color={kbBg}
        style:padding={`0 ${kbPadX}px ${kbPadBottom}px`}
    >
        {#each rows as row, indexRow}
            <div style:height={`${rowHeight}px`} class="twr-row">
                {#each row as key, indexKey (key.id)}
                    <KeyPreview
                        {landscape}
                        {scheme}
                        {keyboard}
                        {style}
                        {fallbackColors}
                        {presetKeys}
                        {revision}
                        {scale}
                        {hideSymbols}
                        {asciiMode}
                        {key}
                        {row}
                        selected={selected.row === indexRow && selected.col === indexKey}
                        {showSelectedMark}
                        coordinate={selected}
                        {previewWidth}
                        {hGap}
                        {vGap}
                        {corner}
                        {rowHeight}
                        on:clicked={() => dispatch("clicked", { row: indexRow, col: indexKey })}
                    />
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    /*
     * Approximate Trime FontManager fallback (Typeface.DEFAULT / sans-serif):
     * Latin → Roboto, CJK → Noto Sans TC/SC. Host app should load these faces
     * (trime-web-tool loads them from Google Fonts in app.html).
     */
    .twr-root {
        width: 100%;
        overflow: hidden;
        font-family: Roboto, "Noto Sans TC", "Noto Sans SC", "Noto Sans CJK TC", "Noto Sans CJK SC",
            "Source Han Sans TC", "Source Han Sans SC", sans-serif;
    }
    .twr-rounded {
        border-radius: 0.375rem;
    }
    .twr-preedit {
        display: flex;
        width: 100%;
        align-items: center;
    }
    .twr-candidates {
        display: flex;
        width: 100%;
        align-items: stretch;
        overflow: hidden;
    }
    .twr-toolbar-btn {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        align-self: center;
    }
    .twr-cand {
        display: flex;
        height: 100%;
        flex-shrink: 0;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        line-height: 1;
    }
    .twr-cand-col {
        flex-direction: column;
    }
    .twr-cand-rel {
        position: relative;
    }
    .twr-cand-main {
        display: flex;
        align-items: baseline;
        line-height: 1;
    }
    .twr-comment-right {
        margin-left: 0.125rem;
        line-height: 1;
    }
    .twr-comment-overlay {
        position: absolute;
        right: 0;
        top: 0;
        line-height: 1;
    }
    .twr-grow {
        flex-grow: 1;
    }
    .twr-chevron {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
    }
    .twr-row {
        display: flex;
        width: 100%;
    }
    .twr-leading-none {
        line-height: 1;
    }
</style>
