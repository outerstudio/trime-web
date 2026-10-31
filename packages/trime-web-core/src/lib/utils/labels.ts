import { BUILTIN_PRESET_KEYS } from "./keydefs";
import type { Key } from "../model/key";
import { PresetKey, type TriggerValue, triggerDisplay } from "../model/presetKey";

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
    ctx: GetLabelContext = {},
): string {
    if (!click) return "";
    if (typeof click !== "string") return prettyTrigger(click.displayLabel());
    var preset = findPreset(click, user);
    if (preset) {
        if (preset.label === "enter_labels") return enterLabel || "Enter";
        if (preset.id === "space" && !preset.label) return spaceLabel;
        // Trime KeyAction.getLabel: toggle+states 優先；依 runtime option 選 0／1
        if (preset.toggle && preset.states && preset.states.length) {
            var on =
                preset.toggle === "ascii_mode"
                    ? !!ctx.asciiMode
                    : preset.toggle === "ascii_punct"
                      ? !!ctx.asciiPunct
                      : false;
            var idx = on ? 1 : 0;
            var fromState = preset.states[Math.min(idx, preset.states.length - 1)];
            if (fromState) return prettyTrigger(fromState);
        }
        return prettyTrigger(preset.displayLabel());
    }
    return prettyTrigger(triggerDisplay(click));
}

/** v3.3.11 KeyAction: `isFunctional = presetKey.functional`（缺省 false）。
 *  sticky 鍵在 Key.appearanceType 也走功能鍵配色。不可把「只要命中 preset」都當功能鍵，
 *  否則僅有 commit／text 的主題鍵（如 Caret）會誤用 off_key_* 顔色。 */
export function isFunctionalClick(click: TriggerValue, explicit?: boolean, user: PresetKey[] = []): boolean {
    if (explicit === false) return false;
    if (explicit === true) return true;
    if (typeof click !== "string") {
        return !!(click.functional || click.sticky);
    }
    var preset = findPreset(click, user);
    if (!preset) return false;
    return !!(preset.functional || preset.sticky);
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

/**
 * 近似 Trime Key.checkKeyAction 的狀態優先：ascii_mode 時若有 ascii 槽則用它。
 * （預覽尚未模擬 paging／has_menu／composing）
 */
export function activeTrigger(key: Key, ctx: GetLabelContext = {}): TriggerValue {
    if (ctx.asciiMode && hasAsciiSlot(key)) return key.ascii;
    return key.click;
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
    if (ctx.asciiMode && hasAsciiSlot(key)) return "西文顯示時會改用 ascii 槽的動作字";
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
    var trigger = activeTrigger(key, ctx);
    var usingAsciiSlot = ctx.asciiMode && hasAsciiSlot(key);
    var action = clickLabel(trigger, user, enterLabel, spaceLabel, ctx);
    var preset =
        typeof trigger === "string"
            ? findPreset(trigger, user)
            : trigger && typeof trigger !== "string"
              ? trigger
              : null;
    var dualStates = !!(preset && preset.toggle && preset.states && preset.states.length >= 2);
    var perKeyCtx = { ...ctx, activeIsClick: usingAsciiSlot ? false : ctx.activeIsClick !== false };
    var raw = !dualStates && usesPerKeyLabel(key, perKeyCtx) ? key.label : action;
    return applyLabelTransform(raw, labelTransform);
}

/** 與 v3.3.11 KeyView.drawLabel 一致：
 *  per-key `key_text_size` > 0 優先；否則 `label.length > 1` → `key_long_text_size`，否則 `key_text_size`。
 *  `ic@…` 在 v3.3.11 依字串 length 走 long；v3.3.12 改用 key_text_size。 */
export function keyFaceSize(
    label: string,
    keyOverride: number,
    keyTextSize: number,
    keyLongTextSize: number,
    trimeVersion: "3.3.11" | "3.3.12" = "3.3.11",
): number {
    if (keyOverride > 0) return keyOverride;
    // v3.3.12 (e09ac711) excludes ic@ icons from the long-label size rule.
    const iconUsesTextSize = trimeVersion === "3.3.12" && label.startsWith("ic@");
    if (label && label.length > 1 && !iconUsesTextSize) {
        var longSize = keyLongTextSize > 0 ? keyLongTextSize : keyTextSize;
        return longSize > 0 ? longSize : 14;
    }
    return keyTextSize > 0 ? keyTextSize : 22;
}
