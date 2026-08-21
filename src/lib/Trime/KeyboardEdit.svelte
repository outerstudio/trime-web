<script lang="ts">
    import { getToastStore } from "@skeletonlabs/skeleton";
    import Icon from "@iconify/svelte";
    import type { Keyboard } from "trime-web-core";
    import KeyboardIdInput from "./KeyboardIdInput.svelte";
    import { bumpPreview } from "./utils/revision";
    import { toastWarn } from "$lib/utils/error";

    export var keyboard: Keyboard;
    export var extraIds: string[] = [];
    $: keyboardAny = keyboard as any;
    const toastStore = getToastStore();
    $: dupKb = extraIds.filter((id) => id && id === keyboard.schemaId).length > 1;
    $: emptyKb = !keyboard.schemaId.trim();
    const warnKbId = () => {
        if (emptyKb) toastWarn(toastStore, "鍵盤代碼不能為空");
        else if (dupKb) toastWarn(toastStore, `鍵盤代碼「${keyboard.schemaId}」與另一張重複，切換鍵盤會對不上`);
    };

    $: openLang = keyboard.reset_ascii_mode ? (keyboard.ascii_mode === 1 ? "en" : "zh") : "last";

    const setOpenLang = (v: string) => {
        if (v === "en") {
            keyboard.ascii_mode = 1;
            keyboard.reset_ascii_mode = true;
        } else if (v === "last") {
            keyboard.reset_ascii_mode = false;
        } else {
            keyboard.ascii_mode = 0;
            keyboard.reset_ascii_mode = true;
        }
        bumpPreview();
    };
</script>

<div class="variant-soft flex w-full flex-col gap-2 rounded-md p-2">
    <div class="variant-ringed flex flex-col rounded-md p-[0.5px]">
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center rounded-tl-md px-2"><Icon icon="mdi:identifier" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">鍵盤代碼</span>
            <KeyboardIdInput
                bind:value={keyboard.schemaId}
                extraIds={extraIds.filter((id) => id !== keyboard.schemaId)}
                inputClass="variant-ringed h-10 min-w-0 grow rounded-tr-md px-2 font-mono {dupKb || emptyKb
                    ? 'ring-2 ring-warning-500'
                    : ''}"
                on:change={warnKbId}
            />
        </div>
        {#if emptyKb}
            <p class="px-2 py-1 text-xs text-warning-500">鍵盤代碼不能為空</p>
        {:else if dupKb}
            <p class="px-2 py-1 text-xs text-warning-500">鍵盤代碼與另一張重複</p>
        {/if}
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center px-2"><Icon icon="mdi:rename-box" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">名稱</span>
            <input bind:value={keyboard.name} class="variant-ringed h-10 w-[50%] px-2" />
        </div>
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center rounded-bl-md px-2"><Icon icon="mdi:account-box" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">作者</span>
            <input bind:value={keyboard.author} class="variant-ringed h-10 w-[50%] rounded-br-md px-2" />
        </div>
    </div>

    <div class="flex w-full items-center gap-2">
        <Icon icon="mdi:ideogram-cjk" class="h-10 w-10 shrink-0 p-2" />
        <span class="min-w-0 grow">一打開鍵盤</span>
        <select
            value={openLang}
            on:change={(e) => setOpenLang((e.currentTarget as HTMLSelectElement).value)}
            class="variant-ringed h-8 w-[55%] shrink-0 rounded-md px-2"
        >
            <option value="zh">每次都先打中文</option>
            <option value="en">每次都先打英文</option>
            <option value="last">打上一次的語言</option>
        </select>
    </div>
    <div class="flex w-full items-center gap-2">
        <Icon icon="mdi:lock-outline" class="h-10 w-10 shrink-0 p-2" />
        <span class="min-w-0 grow">換 App 時</span>
        <select
            value={keyboard.lock ? "remember" : "default"}
            on:change={(e) => {
                keyboard.lock = (e.currentTarget as HTMLSelectElement).value === "remember";
                bumpPreview();
            }}
            class="variant-ringed h-8 w-[55%] shrink-0 rounded-md px-2"
        >
            <option value="remember">記得上一個鍵盤</option>
            <option value="default">永遠用預設</option>
        </select>
    </div>
    <div class="flex w-full items-center gap-2">
        <Icon icon="mdi:format-letter-case" class="h-10 w-10 shrink-0 p-2" />
        <span class="min-w-0 grow">字母鍵面</span>
        <select bind:value={keyboard.label_transform} class="variant-ringed h-8 w-[55%] shrink-0 rounded-md px-2">
            <option value="">照原樣（q w e）</option>
            <option value="uppercase">顯示大寫（Q W E）</option>
        </select>
    </div>
    <div class="flex w-full items-center gap-2">
        <Icon icon="mdi:keyboard-outline" class="h-10 w-10 shrink-0 p-2" />
        <span class="min-w-0 grow">在中文切換到英文時用</span>
        <KeyboardIdInput
            bind:value={keyboard.ascii_keyboard}
            {extraIds}
            allowEmpty
            includeSpecial
            outerClass="flex h-8 min-w-0 w-[55%] shrink-0 items-stretch overflow-hidden"
            inputClass="variant-ringed h-8 min-w-0 grow rounded-r-md px-2 font-mono"
        />
    </div>
    <p class="pl-12 text-xs opacity-70">空白＝還是用這一張，只是中／英狀態變了（空格上的方案名、中文鍵等）。</p>

    {#each [["width", "鍵寛 %"], ["height", "鍵高"], ["round_corner", "圓角"], ["horizontal_gap", "水平間距"], ["vertical_gap", "行距"], ["keyboard_height", "鍵盤高度"], ["keyboard_height_land", "横屏鍵盤高度"], ["key_symbol_offset_x", "角標左右偏移"], ["key_symbol_offset_y", "角標上下偏移"], ["key_text_offset_x", "主字左右偏移"], ["key_text_offset_y", "主字上下偏移"], ["key_hint_offset_x", "助記左右偏移"], ["key_hint_offset_y", "助記上下偏移"]] as [field, label]}
        <div class="flex w-full items-center gap-2">
            <span class="min-w-0 grow pl-2">{label}</span>
            <input
                type="number"
                bind:value={keyboardAny[field]}
                class="variant-ringed h-8 w-[55%] shrink-0 rounded-md px-2"
            />
        </div>
    {/each}
    <p class="pl-2 text-xs opacity-70">字號 0＝用主題預設。偏移單位為像素；右、下為正。角標預設在鍵面上緣置中。候選／編碼字號仍在主題裡，全主題共用。</p>
</div>
