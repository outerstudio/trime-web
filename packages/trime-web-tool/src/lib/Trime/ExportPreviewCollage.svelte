<script lang="ts">
    import { tick } from "svelte";
    import { toPng } from "html-to-image";
    import { get } from "svelte/store";
    import { PreviewStage } from "trime-web-core/preview";
    import type { Theme } from "trime-web-core";
    import { exportBlob } from "./utils/common";
    import { getDateTimeString } from "./utils/format";
    import { persistHideKeySymbols } from "./utils/revision";

    export var theme: Theme;

    const CELL_W = 320;
    const GAP = 16;
    const PAD = 16;
    const NONE = { row: -1, col: -1 };
    const TOOL_URL = "https://trime-web.outerstudio.com/tool/";

    var root: HTMLElement | undefined;
    var busy = false;

    /** Keep capture node under body so overflow/transform ancestors cannot clip it. */
    const portalToBody = (node: HTMLElement) => {
        document.body.appendChild(node);
        return {
            destroy() {
                if (node.parentNode) node.parentNode.removeChild(node);
            },
        };
    };

    /** Render every color scheme × keyboard into one PNG (no selection finger). */
    export async function captureAndDownload(): Promise<void> {
        if (busy) return;
        if (!theme.colorSchemes.length || !theme.keyboards.length) {
            throw new Error("需要至少一份配色與一張鍵盤");
        }
        busy = true;
        try {
            await tick();
            await tick();
            if (document.fonts?.ready) await document.fonts.ready;
            // Let PreviewStage measure width and Iconify paint.
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            await new Promise((r) => setTimeout(r, 500));
            if (!root) throw new Error("預覽節點未就緒");

            var gridW = theme.keyboards.length * CELL_W + Math.max(0, theme.keyboards.length - 1) * GAP;
            var captureW = gridW + PAD * 2;

            // Clone must be in-viewport and opaque: off-screen left / opacity:0 clones render blank.
            var dataUrl = await toPng(root, {
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: "#f4f4f5",
                width: captureW,
                style: {
                    position: "fixed",
                    left: "0",
                    top: "0",
                    right: "auto",
                    bottom: "auto",
                    opacity: "1",
                    transform: "none",
                    zIndex: "2147483647",
                    pointerEvents: "none",
                },
            });
            exportBlob(
                dataUrl,
                `${theme.name || "theme"}-preview-${getDateTimeString()}.png`,
            );
        } finally {
            busy = false;
        }
    }

    $: gridWidthPx =
        theme.keyboards.length * CELL_W + Math.max(0, theme.keyboards.length - 1) * GAP;
</script>

<!-- Portaled to body while capturing; opacity 0 on live node, restored in toPng style. -->
{#if busy}
    <div
        use:portalToBody
        bind:this={root}
        style:position="fixed"
        style:left="0"
        style:top="0"
        style:opacity="0"
        style:z-index="2147483646"
        style:pointer-events="none"
        style:background-color="#f4f4f5"
        style:color="#18181b"
        style:font-family="system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        style:padding={`${PAD}px`}
        style:width={`${gridWidthPx + PAD * 2}px`}
        style:box-sizing="border-box"
    >
        <div style:display="flex" style:align-items="center" style:gap="12px" style:margin-bottom="16px">
            <!-- Inline BrandMark so capture does not depend on /favicon.svg fetch. -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 32 32"
                style:flex-shrink="0"
                aria-hidden="true"
            >
                <rect width="32" height="32" rx="9" ry="9" fill="#f4f4f5" />
                <g
                    fill="none"
                    stroke="#18181b"
                    stroke-linecap="round"
                    transform="translate(4.48 4.48) scale(0.96)"
                >
                    <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" stroke-width="1.6" />
                    <path d="M7 9.2h10M7 12h4.2M13.2 12H17M9.5 14.8h5" stroke-width="1.5" />
                    <circle cx="18.2" cy="14.8" r="1.15" fill="#22c55e" stroke="none" />
                </g>
            </svg>
            <div style:min-width="0">
                <div style:font-size="16px" style:font-weight="600" style:line-height="1.25" style:white-space="nowrap" style:overflow="hidden" style:text-overflow="ellipsis">
                    {theme.name || "未命名主題"}
                </div>
                <div style:margin-top="2px" style:font-size="12px" style:line-height="1.35" style:color="#52525b">
                    同文鍵盤設計工具 · 配色 × 鍵盤預覽
                </div>
                <div style:margin-top="2px" style:font-size="10px" style:line-height="1.35" style:color="#a1a1aa">
                    {TOOL_URL}
                </div>
            </div>
        </div>
        <div
            style:display="grid"
            style:gap={`${GAP}px`}
            style:grid-template-columns={`repeat(${theme.keyboards.length}, ${CELL_W}px)`}
        >
            {#each theme.colorSchemes as scheme (scheme.id)}
                {#each theme.keyboards as keyboard (keyboard.id)}
                    <div style:display="flex" style:flex-direction="column" style:gap="4px" style:width={`${CELL_W}px`}>
                        <div
                            style:font-size="12px"
                            style:font-weight="500"
                            style:color="#3f3f46"
                            style:white-space="nowrap"
                            style:overflow="hidden"
                            style:text-overflow="ellipsis"
                            title={`${scheme.name || scheme.schemaId} / ${keyboard.name || keyboard.schemaId}`}
                        >
                            {scheme.name || scheme.schemaId || "配色"}
                            <span style:color="#a1a1aa"> · </span>
                            {keyboard.name || keyboard.schemaId || "鍵盤"}
                        </div>
                        <PreviewStage
                            landscape={false}
                            {scheme}
                            {keyboard}
                            style={theme.style}
                            fallbackColors={theme.fallbackColors}
                            presetKeys={theme.presetKeys}
                            selected={NONE}
                            revision={0}
                            designWidth={CELL_W}
                            rounded={true}
                            hideSymbols={get(persistHideKeySymbols)}
                            asciiMode={false}
                            trimeVersion={theme.targetTrimeVersion}
                            showSelectedMark={false}
                        />
                    </div>
                {/each}
            {/each}
        </div>
    </div>
{/if}
