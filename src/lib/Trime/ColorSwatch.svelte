<script lang="ts">
    import type { ColorScheme } from "./model/colorScheme";
    import { resolvedRgba } from "./utils/color";
    import { previewRevision, snap } from "./utils/revision";

    export var scheme: ColorScheme;
    export var fallbackColors: { [id: string]: string } = {};
    export var label: string = "";
    export var selected: boolean = false;
    /** Gallery dims non-current swatches; template picker stays full opacity. */
    export var dimUnselected: boolean = true;

    const readableOn = (rgba: string): string => {
        var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(rgba || "");
        if (!m) return "#FFFFFF";
        var r = Number(m[1]) / 255;
        var g = Number(m[2]) / 255;
        var b = Number(m[3]) / 255;
        var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return lum > 0.55 ? "#111111" : "#FFFFFF";
    };

    $: cardBg = snap(
        $previewRevision,
        scheme
            ? resolvedRgba(scheme, "keyboard_back_color", fallbackColors) ||
                  resolvedRgba(scheme, "back_color", fallbackColors)
            : "",
    );
    $: keyBg = snap(
        $previewRevision,
        scheme
            ? resolvedRgba(scheme, "key_back_color", fallbackColors) || resolvedRgba(scheme, "back_color", fallbackColors)
            : "",
    );
    $: border = snap(
        $previewRevision,
        scheme ? resolvedRgba(scheme, "border_color", fallbackColors) : "",
    );
    $: hiliteBg = snap(
        $previewRevision,
        scheme ? resolvedRgba(scheme, "hilited_key_back_color", fallbackColors) : "",
    );
    $: hiliteFg = snap(
        $previewRevision,
        scheme ? resolvedRgba(scheme, "hilited_key_text_color", fallbackColors) : "",
    );
    $: labelColor = hiliteFg || readableOn(hiliteBg || cardBg);
    // Name is edited on the same object; parent may not re-pass label. Snap to
    // previewRevision (bumped on input) so the swatch title stays in sync.
    $: title = snap($previewRevision, scheme ? scheme.name || scheme.schemaId || label : label);
</script>

<button
    type="button"
    on:click
    style:background-color={cardBg}
    style:border-color={border}
    class:border-2={selected}
    class:border-dashed={selected}
    class:opacity-40={dimUnselected && !selected}
    class="flex h-14 w-full min-w-0 shrink-0 flex-col gap-1 overflow-hidden rounded-md border px-1 py-1 hover:opacity-90"
>
    <span class="min-h-0 w-full flex-1 rounded-sm" style:background-color={keyBg}></span>
    <span
        class="w-full shrink-0 truncate rounded-sm px-1 py-0.5 text-center text-xs leading-tight"
        style:background-color={hiliteBg}
        style:color={labelColor}
    >
        {title}
    </span>
</button>
