<script lang="ts">
    import Icon from "@iconify/svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import Details from "$lib/Component/Details.svelte";
    import { PresetKey } from "./model/presetKey";
    import type { Keyboard } from "./model/keyboard";
    import { TRIGGER_SLOTS } from "./model/key";
    import { BUILTIN_PRESET_KEY_IDS, BUILTIN_PRESET_KEYS } from "./utils/keydefs";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { toastWarn } from "$lib/utils/error";

    export var presetKeys: PresetKey[];
    export var keyboards: Keyboard[] = [];

    const toastStore = getToastStore();
    var seedId = "BackSpace";
    var newId = "";

    const retargetTriggers = (from: string, to: string) => {
        if (!from || from === to) return;
        for (let kb of keyboards) {
            for (let key of kb.keys) {
                for (let slot of TRIGGER_SLOTS) {
                    if (key.getTrigger(slot) === from) key.setTrigger(slot, to);
                }
            }
        }
    };

    const onIdChange = (key: PresetKey, prev: string, next: string) => {
        next = next.trim();
        if (!next) {
            toastWarn(toastStore, "主題鍵 id 不能為空");
            key.id = prev;
            return;
        }
        if (presetKeys.some((p) => p !== key && p.id === next)) {
            toastWarn(toastStore, `主題鍵「${next}」已存在`);
            key.id = prev;
            return;
        }
        key.id = next;
        if (prev && prev !== next) retargetTriggers(prev, next);
    };

    const addBlank = () => {
        var id = newId.trim() || "custom_key";
        if (presetKeys.some((p) => p.id === id)) {
            toastWarn(toastStore, `主題鍵「${id}」已存在`);
            id = id + "_" + Date.now();
        }
        var p = new PresetKey();
        p.id = id;
        presetKeys = [...presetKeys, p];
        newId = "";
    };
    const addFromBuiltin = () => {
        var spec = BUILTIN_PRESET_KEYS[seedId];
        if (!spec) return;
        var p = new PresetKey();
        p.fromObject(spec, seedId);
        if (presetKeys.some((x) => x.id === p.id)) {
            toastWarn(toastStore, `主題鍵「${p.id}」已存在，已改名`);
            p.id = p.id + "_copy";
        }
        presetKeys = [...presetKeys, p];
    };
    const removeAt = (index: number) => {
        presetKeys.splice(index, 1);
        presetKeys = presetKeys;
    };
    const cloneAt = (index: number) => {
        var c = presetKeys[index].clone();
        c.id = c.id + "_copy";
        presetKeys = [...presetKeys, c];
    };
</script>

<div class="flex flex-col gap-2 p-2">
    <div class="flex h-8 items-center gap-1">
        <input
            bind:value={newId}
            placeholder="新鍵 id"
            class="variant-ringed h-8 min-w-0 grow rounded-md px-2 font-mono"
        />
        <IconButton
            icon="mdi:plus"
            on:click={addBlank}
            class="variant-ringed h-8 shrink-0 rounded-md px-2 text-sm hover:variant-ghost"
        >
            添加
        </IconButton>
    </div>
    <div class="flex h-8 items-center gap-1">
        <select bind:value={seedId} class="variant-ringed h-8 min-w-0 grow rounded-md bg-transparent px-2 font-mono">
            {#each BUILTIN_PRESET_KEY_IDS as id}
                <option value={id}>{id}</option>
            {/each}
        </select>
        <IconButton
            icon="mdi:database-plus"
            on:click={addFromBuiltin}
            class="variant-ringed h-8 shrink-0 rounded-md px-2 text-sm hover:variant-ghost"
        >
            從内置複製
        </IconButton>
    </div>

    {#each presetKeys as key, index (key.uid)}
        {@const pkAny = key as any}
        <Details summary={`${key.id} · ${key.displayLabel()}`}>
            <div class="flex flex-col gap-1 p-2">
                {#each [["id", "id"], ["label", "label"], ["send", "send"], ["text", "text"], ["commit", "commit"], ["command", "command"], ["option", "option"], ["select", "select"], ["toggle", "toggle"], ["preview", "preview"], ["shift_lock", "shift_lock"]] as [field, label]}
                    <div class="flex items-center gap-2">
                        <span class="w-24 font-mono text-xs">{label}</span>
                        {#if field === "id"}
                            <input
                                value={key.id}
                                on:change={(e) => {
                                    var prev = key.id;
                                    var next = (e.currentTarget as HTMLInputElement).value;
                                    onIdChange(key, prev, next);
                                    presetKeys = presetKeys;
                                }}
                                class="variant-ringed h-8 grow rounded-md px-2 font-mono"
                                class:ring-2={!key.id.trim() ||
                                    presetKeys.filter((p) => p.id === key.id).length > 1}
                                class:ring-warning-500={!key.id.trim() ||
                                    presetKeys.filter((p) => p.id === key.id).length > 1}
                            />
                        {:else}
                            <input
                                bind:value={pkAny[field]}
                                class="variant-ringed h-8 grow rounded-md px-2 font-mono"
                            />
                        {/if}
                    </div>
                    {#if field === "id" && !key.id.trim()}
                        <p class="text-xs text-warning-500">id 不能為空</p>
                    {:else if field === "id" && presetKeys.filter((p) => p.id === key.id).length > 1}
                        <p class="text-xs text-warning-500">與其他主題鍵 id 重複</p>
                    {:else if field === "select"}
                        <p class="px-1 text-xs opacity-60">select = 要切過去的鍵盤代碼（如 us_intl），不是本鍵 id</p>
                    {/if}
                {/each}
                <div class="flex items-center gap-2">
                    <span class="w-24 font-mono text-xs">states</span>
                    <input
                        value={key.states.join(", ")}
                        on:change={(e) => {
                            key.states = (e.currentTarget as HTMLInputElement).value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                        }}
                        class="variant-ringed h-8 grow rounded-md px-2"
                    />
                </div>
                <div class="flex flex-wrap gap-2">
                    {#each ["functional", "repeatable", "sticky", "slide_cursor", "slide_delete"] as field}
                        <button
                            class="variant-ringed rounded-md px-2 py-1 text-sm"
                            on:click={() => {
                                pkAny[field] =
                                    pkAny[field] === true ? false : pkAny[field] === false ? undefined : true;
                                presetKeys = presetKeys;
                            }}
                        >
                            {field}: {pkAny[field] === undefined ? "默認" : pkAny[field] ? "是" : "否"}
                        </button>
                    {/each}
                </div>
                <div class="flex gap-1">
                    <IconButton
                        icon="mdi:content-copy"
                        on:click={() => cloneAt(index)}
                        class="p-1 hover:variant-ghost"
                    />
                    <IconButton icon="mdi:close" on:click={() => removeAt(index)} class="p-1 hover:variant-ghost" />
                </div>
            </div>
        </Details>
    {:else}
        <div class="flex items-center gap-2 px-2 text-sm opacity-70">
            <Icon icon="mdi:information-outline" />
            主題尚未覆蓋 preset_keys。預覽仍可使用同文内置表。可從上方複製内置鍵再改。
        </div>
    {/each}
</div>
