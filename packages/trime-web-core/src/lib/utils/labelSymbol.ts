import YAML from "yaml";
import type { Theme } from "../model/theme";
import type { Keyboard } from "../model/keyboard";
import type { Key } from "../model/key";

export const ORIG_LABEL_SYMBOL = "__orig_label_symbol";
const HIDE_FACE = " ";

export function hasSavedKeySymbols(theme: Theme): boolean {
    return theme.keyboards.some((kb) => kb.keys.some((k) => k.labelSymbolSaved !== undefined));
}

export function hideKeySymbol(key: Key): void {
    if (key.labelSymbolSaved === undefined) {
        key.labelSymbolSaved = key.label_symbol;
    }
    key.label_symbol = HIDE_FACE;
}

export function hideAllKeySymbols(theme: Theme): void {
    for (let kb of theme.keyboards) {
        for (let key of kb.keys) hideKeySymbol(key);
    }
}

export function restoreAllKeySymbols(theme: Theme): void {
    for (let kb of theme.keyboards) {
        for (let key of kb.keys) {
            if (key.labelSymbolSaved === undefined) continue;
            key.label_symbol = key.labelSymbolSaved;
            key.labelSymbolSaved = undefined;
        }
    }
}

/** Hide symbols on every key when the host asks for persisted hide mode. */
export function hideKeysOnKeyboardIfPersisted(keyboard: Keyboard, persistHide: boolean): void {
    if (!persistHide) return;
    for (let key of keyboard.keys) hideKeySymbol(key);
}

/** Hide symbols on a newly created key when the host asks for persisted hide mode. */
export function hideNewKeyIfPersisted(key: Key, persistHide: boolean): void {
    if (!persistHide) return;
    hideKeySymbol(key);
}

function pairKeyName(pair: YAML.Pair): string {
    var k = pair.key;
    if (YAML.isScalar(k)) return String(k.value);
    return String(k ?? "");
}

function walkYaml(node: YAML.ParsedNode | YAML.Pair | null | undefined, visitMap: (map: YAML.YAMLMap) => void): void {
    if (!node) return;
    if (YAML.isPair(node)) {
        walkYaml(node.value as YAML.ParsedNode, visitMap);
        return;
    }
    if (YAML.isSeq(node)) {
        for (let item of node.items) walkYaml(item as YAML.ParsedNode, visitMap);
        return;
    }
    if (YAML.isMap(node)) {
        visitMap(node);
        for (let item of node.items) walkYaml(item.value as YAML.ParsedNode, visitMap);
    }
}

export function attachOrigLabelSymbols(obj: any, theme: Theme, persistHide = false): void {
    if (!obj || !obj.preset_keyboards) return;
    if (persistHide) hideAllKeySymbols(theme);
    for (let kb of theme.keyboards) {
        var id = kb.schemaId || kb.name;
        var kbObj = obj.preset_keyboards[id];
        if (!kbObj || !Array.isArray(kbObj.keys)) continue;
        kb.keys.forEach((key, i) => {
            // A saved original belongs to this key, not to the whole theme.
            if (key.labelSymbolSaved === undefined) return;
            var item = kbObj.keys[i];
            if (item === undefined || item === null) return;
            if (typeof item !== "object") {
                item = { click: item };
                kbObj.keys[i] = item;
            }
            item.label_symbol = key.label_symbol;
            item[ORIG_LABEL_SYMBOL] = key.labelSymbolSaved;
        });
    }
}

export function origFieldsToComments(node: YAML.ParsedNode | null | undefined): void {
    walkYaml(node, (map) => {
        var origIdx = map.items.findIndex((p) => pairKeyName(p) === ORIG_LABEL_SYMBOL);
        if (origIdx < 0) return;
        var origPair = map.items[origIdx];
        var origNode = origPair.value;
        var orig = YAML.isScalar(origNode) ? origNode.value : "";
        var symPair = map.items.find((p) => pairKeyName(p) === "label_symbol");
        if (!symPair) {
            symPair = new YAML.Pair("label_symbol", HIDE_FACE);
            map.items.push(symPair);
        }
        if (!YAML.isScalar(symPair.value)) {
            symPair.value = new YAML.Scalar(HIDE_FACE);
        }
        (symPair.value as YAML.Scalar).comment = ` orig_label_symbol: ${JSON.stringify(orig ?? "")}`;
        map.items.splice(origIdx, 1);
    });
}

export function commentsToOrigFields(node: YAML.ParsedNode | null | undefined): void {
    walkYaml(node, (map) => {
        var symPair = map.items.find((p) => pairKeyName(p) === "label_symbol");
        if (!symPair) return;
        var comment = "";
        if (YAML.isNode(symPair.value) && symPair.value.comment) comment += symPair.value.comment;
        var pairComment = (symPair as any).comment;
        if (pairComment) comment += "\n" + pairComment;
        var m = comment.match(/orig_label_symbol:\s*(.*)$/m);
        if (!m) return;
        var raw = m[1].trim();
        var orig = "";
        try {
            orig = JSON.parse(raw);
        } catch {
            orig = raw.replace(/^["']|["']$/g, "");
        }
        map.set(ORIG_LABEL_SYMBOL, orig);
    });
}

export function stringifyYamlWithSymbolComments(obj: any): string {
    var hasOrig = false;
    var visit = (node: any) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (Object.prototype.hasOwnProperty.call(node, ORIG_LABEL_SYMBOL)) hasOrig = true;
        for (let v of Object.values(node)) visit(v);
    };
    visit(obj);
    if (!hasOrig) return YAML.stringify(obj);
    var doc = YAML.parseDocument(YAML.stringify(obj));
    origFieldsToComments(doc.contents);
    return String(doc);
}
