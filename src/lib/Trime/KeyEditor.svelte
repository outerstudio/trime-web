<script lang="ts">
    import { Key } from "./model/key";
    import type { Keyboard } from "./model/keyboard";
    import type { PresetKey } from "./model/presetKey";
    import { wrapKeys } from "./utils/layout";
    import { bumpPreview } from "./utils/revision";
    import { hideNewKeyIfPersisted } from "./utils/labelSymbol";
    import KeyEdit from "./KeyEdit.svelte";

    export var keyboard: Keyboard;
    export var selected: { row: number; col: number };
    export var extraNames: string[] = [];
    export var presetKeys: PresetKey[] = [];
    export var keyboards: Keyboard[] = [];
    export var enterLabel: string = "Enter";
    export var defaultWidth: number = 10;

    var clipKey: Key = new Key();
    var selectedKey: Key = new Key();

    $: rows = wrapKeys(keyboard.keys, keyboard.columns, defaultWidth || 10);
    $: {
        if (selected.row < rows.length && selected.col < rows[selected.row].length) {
            selectedKey = rows[selected.row][selected.col];
        } else {
            selectedKey = keyboard.keys[0] || new Key();
        }
    }

    function indexOfKey(key: Key): number {
        return keyboard.keys.findIndex((k) => k.id === key.id);
    }

    function selectNextKey() {
        if (!keyboard.keys.length) {
            selected = { row: 0, col: 0 };
            return;
        }
        var i = indexOfKey(selectedKey);
        var next = keyboard.keys[(i + 1) % keyboard.keys.length];
        syncSelected(next);
    }

    function syncSelected(key: Key) {
        var rs = wrapKeys(keyboard.keys, keyboard.columns, defaultWidth || 10);
        for (let r = 0; r < rs.length; r++) {
            for (let c = 0; c < rs[r].length; c++) {
                if (rs[r][c].id === key.id) {
                    selected = { row: r, col: c };
                    return;
                }
            }
        }
    }

    function delKey() {
        var i = indexOfKey(selectedKey);
        if (i >= 0) {
            keyboard.keys.splice(i, 1);
            keyboard.keys = keyboard.keys;
            bumpPreview();
        }
    }
    function moveLeft() {
        var i = indexOfKey(selectedKey);
        if (i > 0) {
            [keyboard.keys[i], keyboard.keys[i - 1]] = [keyboard.keys[i - 1], keyboard.keys[i]];
            keyboard.keys = keyboard.keys;
            bumpPreview();
            syncSelected(keyboard.keys[i - 1]);
        }
    }
    function moveRight() {
        var i = indexOfKey(selectedKey);
        if (i >= 0 && i < keyboard.keys.length - 1) {
            [keyboard.keys[i], keyboard.keys[i + 1]] = [keyboard.keys[i + 1], keyboard.keys[i]];
            keyboard.keys = keyboard.keys;
            bumpPreview();
            syncSelected(keyboard.keys[i + 1]);
        }
    }
    function copyKey() {
        clipKey = selectedKey.clone();
    }
    function pasteKey() {
        var i = indexOfKey(selectedKey);
        if (i >= 0) {
            keyboard.keys[i] = clipKey.clone();
            hideNewKeyIfPersisted(keyboard.keys[i]);
            keyboard.keys = keyboard.keys;
            bumpPreview();
        }
    }
</script>

<div class="variant-soft w-full rounded-md">
    <KeyEdit
        bind:key={selectedKey}
        {keyboard}
        {keyboards}
        bind:presetKeys
        {extraNames}
        {enterLabel}
        on:selectnext={selectNextKey}
        on:delkey={delKey}
        on:moveleft={moveLeft}
        on:moveright={moveRight}
        on:copykey={copyKey}
        on:pastekey={pasteKey}
    />
</div>
