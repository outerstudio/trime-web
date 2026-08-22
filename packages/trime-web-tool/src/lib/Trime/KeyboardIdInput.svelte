<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {
        BUILTIN_KEYBOARD_PRESETS,
        SPECIAL_KEYBOARD_IDS,
        keyboardIdTitle,
    } from "./utils/keyboardIds";
    import { bumpPreview } from "./utils/revision";

    export var value: string = "";
    export var extraIds: string[] = [];
    export var allowEmpty: boolean = false;
    export var includeSpecial: boolean = false;
    export var inputClass: string = "variant-ringed h-10 min-w-0 grow rounded-none px-2 font-mono";
    export var outerClass: string = "flex min-w-0 w-[50%] items-stretch overflow-hidden";

    const CUSTOM = "__custom__";
    var forceCustom = false;
    const dispatch = createEventDispatcher();

    $: builtinIds = [
        ...(includeSpecial ? SPECIAL_KEYBOARD_IDS : []),
        ...BUILTIN_KEYBOARD_PRESETS,
    ];
    $: builtinSet = new Set(builtinIds.map((x) => x.id));
    $: themeIds = extraIds.filter((id) => id && !builtinSet.has(id));
    $: known = new Set<string>([
        ...builtinIds.map((x) => x.id),
        ...themeIds,
        ...(allowEmpty ? [""] : []),
    ]);
    $: if (known.has(value)) forceCustom = false;
    $: selectValue = forceCustom || !known.has(value) ? CUSTOM : value;

    const onSelect = (event: Event) => {
        var v = (event.currentTarget as HTMLSelectElement).value;
        if (v === CUSTOM) {
            forceCustom = true;
            return;
        }
        forceCustom = false;
        value = v;
        bumpPreview();
        dispatch("change");
    };

    const onInput = () => {
        bumpPreview();
    };
</script>

<div class={outerClass}>
    <div class="min-w-0 w-[42%] shrink-0 overflow-hidden">
        <select
            value={selectValue}
            on:change={onSelect}
            class="variant-ringed h-full w-full max-w-full min-w-0 bg-transparent px-1 font-mono text-sm hover:variant-ghost"
        >
            {#if allowEmpty}
                <option value="">（空）</option>
            {/if}
            {#if value && !known.has(value)}
                <option value={value}>{value}</option>
            {/if}
            {#if themeIds.length}
                <optgroup label="本主題鍵盤">
                    {#each themeIds as id}
                        <option value={id}>{id}</option>
                    {/each}
                </optgroup>
            {/if}
            {#if includeSpecial}
                <optgroup label="特殊">
                    {#each SPECIAL_KEYBOARD_IDS as item}
                        <option value={item.id}>{keyboardIdTitle(item.id)}</option>
                    {/each}
                </optgroup>
            {/if}
            <optgroup label="同文内置">
                {#each BUILTIN_KEYBOARD_PRESETS as item}
                    <option value={item.id}>{keyboardIdTitle(item.id)}</option>
                {/each}
            </optgroup>
            <option value={CUSTOM}>自訂…</option>
        </select>
    </div>
    <input bind:value on:input={onInput} on:change placeholder="自訂代碼" class={inputClass} />
</div>
