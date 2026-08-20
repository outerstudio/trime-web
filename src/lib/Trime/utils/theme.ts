import YAML from "yaml";
import { Theme } from "$lib/Trime/model/theme";
import { Style } from "$lib/Trime/model/style";
import { ColorScheme } from "$lib/Trime/model/colorScheme";
import { PresetKey } from "$lib/Trime/model/presetKey";
import { Keyboard } from "$lib/Trime/model/keyboard";
import { Key, TRIGGER_SLOTS } from "$lib/Trime/model/key";
import { BUILTIN_PRESET_KEYS } from "$lib/Trime/utils/keydefs";
import {
    attachOrigLabelSymbols,
    commentsToOrigFields,
    hideAllKeySymbols,
    hasSavedKeySymbols,
    stringifyYamlWithSymbolComments,
    syncPersistHideStore,
} from "./labelSymbol";
import { get } from "svelte/store";
import { persistHideKeySymbols } from "./revision";

export type ImportWarning = string;

export const THEME_STORAGE_KEY = "recoveryTrimeTheme";

function switchListFromKeyboards(keyboards: Keyboard[]): string[] {
    return keyboards.map((k) => k.schemaId || k.name).filter(Boolean);
}

export type ThemeSerializeOptions = {
    /** Phone/export YAML only. Embed builtins that keyboards/tool_bar actually
     *  reference (not the whole table). Recovery & editor slots must stay false. */
    includeBuiltinPresets?: boolean;
};

/** Normalize action id the same way KeyAction does for surrounding braces. */
function unbraceActionId(raw: string): string {
    if (raw.length >= 2 && raw.startsWith("{") && raw.endsWith("}")) {
        return raw.slice(1, -1);
    }
    return raw;
}

function presetSpecFingerprint(spec: any): string {
    var p = new PresetKey();
    p.fromObject(spec);
    return JSON.stringify(p.toObject());
}

/** True when this entry is an unchanged copy of Trime's builtin preset_keys. */
export function isUnmodifiedBuiltinPreset(id: string, key: PresetKey): boolean {
    if (!id || !BUILTIN_PRESET_KEYS[id]) return false;
    return presetSpecFingerprint(key.toObject()) === presetSpecFingerprint(BUILTIN_PRESET_KEYS[id]);
}

/** Drop builtin clones so「主題鍵」only keeps overrides / custom ids. */
export function stripUnmodifiedBuiltinPresets(keys: PresetKey[]): PresetKey[] {
    return keys.filter((k) => !isUnmodifiedBuiltinPreset(k.id, k));
}

/** IDs referenced by keyboard triggers and tool_bar actions. */
function collectReferencedPresetIds(theme: Theme): Set<string> {
    var ids = new Set<string>();
    var add = (raw: unknown) => {
        if (typeof raw !== "string" || !raw) return;
        ids.add(unbraceActionId(raw));
    };
    for (let kb of theme.keyboards) {
        for (let key of kb.keys) {
            for (let slot of TRIGGER_SLOTS) {
                var v = key.getTrigger(slot);
                if (typeof v === "string") add(v);
            }
        }
    }
    var toolBar = theme.style.toolBar;
    var buttons = [...(toolBar.buttons || [])];
    if (toolBar.primary_button) buttons.push(toolBar.primary_button);
    for (let btn of buttons) {
        add(btn.action);
        add(btn.long_press_action);
    }
    return ids;
}

export function themeToObject(theme: Theme, options: ThemeSerializeOptions = {}): object {
    var schemes: any = {};
    for (let s of theme.colorSchemes) {
        schemes[s.schemaId || s.name] = s.toObject();
    }
    // Theme overrides first. Phone export then fills only *referenced* builtins
    // so standalone Trime themes still work — without dumping the whole table
    // (which would pollute「主題鍵」on re-import).
    var keys: any = {};
    for (let k of theme.presetKeys) {
        if (k.id) keys[k.id] = k.toObject();
    }
    if (options.includeBuiltinPresets) {
        for (let id of collectReferencedPresetIds(theme)) {
            if (keys[id] !== undefined) continue;
            var builtin = BUILTIN_PRESET_KEYS[id];
            if (builtin) keys[id] = JSON.parse(JSON.stringify(builtin));
        }
    }
    var keyboards: any = {};
    for (let k of theme.keyboards) {
        var keyboardId = k.schemaId || k.name;
        var keyboardObj: any = k.toObject();
        // Trime 3.3.11 reads behavior values as scalar preset-key names only.
        // Hoist editor-supported inline objects into generated preset_keys.
        keyboardObj.keys.forEach((item: any, index: number) => {
            if (!item || typeof item !== "object") return;
            for (let slot of TRIGGER_SLOTS) {
                var inline = item[slot];
                if (!inline || typeof inline !== "object" || Array.isArray(inline)) continue;
                var base = `__inline_${keyboardId}_${index}_${slot}`.replace(/[^\w.]/g, "_");
                var id = base;
                var suffix = 2;
                while (keys[id] !== undefined) id = `${base}_${suffix++}`;
                keys[id] = inline;
                item[slot] = id;
            }
        });
        keyboards[keyboardId] = keyboardObj;
    }
    var style: any = theme.style.toObject();
    var switchList = switchListFromKeyboards(theme.keyboards);
    style.keyboards = switchList.length ? switchList : undefined;
    var obj: any = {
        config_version: theme.config_version,
        name: theme.name,
        author: theme.author || undefined,
        style,
        preedit: theme.style.preedit.toObject(),
        window: theme.style.window.toObject(),
        fallback_colors: { ...theme.fallbackColors },
        preset_color_schemes: schemes,
        preset_keys: Object.keys(keys).length ? keys : undefined,
        preset_keyboards: keyboards,
    };
    var toolBar = theme.style.toolBar.toObject();
    if (toolBar) obj.tool_bar = toolBar;
    return obj;
}

export function themeToYaml(theme: Theme, options: ThemeSerializeOptions = {}): string {
    if (get(persistHideKeySymbols) || hasSavedKeySymbols(theme)) {
        hideAllKeySymbols(theme);
    }
    var obj: any = themeToObject(theme, options);
    attachOrigLabelSymbols(obj, theme);
    return stringifyYamlWithSymbolComments(obj);
}

/** Download / clipboard: embed referenced builtin preset_keys for standalone Trime themes. */
export function themeToExportYaml(theme: Theme): string {
    return themeToYaml(theme, { includeBuiltinPresets: true });
}

export function sectionToYaml(theme: Theme, section: string): string {
    if (get(persistHideKeySymbols) || hasSavedKeySymbols(theme)) {
        hideAllKeySymbols(theme);
    }
    var obj: any = themeToObject(theme, { includeBuiltinPresets: true });
    attachOrigLabelSymbols(obj, theme);
    if (section === "full") return stringifyYamlWithSymbolComments(obj);
    var piece: any = {};
    if (section === "preset_keyboards") {
        // Keyboard behaviors refer to preset key names, so a standalone
        // keyboard section must carry those definitions too.
        piece.preset_keys = obj.preset_keys;
    }
    piece[section] = obj[section];
    return stringifyYamlWithSymbolComments(piece);
}

function lookupPath(root: any, path: string): any {
    var p = path.replace(/^\//, "").replace(/:/g, "/");
    var parts = p.split("/").filter(Boolean);
    var cur = root;
    for (let part of parts) {
        if (!cur || typeof cur !== "object") return undefined;
        cur = cur[part];
    }
    return cur;
}

function deepMerge(base: any, patch: any): any {
    if (patch === undefined) return base;
    if (Array.isArray(patch) || Array.isArray(base) || typeof patch !== "object" || patch === null) {
        return patch;
    }
    var out: any = { ...(base && typeof base === "object" ? base : {}) };
    for (let [k, v] of Object.entries(patch)) {
        if (k === "__include" || k === "__patch" || k === "import_preset") continue;
        out[k] = deepMerge(out[k], v);
    }
    return out;
}

function resolveNode(node: any, root: any, warnings: ImportWarning[], depth: number): any {
    if (!node || typeof node !== "object" || depth > 12) return node;
    if (Array.isArray(node)) {
        return node.map((item) => resolveNode(item, root, warnings, depth + 1));
    }
    var out: any = { ...node };
    if (typeof out.__include === "string") {
        var included = lookupPath(root, out.__include);
        if (included === undefined) {
            warnings.push(`無法解析 __include: ${out.__include}（外部引用已略過）`);
        } else {
            var resolved = resolveNode(JSON.parse(JSON.stringify(included)), root, warnings, depth + 1);
            out = deepMerge(resolved, out);
        }
        delete out.__include;
    }
    if (typeof out.import_preset === "string") {
        var preset = root.preset_keyboards && root.preset_keyboards[out.import_preset];
        if (!preset) {
            warnings.push(`無法解析 import_preset: ${out.import_preset}`);
        } else {
            var resolvedKb = resolveNode(JSON.parse(JSON.stringify(preset)), root, warnings, depth + 1);
            out = deepMerge(resolvedKb, out);
        }
        delete out.import_preset;
    }
    if (out.__patch && typeof out.__patch === "object") {
        var patch = resolveNode(out.__patch, root, warnings, depth + 1);
        out = deepMerge(out, patch);
        delete out.__patch;
    }
    for (let [k, v] of Object.entries(out)) {
        if (v && typeof v === "object") {
            out[k] = resolveNode(v, root, warnings, depth + 1);
        }
    }
    return out;
}

export function parseThemeYaml(data: string): { obj: any; warnings: ImportWarning[] } {
    var doc = YAML.parseDocument(data);
    commentsToOrigFields(doc.contents);
    var obj = doc.toJS();
    var warnings: ImportWarning[] = [];
    if (!obj || typeof obj !== "object") {
        throw new Error("YAML 根節點不是對應表");
    }
    if (obj.preset_keyboards && typeof obj.preset_keyboards === "object") {
        for (let [id, spec] of Object.entries(obj.preset_keyboards) as [string, any][]) {
            if (spec && typeof spec === "object" && spec.ascii_mode === undefined) {
                warnings.push(`鍵盤「${id}」未寫 ascii_mode；同文 3.3.11 會當作西文（1）`);
            }
        }
    }
    var resolved = resolveNode(obj, obj, warnings, 0);
    return { obj: resolved, warnings };
}

export function themeFromObject(obj: any): Theme {
    var theme = new Theme();
    if (!obj || typeof obj !== "object") return theme;
    if (typeof obj.config_version === "string" || typeof obj.config_version === "number") {
        theme.config_version = String(obj.config_version);
    }
    if (typeof obj.name === "string") theme.name = obj.name;
    if (typeof obj.author === "string") theme.author = obj.author;
    if (obj.style) {
        theme.style = new Style();
        theme.style.fromObject(obj.style);
    }
    if (obj.preedit) theme.style.preedit.fromObject(obj.preedit);
    if (obj.window) theme.style.window.fromObject(obj.window);
    if (obj.tool_bar) theme.style.toolBar.fromObject(obj.tool_bar);
    if (obj.fallback_colors && typeof obj.fallback_colors === "object") {
        theme.fallbackColors = {};
        for (let [k, v] of Object.entries(obj.fallback_colors)) {
            if (typeof v === "string") theme.fallbackColors[k] = v;
        }
    }
    if (obj.preset_color_schemes && typeof obj.preset_color_schemes === "object") {
        theme.colorSchemes = Object.entries(obj.preset_color_schemes).map(([id, spec]) => {
            var s = new ColorScheme();
            s.fromObject(spec, id);
            return s;
        });
    }
    if (obj.preset_keys && typeof obj.preset_keys === "object") {
        theme.presetKeys = stripUnmodifiedBuiltinPresets(
            Object.entries(obj.preset_keys).map(([id, spec]) => {
                var p = new PresetKey();
                p.fromObject(spec, id);
                return p;
            }),
        );
    } else {
        theme.presetKeys = [];
    }
    if (obj.preset_keyboards && typeof obj.preset_keyboards === "object") {
        theme.keyboards = Object.entries(obj.preset_keyboards).map(([id, spec]) => {
            var k = new Keyboard();
            k.fromObject(spec, id);
            return k;
        });
    }
    if (!theme.colorSchemes.length) theme.colorSchemes = [new ColorScheme()];
    if (!theme.keyboards.length) theme.keyboards = [new Keyboard()];
    theme.style.keyboards = switchListFromKeyboards(theme.keyboards);
    theme.fillKeyboardMetrics();
    syncPersistHideStore(theme);
    return theme;
}

export function mergeTheme(base: Theme, incoming: any): Theme {
    var next = base.clone();
    if (!incoming || typeof incoming !== "object") return next;
    var hasFull =
        incoming.preset_color_schemes ||
        incoming.preset_keyboards ||
        incoming.style ||
        incoming.preset_keys ||
        incoming.preedit ||
        incoming.window ||
        incoming.tool_bar;
    if (typeof incoming.config_version === "string") next.config_version = incoming.config_version;
    if (typeof incoming.name === "string") next.name = incoming.name;
    if (typeof incoming.author === "string") next.author = incoming.author;
    if (incoming.style) {
        next.style.fromObject(incoming.style);
    }
    if (incoming.preedit) next.style.preedit.fromObject(incoming.preedit);
    if (incoming.window) next.style.window.fromObject(incoming.window);
    if (incoming.tool_bar) next.style.toolBar.fromObject(incoming.tool_bar);
    if (incoming.fallback_colors && typeof incoming.fallback_colors === "object") {
        next.fallbackColors = { ...next.fallbackColors };
        for (let [k, v] of Object.entries(incoming.fallback_colors)) {
            if (typeof v === "string") next.fallbackColors[k] = v;
        }
    }
    if (incoming.preset_color_schemes && typeof incoming.preset_color_schemes === "object") {
        var map: { [id: string]: ColorScheme } = {};
        for (let s of next.colorSchemes) map[s.schemaId] = s;
        for (let [id, spec] of Object.entries(incoming.preset_color_schemes)) {
            var s = new ColorScheme();
            s.fromObject(spec, id);
            map[id] = s;
        }
        next.colorSchemes = Object.values(map);
    }
    if (incoming.preset_keys && typeof incoming.preset_keys === "object") {
        var kmap: { [id: string]: PresetKey } = {};
        for (let p of next.presetKeys) kmap[p.id] = p;
        for (let [id, spec] of Object.entries(incoming.preset_keys)) {
            var p = new PresetKey();
            p.fromObject(spec, id);
            // Skip export-injected builtins so they never overwrite a custom
            // override already in the editor, and never clutter「主題鍵」.
            if (isUnmodifiedBuiltinPreset(id, p)) continue;
            kmap[id] = p;
        }
        next.presetKeys = Object.values(kmap);
    }
    // Clean recovery / older polluted sessions that already hold builtin clones.
    next.presetKeys = stripUnmodifiedBuiltinPresets(next.presetKeys);
    if (incoming.preset_keyboards && typeof incoming.preset_keyboards === "object") {
        var kbmap: { [id: string]: Keyboard } = {};
        for (let k of next.keyboards) kbmap[k.schemaId] = k;
        for (let [id, spec] of Object.entries(incoming.preset_keyboards)) {
            var k = new Keyboard();
            k.fromObject(spec, id);
            kbmap[id] = k;
        }
        next.keyboards = Object.values(kbmap);
    }
    if (!hasFull && Array.isArray(incoming.keys)) {
        var kb = next.keyboards[0] || new Keyboard();
        kb.keys = incoming.keys.map((item: any) => {
            var key = new Key();
            key.fromObject(item);
            return key;
        });
        if (!next.keyboards.length) next.keyboards = [kb];
    }
    next.style.keyboards = switchListFromKeyboards(next.keyboards);
    next.fillKeyboardMetrics();
    syncPersistHideStore(next);
    return next;
}

export function loadTheme(key: string): Theme | null {
    var recoveryData = localStorage.getItem(key);
    if (!recoveryData) return null;
    try {
        var { obj } = parseThemeYaml(recoveryData);
        return themeFromObject(obj);
    } catch (err) {
        alert(`failed to load recovery data: ${(err as Error).message}`);
        return null;
    }
}

export function saveTheme(key: string, theme: Theme): void {
    if (get(persistHideKeySymbols) || hasSavedKeySymbols(theme)) {
        hideAllKeySymbols(theme);
    }
    // Drop accidental builtin clones so the editable list and recovery stay lean.
    theme.presetKeys = stripUnmodifiedBuiltinPresets(theme.presetKeys);
    // Never inject builtins into recovery: loadTheme would turn them into
    // editable「本主題預設鍵」and deleting them would not survive reload.
    var obj: any = themeToObject(theme, { includeBuiltinPresets: false });
    attachOrigLabelSymbols(obj, theme);
    localStorage.setItem(key, stringifyYamlWithSymbolComments(obj));
}

export { Key };
