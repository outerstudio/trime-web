<script lang="ts">
    import type { TriggerValue } from "./model/presetKey";
    import { PresetKey } from "./model/presetKey";
    import { ANDROID_KEY_NAMES, BUILTIN_PRESET_KEY_IDS, BUILTIN_PRESET_KEYS } from "./utils/keydefs";
    import { bumpPreview } from "./utils/revision";

    export var value: TriggerValue = "";
    export var extraNames: string[] = [];

    const CUSTOM = "__custom__";
    const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
    const DIGITS = "0123456789".split("");
    const PUNCT = [",", ".", "/", ";", "'", "-", "=", "[", "]", "\\", "`", " ", "+", "*"];
    var forceCustom = false;

    $: themeIds = extraNames.filter(Boolean);
    $: androidIds = ANDROID_KEY_NAMES.filter((n) => !BUILTIN_PRESET_KEYS[n]);
    $: known = new Set<string>([...themeIds, ...BUILTIN_PRESET_KEY_IDS, ...androidIds, ...LETTERS, ...DIGITS, ...PUNCT, ""]);
    $: isObj = typeof value !== "string";
    $: unsupportedInline =
        isObj &&
        !!(
            (value as PresetKey).send ||
            (value as PresetKey).select ||
            (value as PresetKey).toggle ||
            (value as PresetKey).command ||
            (value as PresetKey).option ||
            (value as PresetKey).states.length
        );
    $: text = typeof value === "string" ? value : JSON.stringify(value.toObject());
    $: inList = typeof value === "string" && known.has(value);
    $: showCustom = forceCustom || isObj || !inList;
    $: selectValue = showCustom ? CUSTOM : value;

    const presetTitle = (id: string): string => {
        var spec = BUILTIN_PRESET_KEYS[id];
        if (!spec) return id;
        if (spec.label && spec.label !== "enter_labels") return `${id} · ${spec.label}`;
        if (Array.isArray(spec.states) && spec.states[0]) return `${id} · ${spec.states[0]}`;
        if (spec.send) return `${id} · ${spec.send}`;
        return id;
    };

    const applyString = (v: string) => {
        value = v;
        bumpPreview();
    };

    const onSelect = (event: Event) => {
        var v = (event.currentTarget as HTMLSelectElement).value;
        if (v === CUSTOM) {
            forceCustom = true;
            return;
        }
        forceCustom = false;
        applyString(v);
    };

    const onInput = (event: Event) => {
        var v = (event.currentTarget as HTMLInputElement).value;
        if (v.trim().startsWith("{")) {
            try {
                var obj = JSON.parse(v);
                var p = new PresetKey();
                p.fromObject(obj);
                value = p;
                bumpPreview();
                return;
            } catch {
                applyString(v);
                return;
            }
        }
        applyString(v);
    };
</script>

<div class="flex min-w-0 grow flex-col">
    <select
        value={selectValue}
        on:change={onSelect}
        class="variant-ringed h-10 w-full rounded-none bg-transparent px-2 font-mono hover:variant-ghost"
    >
        <option value="">（空 / 換行）</option>
        {#if typeof value === "string" && value && !known.has(value)}
            <option value={value}>{value}</option>
        {/if}
        {#if themeIds.length}
            <optgroup label="本主題鍵">
                {#each themeIds as name}
                    <option value={name}>{name}</option>
                {/each}
            </optgroup>
        {/if}
        <optgroup label="内置主題鍵">
            {#each BUILTIN_PRESET_KEY_IDS as id}
                <option value={id}>{presetTitle(id)}</option>
            {/each}
        </optgroup>
        <optgroup label="字母 / 數字">
            {#each LETTERS as ch}
                <option value={ch}>{ch}</option>
            {/each}
            {#each DIGITS as ch}
                <option value={ch}>{ch}</option>
            {/each}
            {#each PUNCT as ch}
                <option value={ch}>{ch === " " ? "space 字元" : ch}</option>
            {/each}
        </optgroup>
        <optgroup label="系統鍵名">
            {#each androidIds as name}
                <option value={name}>{name}</option>
            {/each}
        </optgroup>
        <option value={CUSTOM}>自訂…</option>
    </select>
    {#if showCustom}
        <input
            value={text}
            on:input={onInput}
            placeholder={isObj ? "舊版內聯動作 JSON" : "自訂按鍵名／字元／宏"}
            class="variant-ringed h-8 w-full rounded-none px-2 font-mono text-sm hover:variant-ghost"
        />
        {#if unsupportedInline}
            <p class="px-2 py-1 text-xs opacity-70">
                同文 3.3.11 不直接解析這種內聯動作；完整主題導出時會自動提升為具名 preset key。
            </p>
        {/if}
    {/if}
</div>
