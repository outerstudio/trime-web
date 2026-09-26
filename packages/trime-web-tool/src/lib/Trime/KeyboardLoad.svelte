<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    export var keyboard: any;
    export var remove: boolean = false;
    export var override: boolean = false;
    export var loadTitle: string = "加載";
    export var saveTitle: string = "儲存";

    const [modeRemove, modeOverride, modeLoad] = [1, 2, 3];
    var opMode = 0;
    var timeout: ReturnType<typeof setTimeout>;
    $: name =
        typeof keyboard.name === "string"
            ? keyboard.name
            : typeof keyboard.schemaId === "string"
              ? keyboard.schemaId
              : "鍵盤";
    $: display = !opMode
        ? name
        : `${opMode === modeRemove ? "删除" : opMode === modeOverride ? "覆蓋" : "加載"}中, 點擊取消`;

    function delay(f: () => void) {
        clearTimeout(timeout);
        timeout = setTimeout(f, 2000);
    }
    function setMode(mode: number): number {
        opMode = opMode === 0 ? mode : 0;
        return opMode;
    }

    const dispatch = createEventDispatcher();
    function tryRemove() {
        if (setMode(modeRemove)) {
            delay(() => {
                if (opMode === modeRemove) {
                    opMode = 0;
                    dispatch("remove");
                }
            });
        }
    }
    function tryLoad() {
        if (setMode(modeLoad)) {
            delay(() => {
                if (opMode === modeLoad) {
                    opMode = 0;
                    dispatch("load");
                }
            });
        }
    }
    function tryOverride() {
        if (setMode(modeOverride)) {
            delay(() => {
                if (opMode === modeOverride) {
                    opMode = 0;
                    dispatch("override");
                }
            });
        }
    }
</script>

<div class="variant-ringed flex h-8 min-w-0 items-center gap-1 rounded-md px-2 py-1 hover:variant-ghost">
    {#if remove}
        <button title="删除" on:click={tryRemove} class="flex shrink-0 items-center rounded-full p-1 hover:variant-ringed">
            <Icon icon={opMode === modeRemove ? "mdi:cancel" : "mdi:close"} />
        </button>
    {/if}
    <button
        title={loadTitle}
        on:click={tryLoad}
        class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-md p-1 text-center"
        class:text-xs={opMode}
    >
        {display}
    </button>
    {#if override}
        <button
            title={saveTitle}
            on:click={tryOverride}
            class="flex shrink-0 items-center rounded-full p-1 hover:variant-ringed"
        >
            <Icon icon={opMode === modeOverride ? "mdi:cancel" : "mdi:content-save"} />
        </button>
    {/if}
</div>
