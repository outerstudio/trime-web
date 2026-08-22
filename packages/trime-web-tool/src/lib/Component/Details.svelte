<script lang="ts">
    import Icon from "@iconify/svelte";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export var open: boolean = false;
    export var summary: string = "";

    var height = tweened(0, {
        easing: cubicOut,
    });
</script>

<div style={`height: ${$height}px`} class="variant-ringed w-full overflow-y-hidden rounded-md p-[0.5px]">
    <details bind:clientHeight={$height} bind:open {...$$restProps}>
        <summary
            class="variant-ringed relative flex cursor-pointer items-center rounded-t-md pl-2 pr-8 hover:variant-ghost"
            class:rounded-b-md={!open}
            class:variant-ghost={open}
        >
            <slot name="summary">
                <span class="flex h-10 min-w-0 flex-1 items-center">{summary}</span>
            </slot>
            <span
                class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-70 transition-transform"
                class:rotate-180={open}
            >
                <Icon icon="mdi:chevron-down" class="h-5 w-5" />
            </span>
        </summary>
        <slot />
    </details>
</div>

<style>
    summary {
        list-style: none;
    }
    summary::-webkit-details-marker {
        display: none;
    }
</style>
