<script lang="ts">
    import Icon from "@iconify/svelte";

    export var icon: string;
    export var height: string | number = "";
    export var color: string = "";

    export var r_tl: boolean = false;
    export var r_tr: boolean = false;
    export var r_bl: boolean = false;
    export var r_br: boolean = false;
</script>

<button
    type="button"
    on:click
    {...$$restProps}
    class:inline-flex={true}
    class:items-center={true}
    class:justify-center={true}
    class:gap-1={true}
    class:whitespace-nowrap={true}
    class:rounded-tl-md={r_tl}
    class:rounded-tr-md={r_tr}
    class:rounded-bl-md={r_bl}
    class:rounded-br-md={r_br}
>
    <Icon {icon} {height} {color} />
    <slot />
</button>
