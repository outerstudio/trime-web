<script lang="ts">
    import {
        scriptVariant,
        toggleScriptVariant,
    } from "$lib/utils/scriptVariant";

    $: isHans = $scriptVariant === "hans";
</script>

<button
    type="button"
    class="ignore-opencc flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-token ring-[1px] ring-surface-500/30 transition-all duration-200 {isHans
        ? 'bg-surface-50'
        : 'bg-surface-900'}"
    role="switch"
    aria-checked={isHans}
    title={isHans ? "切換為繁體" : "切换为简体"}
    aria-label={isHans ? "切換為繁體" : "切换为简体"}
    on:click={() => toggleScriptVariant()}
>
    <span
        class="flex aspect-square h-full scale-[0.8] items-center justify-center rounded-token text-[0.7rem] font-bold leading-none transition-all duration-200 {isHans
            ? 'translate-x-[100%] bg-surface-900 text-surface-50'
            : 'bg-surface-50 text-surface-900'}"
    >
        {isHans ? "简" : "繁"}
    </span>
</button>
