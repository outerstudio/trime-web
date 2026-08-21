<script lang="ts">
    import { ColorValue, type ColorKind } from "trime-web-core";
    import { colorKeys } from "trime-web-core";
    import type { ColorScheme } from "trime-web-core";
    import { resolveColor } from "trime-web-core";
    import { bumpPreview } from "./utils/revision";

    export var value: ColorValue = new ColorValue();
    export var title: string = "顔色";
    export var allowImage: boolean = false;
    export var scheme: ColorScheme | undefined = undefined;
    export var colorId: string = "";
    export var fallbackColors: { [id: string]: string } = {};

    const kinds: { id: ColorKind; label: string }[] = [
        { id: "color", label: "顔色" },
        { id: "ref", label: "引用" },
        { id: "image", label: "圖片" },
    ];

    $: effective = scheme && colorId ? resolveColor(scheme, colorId, fallbackColors) : value;
    $: preview = value.kind === "color" && !value.isEmpty() ? value.rgba() : effective.rgba();
    $: hexText = value.hexInput();

    var typing = false;
    var before = "";
    const onTyping = () => {
        typing = true;
        before = value.color;
    };
    const postTyping = () => {
        typing = false;
        if (!value.color) return;
        var parsed = ColorValue.fromAny(value.color.startsWith("#") ? value.color : "#" + value.color);
        if (parsed.kind === "color" && parsed.color) {
            value.color = parsed.color;
            if (parsed.alpha !== 0xff) value.alpha = parsed.alpha;
        } else {
            value.color = before;
        }
        touch();
    };
    const touch = () => {
        value = value;
        bumpPreview();
    };
    const setKind = (kind: ColorKind) => {
        value.kind = kind;
        touch();
    };
</script>

<div class="flex w-full flex-col gap-1">
    <div class="flex w-full items-center gap-2">
        <span class="flex items-center px-2 py-1">
            {#if value.kind === "color"}
                <input
                    type="color"
                    value={value.color || "#000000"}
                    on:input={(e) => {
                        value.kind = "color";
                        value.color = (e.currentTarget as HTMLInputElement).value;
                        touch();
                    }}
                    class="input !h-6 !w-6 !rounded-sm"
                />
            {:else}
                <span
                    class="inline-block h-6 w-6 rounded-sm border"
                    style:background-color={preview || "#888888"}
                    title="解析後顔色"
                ></span>
            {/if}
        </span>
        <span class="shrink grow">{title}</span>
        {#each kinds as k}
            {#if k.id !== "image" || allowImage}
                <button
                    class="rounded px-1 text-xs"
                    class:variant-soft={value.kind === k.id}
                    on:click={() => setKind(k.id)}
                >
                    {k.label}
                </button>
            {/if}
        {/each}
    </div>
    {#if value.kind === "color"}
        <div class="flex w-full items-center gap-2 px-2">
            {#if typing}
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    type="text"
                    bind:value={value.color}
                    autofocus
                    on:input={touch}
                    on:blur={postTyping}
                    class="code w-24 shrink-0 px-1"
                />
            {:else}
                <button type="button" on:click={onTyping} class="code w-24 shrink-0 px-1 text-left opacity-80">
                    {hexText || "未設"}
                </button>
            {/if}
            <input
                type="range"
                min="0"
                max="255"
                step="1"
                value={value.alpha}
                on:input={(e) => {
                    value.alpha = Number((e.currentTarget as HTMLInputElement).value);
                    touch();
                }}
                class="min-w-0 grow"
            />
            <span class="code w-6 shrink-0">{value.alpha.toString(16).toUpperCase().padStart(2, "0")}</span>
        </div>
    {:else if value.kind === "ref"}
        <input
            list="trime-color-refs"
            bind:value={value.ref}
            on:input={touch}
            placeholder="組標籤, 如 key_back_color"
            class="variant-ringed h-8 w-full rounded-md px-2 font-mono"
        />
        <datalist id="trime-color-refs">
            {#each colorKeys as meta}
                <option value={meta.id}>{meta.label}</option>
            {/each}
        </datalist>
    {:else}
        <input
            bind:value={value.image}
            on:input={touch}
            placeholder="背景圖片檔名, 如 bg.png"
            class="variant-ringed h-8 w-full rounded-md px-2 font-mono"
        />
    {/if}
</div>
