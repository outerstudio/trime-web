<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import Details from "$lib/Component/Details.svelte";
    import { getToastStore } from "@skeletonlabs/skeleton";
    import { Key, TRIGGER_SLOTS, TRIGGER_LABELS, type TriggerSlot, KEY_COLOR_FIELDS } from "./model/key";
    import type { Keyboard } from "./model/keyboard";
    import { PresetKey } from "./model/presetKey";
    import { ColorValue } from "./model/color";
    import KeyAction from "./KeyAction.svelte";
    import ColorSelector from "./ColorSelector.svelte";
    import { bumpPreview } from "./utils/revision";
    import { hideKeySymbol } from "./utils/labelSymbol";
    import {
        findPreset,
        perKeyLabelBlockReason,
        trimeKeyLabel,
    } from "./utils/labels";
    import { toastWarn } from "$lib/utils/error";
    import {
        BUILTIN_PRESET_KEYS,
        builtinDefaultStates,
        builtinStateFieldHints,
        builtinTitle,
        isDualStateEditable,
        makeDualStateVariantId,
        resolveDualStateBase,
    } from "./utils/keydefs";

    export var key: Key;
    export var keyboard: Keyboard;
    /** 用於判斷變體 preset 是否還被其他鍵盤引用 */
    export var keyboards: Keyboard[] = [];
    export var presetKeys: PresetKey[] = [];
    export var extraNames: string[] = [];
    export var enterLabel: string = "Enter";
    var keyAny: any;
    $: keyAny = key;

    var dispatch = createEventDispatcher();
    const toastStore = getToastStore();

    const colorTitles: { [k: string]: string } = {
        key_back_color: "按鍵背景",
        key_text_color: "按鍵文字",
        key_symbol_color: "按鍵符號",
        hilited_key_back_color: "按下背景",
        hilited_key_text_color: "按下文字",
        off_key_back_color: "功能鍵關閉背景",
        off_key_text_color: "功能鍵關閉文字",
        on_key_back_color: "功能鍵打開背景",
        on_key_text_color: "功能鍵打開文字",
    };

    const ensureColor = (id: string): ColorValue => {
        if (!key.colors[id]) key.colors[id] = new ColorValue();
        return key.colors[id];
    };

    $: clickStr = typeof key.click === "string" ? key.click : "";
    $: dualBase = resolveDualStateBase(clickStr);
    $: dualStateEditable = isDualStateEditable(clickStr);
    $: hideTopSymbol = key.label_symbol.length > 0 && key.label_symbol.trim() === "";
    $: labelCtx = { asciiMode: keyboard.ascii_mode === 1, activeIsClick: true };
    $: labelBlocked = perKeyLabelBlockReason(key, labelCtx);
    $: faceLabel = trimeKeyLabel(key, presetKeys, enterLabel, "明月拼音", labelCtx, keyboard.label_transform);
    $: clickPreset = typeof key.click === "string" && key.click ? findPreset(key.click, presetKeys) : null;
    $: dualHints = dualStateEditable ? builtinStateFieldHints(dualBase) : (["", ""] as [string, string]);
    $: dualDefaults = dualStateEditable ? builtinDefaultStates(dualBase) : (["", ""] as [string, string]);
    $: dualState0 =
        dualStateEditable && clickPreset?.states?.[0] !== undefined
            ? clickPreset.states[0]
            : dualDefaults[0];
    $: dualState1 =
        dualStateEditable && clickPreset?.states?.[1] !== undefined
            ? clickPreset.states[1]
            : dualDefaults[1];
    $: canSyncPreset =
        !dualStateEditable &&
        !!key.label &&
        typeof key.click === "string" &&
        !!key.click &&
        !!findPreset(key.click, presetKeys);
    $: labelSyncedToPreset = !!(clickPreset && key.label && clickPreset.label === key.label);

    const presetIdReferenced = (id: string, exceptKey?: Key): boolean => {
        if (!id) return false;
        var boards = keyboards.length ? keyboards : [keyboard];
        for (let kb of boards) {
            for (let k of kb.keys) {
                if (exceptKey && k.id === exceptKey.id) continue;
                for (let slot of TRIGGER_SLOTS) {
                    if (k.getTrigger(slot) === id) return true;
                }
            }
        }
        return false;
    };

    const dropOrphanVariant = (id: string) => {
        var base = resolveDualStateBase(id);
        if (!base || id === base) return;
        if (presetIdReferenced(id)) return;
        var idx = presetKeys.findIndex((p) => p.id === id);
        if (idx >= 0) {
            presetKeys.splice(idx, 1);
            presetKeys = presetKeys;
        }
    };

    const setDualState = (index: 0 | 1, value: string) => {
        if (!dualStateEditable || !dualBase) return;
        var defaults = builtinDefaultStates(dualBase);
        var next: [string, string] = [
            clickPreset?.states?.[0] ?? defaults[0],
            clickPreset?.states?.[1] ?? defaults[1],
        ];
        next[index] = value;
        var oldId = clickStr;
        var newId = makeDualStateVariantId(dualBase, next[0], next[1]);

        var seed = findPreset(dualBase, []);
        if (!seed) {
            toastWarn(toastStore, `找不到內建主題鍵「${dualBase}」`);
            return;
        }

        if (newId === dualBase) {
            // 回到內建預設：click 指回基底，不強制寫進主題鍵
            key.click = dualBase;
            if (key.label) key.label = "";
            key = key;
            dropOrphanVariant(oldId);
            bumpPreview();
            return;
        }

        var existing = presetKeys.find((p) => p.id === newId);
        if (existing) {
            existing.states = [next[0], next[1]];
            // 其餘動作欄位保持與基底一致
            existing.send = seed.send;
            existing.toggle = seed.toggle;
        } else {
            var p = seed.clone();
            p.id = newId;
            p.states = [next[0], next[1]];
            p.label = ""; // 鍵面走 states
            presetKeys = [...presetKeys, p];
        }

        key.click = newId;
        if (key.label) key.label = "";
        key = key;
        if (oldId && oldId !== newId) dropOrphanVariant(oldId);
        presetKeys = presetKeys;
        bumpPreview();
    };

    const resetDualStates = () => {
        if (!dualStateEditable || !dualBase) return;
        var oldId = clickStr;
        key.click = dualBase;
        if (key.label) key.label = "";
        key = key;
        dropOrphanVariant(oldId);
        bumpPreview();
    };

    const toggleHideTopSymbol = () => {
        if (hideTopSymbol) {
            key.label_symbol = key.labelSymbolSaved ?? "";
            key.labelSymbolSaved = undefined;
        } else {
            hideKeySymbol(key);
        }
        key = key;
        bumpPreview();
    };

    const syncLabelToPreset = () => {
        if (typeof key.click !== "string" || !key.click || !key.label) {
            toastWarn(toastStore, "需要具名 click 與非空 label 才能同步");
            return;
        }
        var id = key.click;
        var existing = presetKeys.find((p) => p.id === id);
        if (existing) {
            existing.label = key.label;
            presetKeys = presetKeys;
        } else {
            var seed = findPreset(id, []);
            if (!seed) {
                toastWarn(toastStore, `找不到主題鍵「${id}」，無法同步`);
                return;
            }
            var p = seed.clone();
            p.id = id;
            p.label = key.label;
            presetKeys = [...presetKeys, p];
        }
        bumpPreview();
    };

    /** Restore preset label to builtin (or clear) so the checkbox can uncheck. */
    const unsyncLabelFromPreset = () => {
        if (typeof key.click !== "string" || !key.click) return;
        var id = key.click;
        var existing = presetKeys.find((p) => p.id === id);
        if (!existing) return;
        var builtin = BUILTIN_PRESET_KEYS[id];
        existing.label = builtin && typeof builtin.label === "string" ? builtin.label : "";
        presetKeys = presetKeys;
        bumpPreview();
    };

    const onSyncCheckbox = (e: Event) => {
        var box = e.currentTarget as HTMLInputElement;
        if (box.checked) syncLabelToPreset();
        else unsyncLabelFromPreset();
    };
</script>

<div class="flex flex-col gap-2 p-2">
    <div class="variant-ringed flex flex-col rounded-md p-[0.5px]">
        {#if dualStateEditable}
            <div class="flex w-full items-center">
                <span class="variant-ringed flex h-10 w-28 shrink-0 items-center rounded-tl-md px-2 text-sm"
                    >{dualHints[0]}</span
                >
                <input
                    title={dualHints[0]}
                    value={dualState0}
                    on:change={(e) => setDualState(0, (e.currentTarget as HTMLInputElement).value)}
                    placeholder={dualDefaults[0]}
                    class="variant-ringed h-10 grow rounded-tr-md px-2 hover:variant-ghost"
                />
            </div>
            <div class="flex w-full items-center">
                <span class="variant-ringed flex h-10 w-28 shrink-0 items-center px-2 text-sm">{dualHints[1]}</span>
                <input
                    title={dualHints[1]}
                    value={dualState1}
                    on:change={(e) => setDualState(1, (e.currentTarget as HTMLInputElement).value)}
                    placeholder={dualDefaults[1]}
                    class="variant-ringed h-10 grow px-2 hover:variant-ghost"
                />
            </div>
            <p class="px-2 py-1 text-xs opacity-70">
                「{builtinTitle(dualBase)}」自訂狀態會建成獨立主題鍵 id（可含中文），例如
                <span class="font-mono">{dualBase}／文／A</span>，不覆蓋共用的
                <span class="font-mono">{dualBase}</span>。目前 id「{clickStr}」，預覽「{faceLabel || "（空）"}」。
                <button type="button" class="underline hover:opacity-100" on:click={resetDualStates}>還原預設</button>
            </p>
        {:else}
            <div class="flex w-full items-center">
                <span class="variant-ringed flex h-10 shrink-0 items-center rounded-tl-md px-2 text-sm">按鍵字</span>
                <input
                    title="顯示標籤"
                    bind:value={key.label}
                    placeholder="標籤（空則用主題鍵）"
                    class="variant-ringed h-10 grow rounded-tr-md px-2 hover:variant-ghost"
                />
            </div>
            {#if labelBlocked && !labelSyncedToPreset}
                <p class="px-2 py-1 text-xs text-warning-500">
                    {labelBlocked}。鍵面實際顯示「{faceLabel || "（空）"}」。
                </p>
            {/if}
            {#if canSyncPreset && key.label}
                <label class="flex items-center gap-2 px-2 py-1 text-sm">
                    <input
                        type="checkbox"
                        class="shrink-0"
                        checked={labelSyncedToPreset}
                        on:change={onSyncCheckbox}
                    />
                    <span class="min-w-0 leading-snug">
                        把此 label「{key.label}」寫入主題鍵「{clickStr}」（僅在中文、非 ascii_punct、且無
                        ascii 槽時，同文才會用每鍵 label）
                    </span>
                </label>
            {/if}
        {/if}
        <div class="flex w-full">
            <span class="variant-ringed flex h-10 w-28 shrink-0 items-center px-2 text-sm">{TRIGGER_LABELS.click}</span>
            <KeyAction bind:value={keyAny.click} {extraNames} />
        </div>
        <div class="flex w-full min-w-0">
            <input
                title="角標"
                bind:value={key.label_symbol}
                placeholder="角標"
                disabled={hideTopSymbol}
                class="variant-ringed h-10 min-w-0 w-1/2 shrink rounded-none px-2"
            />
            <input
                title="助記"
                bind:value={key.hint}
                placeholder="助記"
                class="variant-ringed h-10 min-w-0 w-1/2 shrink rounded-none px-2"
            />
        </div>
        <label class="flex h-10 w-full shrink-0 items-center gap-2 px-2 text-sm">
            <input type="checkbox" checked={hideTopSymbol} on:change={toggleHideTopSymbol} class="shrink-0" />
            <span class="min-w-0 leading-snug">隱藏上方長按符號（角標）</span>
        </label>
        <input
            title="同文 3.3.11 的長按彈出選項"
            value={key.popup.join(", ")}
            on:change={(e) => {
                key.popup = (e.currentTarget as HTMLInputElement).value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                key = key;
                bumpPreview();
            }}
            placeholder="長按彈窗選項（逗號分隔）"
            class="variant-ringed h-10 w-full px-2"
        />
        <div class="flex w-full min-w-0">
            <span class="variant-ringed flex h-10 w-1/2 items-center gap-2 px-2 text-sm">
                <span class="shrink-0">鍵字號</span>
                <input
                    type="number"
                    bind:value={key.key_text_size}
                    title="0＝跟鍵盤／主題"
                    class="variant-ringed ml-auto h-8 w-16 shrink-0 rounded-md px-1 text-center"
                />
            </span>
            <span class="variant-ringed flex h-10 w-1/2 items-center gap-2 px-2 text-sm">
                <span class="shrink-0">角標字號</span>
                <input
                    type="number"
                    bind:value={key.symbol_text_size}
                    title="0＝跟鍵盤／主題"
                    class="variant-ringed ml-auto h-8 w-16 shrink-0 rounded-md px-1 text-center"
                />
            </span>
        </div>
    </div>

    <Details summary="其他觸發槽">
        <div class="flex flex-col gap-1 p-2">
            {#each TRIGGER_SLOTS.filter((s) => s !== "click") as slot}
                <div class="flex w-full items-center">
                    <span class="w-20 shrink-0 px-1 text-sm">{TRIGGER_LABELS[slot as TriggerSlot]}</span>
                    <KeyAction bind:value={keyAny[slot]} {extraNames} />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="按鍵顔色覆蓋">
        <div class="flex flex-col gap-2 p-2">
            {#each KEY_COLOR_FIELDS as id}
                <ColorSelector title={colorTitles[id] || id} value={ensureColor(id)} />
            {/each}
        </div>
    </Details>

    <div class="variant-ringed mx-auto flex w-full overflow-auto rounded-md p-[0.5px]">
        <button
            title="删除"
            on:click={() => dispatch("delkey")}
            class="variant-ringed rounded-l-md p-2 hover:variant-ghost"
        >
            <Icon height="20" icon="mdi:close" />
        </button>
        <button title="左移" on:click={() => dispatch("moveleft")} class="variant-ringed p-2 hover:variant-ghost">
            <Icon height="20" icon="mdi:arrow-left" />
        </button>
        <input
            title="鍵寛 %"
            type="number"
            bind:value={key.width}
            min={0}
            max={100}
            class="variant-ringed min-w-0 shrink grow p-2"
        />
        <span class="variant-ringed flex shrink-0 items-center px-2 text-sm">% 鍵寛</span>
        <button title="複製" on:click={() => dispatch("copykey")} class="variant-ringed p-2 hover:variant-ghost">
            <Icon height="20" icon="mdi:content-copy" />
        </button>
        <button title="粘貼" on:click={() => dispatch("pastekey")} class="variant-ringed p-2 hover:variant-ghost">
            <Icon height="20" icon="mdi:content-paste" />
        </button>
        <button title="右移" on:click={() => dispatch("moveright")} class="variant-ringed p-2 hover:variant-ghost">
            <Icon height="20" icon="mdi:arrow-right" />
        </button>
        <button
            title="下一鍵"
            on:click={() => dispatch("selectnext")}
            class="variant-ringed rounded-r-md p-2 hover:variant-ghost"
        >
            <Icon height="20" icon="mdi:check-circle-outline" />
        </button>
    </div>
    {#if clickStr === ""}
        <div class="px-2 text-xs opacity-70">click 爲空字串時, 預覽會在此處強制換行。</div>
    {/if}
</div>
