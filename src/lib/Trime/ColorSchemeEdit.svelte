<script lang="ts">
    import { getToastStore } from "@skeletonlabs/skeleton";
    import Icon from "@iconify/svelte";
    import Details from "$lib/Component/Details.svelte";
    import type { ColorScheme } from "./model/colorScheme";
    import { ColorValue } from "./model/color";
    import { COLOR_GROUPS, colorKeys, KNOWN_COLOR_IDS } from "./model/colorKeys";
    import ColorSelector from "./ColorSelector.svelte";
    import IconButton from "$lib/Component/IconButton.svelte";
    import { toastWarn } from "$lib/utils/error";

    export var scheme: ColorScheme;
    export var colorSchemes: ColorScheme[] = [];
    export var indexSchema: number = 0;
    export var fallbackColors: { [id: string]: string } = {};

    const toastStore = getToastStore();
    $: dupId =
        !!scheme.schemaId &&
        colorSchemes.some((s, i) => i !== indexSchema && s.schemaId === scheme.schemaId);
    $: emptyId = !scheme.schemaId.trim();

    var customName = "";
    const warnId = () => {
        if (emptyId) toastWarn(toastStore, "配色代碼不能為空");
        else if (dupId) toastWarn(toastStore, `配色代碼「${scheme.schemaId}」與另一份重複，導出時會互相覆蓋`);
    };
    const addCustom = () => {
        var name = customName.trim();
        if (!name) {
            toastWarn(toastStore, "顔色鍵名不能為空");
            return;
        }
        if (KNOWN_COLOR_IDS.has(name)) {
            toastWarn(toastStore, `「${name}」是內建配色欄，請改用上面的分組編輯`);
            return;
        }
        if (scheme.colors[name]) {
            toastWarn(toastStore, `顔色鍵「${name}」已存在`);
            return;
        }
        scheme.colors[name] = new ColorValue();
        customName = "";
        scheme = scheme;
    };
    const removeCustom = (id: string) => {
        delete scheme.colors[id];
        scheme = scheme;
    };
    const ensure = (id: string): ColorValue => {
        if (!scheme.colors[id]) scheme.colors[id] = new ColorValue();
        return scheme.colors[id];
    };
</script>

<div class="variant-soft flex w-full flex-col gap-3 rounded-md p-2">
    <div class="variant-ringed flex flex-col rounded-md p-[0.5px]">
        <div class="variant-ringed flex w-full items-center gap-2 rounded-t-md">
            <Icon icon="mdi:content-save-cog" class="h-10 w-10 p-2" />
            <span class="shrink grow">配色代碼</span>
            <input
                type="text"
                bind:value={scheme.schemaId}
                on:change={warnId}
                class="variant-ringed h-10 w-[40%] rounded-tr-md px-2 font-mono hover:variant-ghost"
                class:ring-2={dupId || emptyId}
                class:ring-warning-500={dupId || emptyId}
            />
        </div>
        {#if emptyId}
            <p class="px-2 py-1 text-xs text-warning-500">配色代碼不能為空</p>
        {:else if dupId}
            <p class="px-2 py-1 text-xs text-warning-500">配色代碼與另一份重複，導出時會互相覆蓋</p>
        {/if}
        <div class="variant-ringed flex w-full items-center gap-2">
            <Icon icon="mdi:rename-box" class="h-10 w-10 p-2" />
            <span class="shrink grow">顯示名稱</span>
            <input
                type="text"
                bind:value={scheme.name}
                class="variant-ringed h-10 w-[40%] rounded-none px-2 hover:variant-ghost"
            />
        </div>
        <div class="variant-ringed flex w-full items-center gap-2">
            <Icon icon="mdi:account-box" class="h-10 w-10 p-2" />
            <span class="shrink grow">作者</span>
            <input
                type="text"
                bind:value={scheme.author}
                class="variant-ringed h-10 w-[40%] rounded-none px-2 hover:variant-ghost"
            />
        </div>
        <div class="variant-ringed flex w-full items-center gap-2 rounded-b-md">
            <Icon icon="mdi:music" class="h-10 w-10 p-2" />
            <span class="shrink grow">音效</span>
            <input
                type="text"
                bind:value={scheme.sound}
                class="variant-ringed h-10 w-[40%] rounded-none rounded-br-md px-2 hover:variant-ghost"
            />
        </div>
    </div>

    {#key scheme.id}
        {#each COLOR_GROUPS as group}
            <Details summary={group.label}>
                <div class="flex flex-col gap-2 p-2">
                    {#each colorKeys.filter((k) => k.group === group.id) as meta}
                        <ColorSelector
                            title={meta.label}
                            value={ensure(meta.id)}
                            allowImage={!!meta.image}
                            {scheme}
                            colorId={meta.id}
                            {fallbackColors}
                        />
                    {/each}
                </div>
            </Details>
        {/each}

        <Details summary="額外顔色鍵">
            <div class="flex flex-col gap-2 p-2">
                <p class="text-xs opacity-70">
                    配色裡除上方內建欄位外的自訂鍵名（組標籤），可被其他顔色用「引用」指向。
                </p>
                {#each scheme.customLabels() as id}
                    <div class="flex w-full items-start gap-1">
                        <div class="min-w-0 flex-1">
                            <ColorSelector
                                title={id}
                                value={ensure(id)}
                                allowImage
                                {scheme}
                                colorId={id}
                                {fallbackColors}
                            />
                        </div>
                        <IconButton
                            icon="mdi:close"
                            title="刪除"
                            on:click={() => removeCustom(id)}
                            class="variant-ringed mt-1 h-8 w-8 shrink-0 rounded-md p-1 hover:variant-ghost"
                        />
                    </div>
                {/each}
                <div class="flex gap-1">
                    <input
                        bind:value={customName}
                        placeholder="新鍵名，如 my_accent"
                        class="variant-ringed h-8 min-w-0 grow rounded-md px-2 font-mono"
                    />
                    <IconButton
                        icon="mdi:plus"
                        on:click={addCustom}
                        class="variant-ringed h-8 shrink-0 rounded-md px-2 hover:variant-ghost"
                    >
                        添加
                    </IconButton>
                </div>
            </div>
        </Details>
    {/key}
</div>
