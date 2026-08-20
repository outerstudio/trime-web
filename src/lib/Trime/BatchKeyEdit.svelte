<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Keyboard } from "./model/keyboard";
    import { Key } from "./model/key";
    import IconButton from "$lib/Component/IconButton.svelte";
    import { bumpPreview } from "./utils/revision";
    import { hideNewKeyIfPersisted } from "./utils/labelSymbol";

    export var keyboard: Keyboard;
    const dispatch = createEventDispatcher();

    const classNames = "p-2 gap-2 h-8 w-full flex items-center !justify-start rounded-md hover:variant-ghost";
    const finish = () => dispatch("done");

    function insertKey() {
        var k = new Key();
        hideNewKeyIfPersisted(k);
        keyboard.keys.push(k);
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
    function duplicateLast() {
        if (!keyboard.keys.length) return finish();
        var k = keyboard.keys[keyboard.keys.length - 1].clone();
        hideNewKeyIfPersisted(k);
        keyboard.keys.push(k);
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
    function deleteLast() {
        keyboard.keys.pop();
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
    function setAllWidth(w: number) {
        for (let key of keyboard.keys) key.width = w;
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
    function insertBreak() {
        var k = new Key();
        k.click = "";
        k.clickEmpty = true;
        hideNewKeyIfPersisted(k);
        keyboard.keys.push(k);
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
    /** 長按是預設鍵 id／宏時，角標會變成長字串疊在鍵中央；空白角標可藏顯示仍保留長按 */
    function hideMultiCharSymbols() {
        const keep = (lc: any): boolean => {
            if (lc == null || lc === "") return true;
            var s = String(lc);
            return s.length <= 2 && !/[{}]/.test(s) && !/^[A-Za-z_]/.test(s);
        };
        for (let key of keyboard.keys) {
            if (!key.long_click) continue;
            if (key.label_symbol.length > 0 && key.label_symbol.trim() === "") continue;
            if (keep(key.long_click)) continue;
            if (key.labelSymbolSaved === undefined) key.labelSymbolSaved = key.label_symbol;
            key.label_symbol = " ";
        }
        if (keyboard.key_symbol_offset_y > 6) keyboard.key_symbol_offset_y = 0;
        keyboard.keys = keyboard.keys;
        bumpPreview();
        finish();
    }
</script>

<div class="flex flex-col gap-1">
    <IconButton icon="mdi:plus" on:click={insertKey} class={classNames}><span>在末尾插入按鍵</span></IconButton>
    <IconButton icon="mdi:content-duplicate" on:click={duplicateLast} class={classNames}
        ><span>複製末鍵</span></IconButton
    >
    <IconButton icon="mdi:minus" on:click={deleteLast} class={classNames}><span>删除末鍵</span></IconButton>
    <IconButton icon="mdi:arrow-down" on:click={insertBreak} class={classNames}
        ><span>插入強制換行</span></IconButton
    >
    <IconButton icon="mdi:table-column" on:click={() => setAllWidth(10)} class={classNames}
        ><span>全部鍵寛設爲 10</span></IconButton
    >
    <IconButton
        icon="mdi:label-off-outline"
        title="長按若是 cut／select_all 等主題鍵，同文會把整段字當角標；角標上下偏移過大也會疊到主字上"
        on:click={hideMultiCharSymbols}
        class={classNames}
    >
        <span>隱藏多字長按角標</span>
    </IconButton>
</div>
