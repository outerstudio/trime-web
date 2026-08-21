<script lang="ts">
    import Icon from "@iconify/svelte";
    import Details from "$lib/Component/Details.svelte";
    import type { Theme } from "trime-web-core";
    import { Preedit } from "trime-web-core";
    import { CandidateWindow } from "trime-web-core";
    import { ToolBar } from "trime-web-core";
    import ToolBarEdit from "./ToolBarEdit.svelte";
    import FallbackColorsEdit from "./FallbackColorsEdit.svelte";
    import PresetKeysEdit from "./PresetKeysEdit.svelte";
    import { hideAllKeySymbols, restoreAllKeySymbols } from "trime-web-core";
    import { persistHideKeySymbols, bumpPreview } from "./utils/revision";

    export var theme: Theme;
    var styleAny: any;
    var labelsAny: any;
    var preeditAny: any;
    var windowAny: any;
    $: if (!theme.style.preedit) theme.style.preedit = new Preedit();
    $: if (!theme.style.window) theme.style.window = new CandidateWindow();
    $: if (!theme.style.toolBar) theme.style.toolBar = new ToolBar();
    $: styleAny = theme.style;
    $: labelsAny = theme.style.enter_labels;
    $: preeditAny = theme.style.preedit;
    $: windowAny = theme.style.window;
    $: canFollowSystem = theme.colorSchemes.length > 1;
    $: followSystem = canFollowSystem && theme.colorSchemes.some((s) => s.dark_scheme || s.light_scheme);
    $: darkSchemeId = theme.colorSchemes[0]?.dark_scheme || "";
    $: lightSchemeId = theme.colorSchemes[0]?.light_scheme || "";
    $: if (!canFollowSystem) {
        for (let s of theme.colorSchemes) {
            s.dark_scheme = "";
            s.light_scheme = "";
        }
    }

    const applyToneMeta = (dark: string, light: string) => {
        for (let s of theme.colorSchemes) {
            s.dark_scheme = dark;
            s.light_scheme = light;
        }
        theme.colorSchemes = theme.colorSchemes;
        bumpPreview();
    };
    const setFollowSystem = (on: boolean) => {
        if (!on || !canFollowSystem) {
            applyToneMeta("", "");
            return;
        }
        var ids = theme.colorSchemes.map((s) => s.schemaId);
        var pick = (want: string, fallback: number) =>
            ids.includes(want) ? want : ids[Math.min(fallback, ids.length - 1)] || ids[0];
        applyToneMeta(pick("dark", 1), pick("light", 0));
    };
    const setDarkScheme = (id: string) => {
        applyToneMeta(id, lightSchemeId || id);
    };
    const setLightScheme = (id: string) => {
        applyToneMeta(darkSchemeId || id, id);
    };
    const setPersistHideSymbols = (on: boolean) => {
        persistHideKeySymbols.set(on);
        if (on) hideAllKeySymbols(theme);
        else restoreAllKeySymbols(theme);
        theme.keyboards = theme.keyboards;
        bumpPreview();
    };
</script>

<div class="variant-soft flex w-full flex-col gap-3 rounded-md p-2">
    <div class="variant-ringed flex flex-col rounded-md p-[0.5px]">
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center rounded-tl-md px-2"><Icon icon="mdi:identifier" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">配置版本</span>
            <input bind:value={theme.config_version} class="variant-ringed h-10 w-[40%] rounded-tr-md px-2 font-mono" />
        </div>
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center px-2"><Icon icon="mdi:rename-box" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">主題名稱</span>
            <input bind:value={theme.name} class="variant-ringed h-10 w-[40%] px-2" />
        </div>
        <div class="flex w-full items-center">
            <div class="variant-ringed flex h-10 items-center rounded-bl-md px-2"><Icon icon="mdi:account-box" /></div>
            <span class="variant-ringed flex h-10 shrink grow items-center px-2">作者</span>
            <input bind:value={theme.author} class="variant-ringed h-10 w-[40%] rounded-br-md px-2" />
        </div>
    </div>

    <Details summary="功能">
        <div class="flex flex-col gap-2 p-2">
            <label class="flex items-center gap-2">
                <input type="checkbox" bind:checked={theme.style.auto_caps} />
                自動句首大寫
            </label>
            <label class="flex items-center gap-2">
                <input type="checkbox" bind:checked={theme.style.reset_ascii_mode_on_focus_change} />
                換輸入框時重置中／英
            </label>
            <label class="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={$persistHideKeySymbols}
                    on:change={(e) => setPersistHideSymbols((e.currentTarget as HTMLInputElement).checked)}
                />
                隱藏鍵面上方長按符號（如 中文 上的 關於）
            </label>
            <div class="flex items-center gap-2">
                <span class="shrink grow">深淺色切換</span>
                <select
                    value={followSystem ? "system" : "off"}
                    disabled={!canFollowSystem}
                    on:change={(e) => setFollowSystem((e.currentTarget as HTMLSelectElement).value === "system")}
                    class="variant-ringed h-8 w-[55%] rounded-md px-2 disabled:opacity-50"
                >
                    <option value="off">不跟隨系統</option>
                    <option value="system">跟隨系統</option>
                </select>
            </div>
            {#if followSystem}
                <div class="flex items-center gap-2">
                    <span class="shrink grow">深色</span>
                    <select
                        value={darkSchemeId}
                        on:change={(e) => setDarkScheme((e.currentTarget as HTMLSelectElement).value)}
                        class="variant-ringed h-8 w-[55%] rounded-md px-2 font-mono"
                    >
                        {#each theme.colorSchemes as s (s.id)}
                            <option value={s.schemaId}>{s.name}（{s.schemaId}）</option>
                        {/each}
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <span class="shrink grow">淺色</span>
                    <select
                        value={lightSchemeId}
                        on:change={(e) => setLightScheme((e.currentTarget as HTMLSelectElement).value)}
                        class="variant-ringed h-8 w-[55%] rounded-md px-2 font-mono"
                    >
                        {#each theme.colorSchemes as s (s.id)}
                            <option value={s.schemaId}>{s.name}（{s.schemaId}）</option>
                        {/each}
                    </select>
                </div>
            {/if}
            <div class="flex items-center gap-2">
                <span class="shrink grow">註釋位置</span>
                <select bind:value={theme.style.comment_position} class="variant-ringed h-8 rounded-md px-2">
                    <option value="right">右側</option>
                    <option value="top">上方</option>
                    <option value="overlay">疊在字上</option>
                </select>
            </div>
            <div class="flex items-center gap-2">
                <span class="shrink grow">鍵盤切換順序</span>
                <input
                    readonly
                    value={theme.keyboards.map((k) => k.schemaId || k.name).join(", ")}
                    class="variant-ringed h-8 w-[55%] min-w-0 rounded-md px-2 font-mono"
                />
            </div>
            <p class="text-xs opacity-70">
                按「切換鍵盤按鍵」會依此輪換。順序與右側鍵盤預覽縮圖相同，拖曳縮圖即可調整。
            </p>
        </div>
    </Details>

    <Details summary="候選、字號與邊距">
        <div class="flex flex-col gap-2 p-2">
            {#each [["keyboard_height", "鍵盤高度"], ["keyboard_height_land", "橫屏鍵盤高度"], ["key_height", "預設鍵高"], ["key_width", "預設鍵寬 %"], ["candidate_view_height", "候選區高度"], ["candidate_padding", "候選區內距"], ["candidate_spacing", "候選項間距"], ["candidate_text_size", "候選字號"], ["comment_text_size", "註釋字號"], ["comment_height", "註釋區高度"], ["label_text_size", "序號字號"], ["key_text_size", "鍵字號"], ["key_long_text_size", "長標籤字號"], ["symbol_text_size", "符號字號"], ["popup_height", "按鍵彈窗高度"], ["popup_width", "按鍵彈窗寛度"], ["popup_key_height", "彈窗選項高度"], ["popup_text_size", "按鍵彈窗字號"], ["popup_bottom_margin", "按鍵彈窗底距"], ["shadow_radius", "陰影半徑"], ["keyboard_padding", "左右邊距"], ["keyboard_padding_left", "左邊距"], ["keyboard_padding_right", "右邊距"], ["keyboard_padding_bottom", "底邊距"], ["keyboard_padding_land", "横屏左右邊距"], ["keyboard_padding_land_bottom", "横屏底邊距"]] as [field, label]}
                <div class="flex items-center gap-2">
                    <span class="shrink grow">{label}</span>
                    <input type="number" bind:value={styleAny[field]} class="variant-ringed h-8 w-24 rounded-md px-2" />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="字體檔名">
        <div class="flex flex-col gap-2 p-2">
            {#each [["candidate_font", "候選"], ["comment_font", "註釋"], ["key_font", "鍵盤"], ["label_font", "標籤"], ["latin_font", "西文"], ["symbol_font", "符號"], ["text_font", "編碼"], ["popup_font", "按鍵彈窗"], ["hanb_font", "擴充"], ["background_folder", "背景目錄"]] as [field, label]}
                <div class="flex items-center gap-2">
                    <span class="w-16">{label}</span>
                    <input bind:value={styleAny[field]} class="variant-ringed h-8 grow rounded-md px-2 font-mono" />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="Enter 標籤">
        <div class="flex flex-col gap-2 p-2">
            <div class="flex items-center gap-2">
                <span class="shrink grow">確定鍵文字</span>
                <select
                    value={theme.style.enter_label_mode}
                    on:change={(e) => {
                        theme.style.enter_label_mode = Number((e.currentTarget as HTMLSelectElement).value);
                    }}
                    class="variant-ringed h-8 rounded-md px-2"
                >
                    <option value={0}>用下面自訂</option>
                    <option value={1}>只用 App 提供的</option>
                    <option value={2}>優先用 App 提供的</option>
                    <option value={3}>沒有自訂時才用 App 的</option>
                </select>
            </div>
            {#each [["go", "前往"], ["done", "完成"], ["next", "下一個"], ["pre", "上一個"], ["search", "搜索"], ["send", "發送"], ["default", "預設"]] as [field, label]}
                <div class="flex items-center gap-2">
                    <span class="w-16">{label}</span>
                    <input bind:value={labelsAny[field]} class="variant-ringed h-8 grow rounded-md px-2" />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="預編輯區">
        <div class="flex flex-col gap-2 p-2">
            {#each [["horizontal_padding", "左右内距"], ["top_end_radius", "末上端圓角"], ["alpha", "透明度 0–1"], ["font_size", "字號"]] as [field, label]}
                <div class="flex items-center gap-2">
                    <span class="shrink grow">{label}</span>
                    <input
                        type="number"
                        step="any"
                        bind:value={preeditAny[field]}
                        class="variant-ringed h-8 w-24 rounded-md px-2"
                    />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="候選窗口">
        <div class="flex flex-col gap-2 p-2">
            {#each [["inset_vertical", "窗口上下内距"], ["inset_horizontal", "窗口左右内距"], ["item_padding_vertical", "候選上下内距"], ["item_padding_horizontal", "候選左右内距"], ["min_width", "最小寛度"], ["corner_radius", "圓角"], ["border", "邊框"], ["shadow", "陰影"], ["alpha", "透明度 0–1"], ["label_font_size", "序號字號"], ["text_font_size", "候選字號"], ["comment_font_size", "註釋字號"]] as [field, label]}
                <div class="flex items-center gap-2">
                    <span class="shrink grow">{label}</span>
                    <input
                        type="number"
                        step="any"
                        bind:value={windowAny[field]}
                        class="variant-ringed h-8 w-24 rounded-md px-2"
                    />
                </div>
            {/each}
        </div>
    </Details>

    <Details summary="工具欄">
        <ToolBarEdit bind:toolBar={theme.style.toolBar} />
    </Details>

    <Details summary="主題鍵">
        <PresetKeysEdit bind:presetKeys={theme.presetKeys} keyboards={theme.keyboards} />
    </Details>

    <Details summary="後備顔色">
        <FallbackColorsEdit bind:fallbackColors={theme.fallbackColors} />
    </Details>
</div>
