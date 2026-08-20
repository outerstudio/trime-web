import { BUILTIN_PRESET_KEYS } from "$lib/Trime/utils/keydefs";
import type { Key } from "$lib/Trime/model/key";
import { PresetKey, type TriggerValue, triggerDisplay } from "$lib/Trime/model/presetKey";

/** Editor / preview stand-in for Trime Key.getLabel conditions. */
export type GetLabelContext = {
    /** Rime ascii_mode; preview uses keyboard.ascii_mode === 1 */
    asciiMode?: boolean;
    /** Rime ascii_punct; preview defaults false unless toggled later */
    asciiPunct?: boolean;
    /** Preview normally draws the click face (not composing / swipe). */
    activeIsClick?: boolean;
};

const KEYPAD_LABELS: { [id: string]: string } = {
    KP_0: "0",
    KP_1: "1",
    KP_2: "2",
    KP_3: "3",
    KP_4: "4",
    KP_5: "5",
    KP_6: "6",
    KP_7: "7",
    KP_8: "8",
    KP_9: "9",
    KP_Add: "+",
    KP_Subtract: "-",
    KP_Multiply: "*",
    KP_Divide: "/",
    KP_Decimal: ".",
    KP_Enter: "Enter",
    KP_Separator: ",",
    KP_Equal: "=",
};

export function findPreset(name: string, user: PresetKey[] = []): PresetKey | null {
    if (!name) return null;
    var found = user.find((p) => p.id === name);
    if (found) return found;
    var builtin = BUILTIN_PRESET_KEYS[name];
    if (builtin) {
        var p = new PresetKey();
        p.fromObject(builtin, name);
        return p;
    }
    return null;
}

/** 預覽用標籤: 去掉 Rime 宏, 解析小鍵盤名 */
export function prettyTrigger(raw: string): string {
    if (!raw) return "";
    if (KEYPAD_LABELS[raw]) return KEYPAD_LABELS[raw];
    if (raw.includes("{")) {
        var vis = raw.replace(/\{[^}]*\}/g, "");
        if (vis) return vis;
    }
    return raw;
}

export function clickLabel(
    click: TriggerValue,
    user: PresetKey[] = [],
    enterLabel: string = "Enter",
    spaceLabel: string = "",
): string {
    if (!click) return "";
    if (typeof click !== "string") return prettyTrigger(click.displayLabel());
    var preset = findPreset(click, user);
    if (preset) {
        if (preset.label === "enter_labels") return enterLabel || "Enter";
        if (preset.id === "space" && !preset.label) return spaceLabel;
        return prettyTrigger(preset.displayLabel());
    }
    return prettyTrigger(triggerDisplay(click));
}

export function isFunctionalClick(click: TriggerValue, explicit?: boolean, user: PresetKey[] = []): boolean {
    if (explicit === false) return false;
    if (explicit === true) return true;
    if (typeof click !== "string") {
        return !!(click.send || click.toggle || click.command || click.select);
    }
    var preset = findPreset(click, user);
    if (!preset) return false;
    if (preset.functional === false) return false;
    return true;
}

export function symbolLabel(
    longClick: TriggerValue,
    labelSymbol: string,
    user: PresetKey[] = [],
    enterLabel: string = "Enter",
): string {
    if (labelSymbol) {
        if (!labelSymbol.trim()) return "";
        return prettyTrigger(labelSymbol);
    }
    return clickLabel(longClick, user, enterLabel);
}

export function applyLabelTransform(text: string, transform: string): string {
    if (transform === "uppercase" && text && text.length === 1 && /[a-z]/.test(text)) {
        return text.toUpperCase();
    }
    return text;
}

function hasAsciiSlot(key: Key): boolean {
    var ascii = key.ascii;
    if (typeof ascii === "string") return ascii !== "";
    return !!ascii;
}

/** Trime Key.getLabel uses per-key label only when all of these hold. */
export function usesPerKeyLabel(key: Key, ctx: GetLabelContext = {}): boolean {
    if (!key.label) return false;
    if (ctx.activeIsClick === false) return false;
    if (hasAsciiSlot(key)) return false;
    if (ctx.asciiMode || ctx.asciiPunct) return false;
    return true;
}

export function perKeyLabelBlockReason(key: Key, ctx: GetLabelContext = {}): string | null {
    if (!key.label) return null;
    if (usesPerKeyLabel(key, ctx)) return null;
    if (ctx.activeIsClick === false) return "目前不是 click 動作（輸入中／手勢等會改用動作 label）";
    if (hasAsciiSlot(key)) return "此鍵有 ascii 槽，同文不會用這裡的字";
    if (ctx.asciiMode) return "鍵盤為西文（ascii_mode），同文不會用這裡的字";
    if (ctx.asciiPunct) return "ascii_punct 開啟時，同文不會用這裡的字";
    return "同文目前不會用這裡的字";
}

/** Face text approximating Trime Key.getLabel + KeyAction.getLabel. */
export function trimeKeyLabel(
    key: Key,
    user: PresetKey[] = [],
    enterLabel: string = "Enter",
    spaceLabel: string = "",
    ctx: GetLabelContext = {},
    labelTransform: string = "",
): string {
    var action = clickLabel(key.click, user, enterLabel, spaceLabel);
    var raw = usesPerKeyLabel(key, ctx) ? key.label : action;
    return applyLabelTransform(raw, labelTransform);
}

/** 與 Trime KeyView 一致: 單字用 key_text_size, 兩字及以上用 key_long_text_size */
export function keyFaceSize(label: string, keyOverride: number, keyTextSize: number, keyLongTextSize: number): number {
    if (keyOverride > 0) return keyOverride;
    if (label && label.length > 1) return keyLongTextSize > 0 ? keyLongTextSize : 14;
    return keyTextSize > 0 ? keyTextSize : 22;
}
