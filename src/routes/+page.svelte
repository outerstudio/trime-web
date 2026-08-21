<script lang="ts">
    import { browser } from "$app/environment";
    import { onNavigate } from "$app/navigation";
    import { fade } from "svelte/transition";
    import Icon from "@iconify/svelte";

    import SmoothDiv from "$lib/Component/SmoothDiv.svelte";
    import Details from "$lib/Component/Details.svelte";
    import { Theme } from "trime-web-renderer";
    import ColorsEditor from "$lib/Trime/ColorSchemeEdit.svelte";
    import SchemaGallery from "$lib/Trime/ColorSchemeGallery.svelte";
    import KeyboardEdit from "$lib/Trime/KeyboardEdit.svelte";
    import KeyboardGallery from "$lib/Trime/KeyboardGallery.svelte";
    import Preview from "$lib/Trime/Preview.svelte";
    import ExportBar from "$lib/Trime/ExportBar.svelte";
    import BatchKeyEdit from "$lib/Trime/BatchKeyEdit.svelte";
    import PredefinedLayout from "$lib/Trime/PredefinedLayout.svelte";
    import PredefinedColor from "$lib/Trime/PredefinedColor.svelte";
    import CustomLayout from "$lib/Trime/CustomLayout.svelte";
    import StyleEdit from "$lib/Trime/StyleEdit.svelte";
    import KeyEdit from "$lib/Trime/KeyEditor.svelte";
    import Manual from "$lib/Trime/Manual.svelte";
    import { loadTheme, saveTheme, THEME_STORAGE_KEY } from "$lib/Trime/utils/recovery";
    import { bumpPreview, previewRevision } from "$lib/Trime/utils/revision";

    var theme: Theme = new Theme();
    var indexSchema = 0;
    var indexKeyboard = 0;
    $: currentSchema = theme.colorSchemes[indexSchema];
    $: currentKeyboard = theme.keyboards[indexKeyboard];
    $: extraNames = theme.presetKeys.map((p) => p.id);
    $: if (indexSchema >= theme.colorSchemes.length) indexSchema = 0;
    $: if (indexKeyboard >= theme.keyboards.length) indexKeyboard = 0;

    var predefinedKeyboards: object[] = [];
    var predefinedSchemes: object[] = [];
    var customThemes: object[];

    const [actExport, actTemp, actSave, actBatch] = [1, 2, 3, 4];
    var actionTab = 0;
    const actNames = {
        [actSave]: "儲存/讀取",
        [actExport]: "導出/導入",
        [actTemp]: "載入模板",
        [actBatch]: "佈局編輯",
    };
    const selectActTab = (tab: number) => {
        // Sticky CSS already requires !actionTab; do not clear stickyPreview here
        // or panel on:done leaves 置頂 cancelled.
        actionTab = actionTab === tab ? 0 : tab;
    };
    const collapseActionPanel = () => {
        actionTab = 0;
    };

    var editorTab = 0;
    const [editKey, editColor, editLayout] = [0, 1, 2];
    const editNames = {
        [editKey]: "按鍵",
        [editColor]: "配色",
        [editLayout]: "鍵盤",
    };
    const selectEditTab = (tab: number) => {
        editorTab = tab;
    };

    var selectedKey: { row: number; col: number } = { row: 0, col: 0 };
    const selectKey = (row: number, col: number) => {
        selectedKey = { row, col };
    };

    var stickyPreview = true;
    var landscapePreview = false;
    const onStickyClick = () => {
        stickyPreview = !stickyPreview;
        if (stickyPreview) {
            actionTab = 0;
        }
    };

    const recoveryKey = THEME_STORAGE_KEY;
    const loadLocalData = () => {
        const saved = loadTheme(recoveryKey);
        if (saved) theme = saved;
        if (indexSchema >= theme.colorSchemes.length) indexSchema = 0;
        if (indexKeyboard >= theme.keyboards.length) indexKeyboard = 0;
    };
    const saveLocalData = () => {
        saveTheme(recoveryKey, theme);
    };
    const onVisibilityChange = (e: Event & { currentTarget: EventTarget & Document }) => {
        if (e.currentTarget.visibilityState === "hidden") {
            saveLocalData();
        }
    };
    onNavigate(saveLocalData);
    if (browser) {
        loadLocalData();
    }
</script>

<svelte:document on:visibilitychange={onVisibilityChange} />
<svelte:window on:input={bumpPreview} on:change={bumpPreview} />

<div
    class="gap-4 max-lg:flex max-lg:flex-col lg:grid lg:grid-cols-2"
    on:input={bumpPreview}
    on:change={bumpPreview}
>
    <div
        class="-top-44 z-10 flex flex-col gap-4 py-3 lg:col-start-2 lg:h-full"
        class:sticky={!actionTab && stickyPreview}
    >
        <div class="variant-ringed mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-md">
            <div class="flex h-10 items-stretch">
                {#each [actSave, actExport, actTemp, actBatch] as tab}
                    <button
                        on:click={() => {
                            selectActTab(tab);
                        }}
                        class:variant-soft={actionTab === tab}
                        class="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 text-sm hover:variant-ghost"
                    >
                        {actNames[tab]}
                        {#if actionTab === tab}
                            <Icon icon="mdi:chevron-up" class="h-4 w-4 shrink-0 opacity-70" />
                        {/if}
                    </button>
                {/each}
            </div>
            <SmoothDiv height outerClass="w-full" class="w-full">
                {#if actionTab === actExport}
                    <div in:fade class="w-full p-2">
                        <ExportBar bind:theme on:done={collapseActionPanel} />
                    </div>
                {:else if actionTab === actTemp}
                    <div
                        in:fade
                        class="flex max-h-[40vh] w-full flex-col gap-2 overflow-y-auto p-2"
                    >
                        <div class="text-sm opacity-80">鍵盤模板</div>
                        <PredefinedLayout
                            bind:keyboard={currentKeyboard}
                            bind:predefinedKeyboards
                            on:done={collapseActionPanel}
                        />
                        {#if currentSchema}
                            <div class="text-sm opacity-80">配色模板</div>
                            <PredefinedColor
                                bind:scheme={currentSchema}
                                bind:predefinedSchemes
                                on:done={collapseActionPanel}
                            />
                        {/if}
                    </div>
                {:else if actionTab === actSave}
                    <div in:fade class="w-full p-2">
                        <CustomLayout bind:theme bind:customThemes on:done={collapseActionPanel} />
                    </div>
                {:else if actionTab === actBatch}
                    <div in:fade class="w-full p-2">
                        <BatchKeyEdit bind:keyboard={currentKeyboard} on:done={collapseActionPanel} />
                    </div>
                {/if}
            </SmoothDiv>
        </div>

        <div class="mx-auto flex w-full max-w-xl flex-col gap-4 px-1">
            <div class="variant-ringed flex flex-col rounded-md">
                <div class="variant-ringed flex h-10 items-center justify-center rounded-t-md">配色</div>
                <div class="overflow-x-auto px-1 pb-3 pt-4">
                    <SchemaGallery
                        bind:colorSchemes={theme.colorSchemes}
                        bind:indexSchema
                        {currentSchema}
                        fallbackColors={theme.fallbackColors}
                    />
                </div>
            </div>
            <div class="variant-ringed flex flex-col rounded-md">
                <div class="variant-ringed flex h-10 items-center justify-center rounded-t-md">鍵盤</div>
                <div class="overflow-x-auto px-1 pb-3 pt-4">
                    <KeyboardGallery
                        bind:keyboards={theme.keyboards}
                        bind:indexKeyboard
                        {currentKeyboard}
                        defaultWidth={currentKeyboard?.width || theme.style.key_width}
                    />
                </div>
            </div>
        </div>

        <div
            class:max-w-xl={!landscapePreview}
            class:max-w-3xl={landscapePreview}
            class:sticky={!actionTab && stickyPreview}
            class="top-2 mx-auto w-full overflow-x-auto"
        >
            {#if currentSchema && currentKeyboard}
                {#key $previewRevision}
                    <Preview
                        sticky={stickyPreview}
                        bind:landscape={landscapePreview}
                        scheme={currentSchema}
                        keyboard={currentKeyboard}
                        style={theme.style}
                        fallbackColors={theme.fallbackColors}
                        presetKeys={theme.presetKeys}
                        selected={selectedKey}
                        revision={$previewRevision}
                        on:clicked={(event) => {
                            selectKey(event.detail.row, event.detail.col);
                        }}
                        on:sticky={onStickyClick}
                    />
                {/key}
            {/if}
        </div>
    </div>

    <div class="flex flex-col gap-4 py-3 lg:row-start-1 lg:h-full lg:overflow-y-auto">
        <div class="mx-auto w-full max-w-xl px-1">
            <Details summary="假裝你不會用點這裡看一下可能有用的說明書">
                <span slot="summary" class="flex h-10 w-full items-center justify-center">假裝你不會用點這裡看一下可能有用的說明書</span>
                <div class="p-2">
                    <Manual />
                </div>
            </Details>
        </div>
        <div class="mx-auto w-full max-w-xl px-1">
            <Details summary="主題" open>
                <span slot="summary" class="flex h-10 w-full items-center justify-center">主題</span>
                <div class="flex flex-col gap-3 p-1">
                    <StyleEdit bind:theme />
                </div>
            </Details>
        </div>
        <div class="variant-ringed mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-md">
            <div class="flex min-h-10 items-stretch">
                {#each [editKey, editColor, editLayout] as tab}
                    <button
                        type="button"
                        on:click={() => {
                            selectEditTab(tab);
                        }}
                        class:variant-soft={editorTab === tab}
                        class="flex min-w-0 flex-1 items-center justify-center px-2 py-1 text-sm hover:variant-ghost"
                    >
                        {editNames[tab]}
                    </button>
                {/each}
            </div>

            <SmoothDiv height outerClass="w-full" class="w-full max-sm:text-sm">
                {#if editorTab === editColor && currentSchema}
                    <div in:fade class="w-full lg:overflow-y-auto">
                        <ColorsEditor
                            scheme={theme.colorSchemes[indexSchema]}
                            bind:colorSchemes={theme.colorSchemes}
                            bind:indexSchema
                            fallbackColors={theme.fallbackColors}
                        />
                    </div>
                {:else if editorTab === editLayout && currentKeyboard}
                    <div in:fade class="w-full lg:overflow-y-auto">
                        <KeyboardEdit
                            bind:keyboard={currentKeyboard}
                            extraIds={theme.keyboards.map((k) => k.schemaId)}
                        />
                    </div>
                {:else if editorTab === editKey && currentKeyboard}
                    <div in:fade class="flex w-full flex-col gap-2 lg:overflow-y-auto">
                        <KeyEdit
                            bind:keyboard={currentKeyboard}
                            bind:selected={selectedKey}
                            bind:presetKeys={theme.presetKeys}
                            keyboards={theme.keyboards}
                            {extraNames}
                            enterLabel={theme.style.enter_labels?.default || "Enter"}
                            defaultWidth={currentKeyboard?.width || theme.style.key_width}
                        />
                    </div>
                {/if}
            </SmoothDiv>
        </div>
    </div>
</div>
