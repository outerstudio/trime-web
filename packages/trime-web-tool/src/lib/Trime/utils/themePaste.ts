import { mergeTheme, parseThemeYaml, type Theme } from "trime-web-core";

export function describeThemeYamlSections(obj: any): string {
    if (!obj || typeof obj !== "object") return "主題片段";
    var parts: string[] = [];
    if (obj.style) parts.push("樣式");
    if (obj.preedit) parts.push("預編輯區");
    if (obj.window) parts.push("候選窗口");
    if (obj.tool_bar) parts.push("工具欄");
    if (obj.fallback_colors) parts.push("後備顔色");
    if (obj.preset_color_schemes) parts.push("配色");
    if (obj.preset_keyboards) parts.push("鍵盤");
    if (obj.preset_keys) parts.push("主題鍵");
    if (!parts.length && Array.isArray(obj.keys)) parts.push("按鍵列表");
    if (
        !parts.length &&
        (typeof obj.name === "string" ||
            typeof obj.config_version === "string" ||
            typeof obj.author === "string")
    ) {
        parts.push("主題資訊");
    }
    return parts.length ? parts.join("、") : "主題片段";
}

export function isPasteableThemeObj(obj: any): boolean {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    return !!(
        obj.style ||
        obj.preedit ||
        obj.window ||
        obj.tool_bar ||
        obj.fallback_colors ||
        obj.preset_color_schemes ||
        obj.preset_keyboards ||
        obj.preset_keys ||
        Array.isArray(obj.keys) ||
        typeof obj.name === "string" ||
        typeof obj.config_version === "string" ||
        typeof obj.author === "string"
    );
}

/** True when Ctrl/Cmd+V should stay with the focused field. */
export function isEditablePasteTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    var el = target as HTMLElement;
    if (el.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']")) {
        return true;
    }
    return !!el.isContentEditable;
}

export type ThemePasteResult =
    | { ok: true; theme: Theme; label: string; warnings: string[] }
    | { ok: false; reason: "empty" | "cancel" | "parse" | "not-theme" | "clipboard"; message?: string };

/**
 * Apply merge result onto the live editor Theme.
 * Always assign **new** array/object references for collections so one-way UI props update;
 * never rely on `bind:colorSchemes` (it snaps YAML paste back to the pre-paste list).
 */
export function commitMergedTheme(dst: Theme, src: Theme): void {
    dst.config_version = src.config_version;
    dst.name = src.name;
    dst.author = src.author;
    dst.style = src.style;
    // Keep same fallback object ref if bound; copy keys in place.
    var fb = dst.fallbackColors;
    for (let k of Object.keys(fb)) delete fb[k];
    Object.assign(fb, src.fallbackColors);
    dst.colorSchemes = src.colorSchemes.map((s) => s.clone());
    dst.keyboards = src.keyboards.map((k) => k.clone());
    dst.presetKeys = src.presetKeys.map((p) => p.clone());
}

/** Parse clipboard YAML, confirm, then merge into theme. */
export function applyThemeYamlText(
    theme: Theme,
    text: string,
    options: { confirm: boolean },
): ThemePasteResult {
    var trimmed = (text || "").trim();
    if (!trimmed) {
        return { ok: false, reason: "empty", message: "剪貼簿是空的" };
    }
    var obj: any;
    var warnings: string[] = [];
    try {
        var parsed = parseThemeYaml(trimmed);
        obj = parsed.obj;
        warnings = parsed.warnings;
    } catch (err) {
        return {
            ok: false,
            reason: "parse",
            message: `解析 YAML 失敗: ${(err as Error).message}`,
        };
    }
    if (!isPasteableThemeObj(obj)) {
        return {
            ok: false,
            reason: "not-theme",
            message: "剪貼簿不是可合併的主題 YAML（需要 style／配色／鍵盤等頂層鍵）",
        };
    }
    var label = describeThemeYamlSections(obj);
    if (options.confirm && !confirm(`確定粘貼並合併以下內容？\n\n${label}`)) {
        return { ok: false, reason: "cancel" };
    }
    return {
        ok: true,
        theme: mergeTheme(theme, obj),
        label,
        warnings,
    };
}

export async function pasteThemeFromClipboard(
    theme: Theme,
    options: { confirm: boolean },
): Promise<ThemePasteResult> {
    try {
        var text = await navigator.clipboard.readText();
        return applyThemeYamlText(theme, text, options);
    } catch (err) {
        return {
            ok: false,
            reason: "clipboard",
            message: `讀取剪貼簿失敗: ${(err as Error).message}`,
        };
    }
}
