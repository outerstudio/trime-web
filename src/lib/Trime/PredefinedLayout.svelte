<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import YAML from "yaml";
    import { Keyboard } from "./model/keyboard";
    import Thumbnail from "./Thumbnail.svelte";
    import keyboardsYaml from "$lib/assets/trime-tools/keyboards.yaml?raw";
    import { bumpPreview } from "./utils/revision";
    import { hideKeysOnKeyboardIfPersisted } from "./utils/labelSymbol";
    import { resolvedRgba } from "./utils/color";
    import { toastError } from "$lib/utils/error";
    import { builtinDefaultColorScheme } from "./model/theme";

    export var keyboard: Keyboard;
    export var predefinedKeyboards: object[];
    var layoutChrome = builtinDefaultColorScheme();
    const dispatch = createEventDispatcher();

    const toastStore = getToastStore();
    function initPredefined() {
        try {
            var keyboardsObj = YAML.parse(keyboardsYaml);
            return keyboardsObj.keyboards as object[];
        } catch (err) {
            toastError(toastStore, `parse keyboards.yaml failed: ${(err as Error).message}`);
        }
        return [];
    }
    const asKeyboard = (item: any): Keyboard => {
        var kb = new Keyboard();
        kb.fromObject(item, item && item.schemaId);
        return kb;
    };

    if (!predefinedKeyboards || predefinedKeyboards.length === 0) {
        predefinedKeyboards = initPredefined();
    }
    var thumbs: Keyboard[] = predefinedKeyboards.map(asKeyboard);

    function loadPredefined(index: number): void {
        if (keyboard) {
            var initName = keyboard.name;
            var initId = keyboard.schemaId;
            var initAuthor = keyboard.author;
            keyboard.fromObject(predefinedKeyboards[index], (predefinedKeyboards[index] as any).schemaId || initId);
            keyboard.name = initName;
            keyboard.schemaId = initId;
            keyboard.author = initAuthor;
            hideKeysOnKeyboardIfPersisted(keyboard);
            bumpPreview();
            dispatch("done");
        }
    }
</script>

<div class="grid grid-cols-3 gap-1">
    {#each predefinedKeyboards as item, index}
        {@const kb = thumbs[index]}
        <button
            type="button"
            title="套用到目前鍵盤"
            on:click={() => loadPredefined(index)}
            style:background-color={resolvedRgba(layoutChrome, "back_color")}
            style:border-color={resolvedRgba(layoutChrome, "border_color")}
            class="flex h-20 flex-col overflow-hidden rounded-md border p-1 hover:opacity-90"
        >
            <div class="flex min-h-0 w-full grow flex-col">
                <Thumbnail keyboard={kb} scheme={layoutChrome} defaultWidth={kb.width || 10} />
            </div>
            <span class="w-full truncate text-center text-xs" style:color={resolvedRgba(layoutChrome, "key_text_color")}>
                {(item as any).name || (item as any).schemaId}
            </span>
        </button>
    {/each}
</div>
