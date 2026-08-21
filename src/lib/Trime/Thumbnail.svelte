<script lang="ts">
    import type { ColorScheme } from "trime-web-renderer";
    import type { Keyboard } from "trime-web-renderer";
    import { wrapKeys } from "trime-web-renderer";
    import { resolvedRgba } from "trime-web-renderer";
    import { previewRevision, snap } from "./utils/revision";

    export var scheme: ColorScheme;
    export var keyboard: Keyboard;
    export var fallbackColors: { [id: string]: string } = {};
    export var defaultWidth: number = 10;

    $: dw = keyboard.width > 0 ? keyboard.width : defaultWidth || 10;
    $: rows = snap($previewRevision, wrapKeys(keyboard.keys, keyboard.columns, dw));
    $: bg = snap($previewRevision, resolvedRgba(scheme, "key_back_color", fallbackColors));
    $: border = snap($previewRevision, resolvedRgba(scheme, "key_border_color", fallbackColors));
</script>

{#key $previewRevision}
    {#each rows as row}
        <div class="flex w-full shrink grow">
            {#each row as key}
                <div class="h-full p-px" style:width={`${key.width > 0 ? key.width : dw}%`}>
                    {#if !key.clickEmpty}
                        <div
                            style:border-color={border}
                            style:background-color={bg}
                            class="h-full w-full rounded-sm border"
                        ></div>
                    {/if}
                </div>
            {/each}
        </div>
    {/each}
{/key}
