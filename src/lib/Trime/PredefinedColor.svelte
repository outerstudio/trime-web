<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import YAML from "yaml";
    import { ColorScheme } from "./model/colorScheme";
    import { newId } from "./model/id";
    import colorsYaml from "$lib/assets/trime-tools/colorschemes.yaml?raw";
    import { bumpPreview } from "./utils/revision";
    import { toastError } from "$lib/utils/error";
    import ColorSwatch from "./ColorSwatch.svelte";

    export var scheme: ColorScheme;
    export var predefinedSchemes: object[];
    const dispatch = createEventDispatcher();

    const toastStore = getToastStore();
    function initPredefined() {
        try {
            var parsed = YAML.parse(colorsYaml);
            return parsed && Array.isArray(parsed.schemes) ? (parsed.schemes as object[]) : [];
        } catch (err) {
            toastError(toastStore, `parse colorschemes.yaml failed: ${(err as Error).message}`);
        }
        return [];
    }
    const asScheme = (item: any): ColorScheme => {
        var s = new ColorScheme();
        s.fromObject(item, item && item.schemaId);
        return s;
    };

    if (!predefinedSchemes || predefinedSchemes.length === 0) {
        predefinedSchemes = initPredefined();
    }
    var swatches: ColorScheme[] = predefinedSchemes.map(asScheme);

    function loadPredefined(index: number): void {
        if (!scheme) return;
        var spec: any = predefinedSchemes[index];
        var initName = scheme.name;
        var initId = scheme.schemaId;
        var initAuthor = scheme.author;
        var dark = scheme.dark_scheme;
        var light = scheme.light_scheme;
        scheme.fromObject(spec, spec.schemaId || initId);
        scheme.schemaId = initId;
        scheme.name = initName;
        scheme.author = initAuthor;
        scheme.dark_scheme = dark;
        scheme.light_scheme = light;
        scheme.id = newId();
        bumpPreview();
        dispatch("done");
    }
</script>

<div class="grid grid-cols-3 gap-1">
    {#each predefinedSchemes as item, index}
        <ColorSwatch
            scheme={swatches[index]}
            label={(item as any).name || (item as any).schemaId}
            dimUnselected={false}
            on:click={() => loadPredefined(index)}
        />
    {/each}
</div>
