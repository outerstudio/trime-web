<script lang="ts">
    import Icon from "@iconify/svelte";

    export var icon: string;
    export var height: string | number = "";
    export var color: string = "";
    let className = "";
    export { className as class };
</script>

<button
    type="button"
    on:click
    {...$$restProps}
    class="inline-flex items-center justify-center gap-1 whitespace-nowrap {className}"
>
    <Icon {icon} {height} {color} />
    <slot />
</button>
