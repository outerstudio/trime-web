import { ColorValue } from "../model/color";
import { DEFAULT_FALLBACK_COLORS, colorKeyById } from "../model/colorKeys";
import type { ColorScheme } from "../model/colorScheme";

export type FallbackMap = { [id: string]: string };

/**
 * 解析配色. 使用者 fallback_colors 優先於内置鏈;
 * 方案内的 ref 會繼續解析; 遇環則停止.
 */
export function resolveColor(scheme: ColorScheme, id: string, fallbackOverrides?: FallbackMap): ColorValue {
    var visited: { [k: string]: boolean } = {};
    var fallbacks: FallbackMap = { ...DEFAULT_FALLBACK_COLORS, ...(fallbackOverrides || {}) };
    return walk(scheme, id, fallbacks, visited);
}

function walk(scheme: ColorScheme, id: string, fallbacks: FallbackMap, visited: { [k: string]: boolean }): ColorValue {
    if (!id || visited[id]) {
        return new ColorValue();
    }
    visited[id] = true;
    var declared = scheme.colors[id];
    if (declared && !declared.isEmpty()) {
        if (declared.kind === "ref" && declared.ref) {
            return walk(scheme, declared.ref, fallbacks, visited);
        }
        return declared;
    }
    var next = fallbacks[id] || (colorKeyById[id] && colorKeyById[id].fallback);
    if (next) {
        return walk(scheme, next, fallbacks, visited);
    }
    return new ColorValue();
}

export function resolvedRgba(scheme: ColorScheme, id: string, fallbackOverrides?: FallbackMap): string {
    return resolveColor(scheme, id, fallbackOverrides).rgba();
}

/**
 * Per-key color override → CSS rgba.
 * Supports solid colors and refs into the active scheme (same as theme colors).
 * Empty / image overrides return "".
 */
export function resolveKeyColorRgba(
    key: { colors: { [id: string]: ColorValue } },
    id: string,
    scheme: ColorScheme,
    fallbackOverrides?: FallbackMap,
): string {
    var ov = key.colors[id];
    if (!ov || ov.isEmpty()) return "";
    if (ov.kind === "color") return ov.rgba();
    if (ov.kind === "ref" && ov.ref) return resolvedRgba(scheme, ov.ref, fallbackOverrides);
    return "";
}

/**
 * Key face fill/text/symbol for preview (idle, not pressed).
 * Matches v3.3.11 Key.getBackgroundDrawable / getTextColor / getSymbolColor:
 * per-key key_* overrides win; functional keys fall back to off_key_* then key_*.
 */
export function keyFaceColors(
    key: { colors: { [id: string]: ColorValue } },
    functional: boolean,
    scheme: ColorScheme,
    fallbackOverrides?: FallbackMap,
): { bg: string; fg: string; symbol: string } {
    var fb = fallbackOverrides;
    var bg =
        resolveKeyColorRgba(key, "key_back_color", scheme, fb) ||
        (functional
            ? resolvedRgba(scheme, "off_key_back_color", fb) || resolvedRgba(scheme, "key_back_color", fb)
            : resolvedRgba(scheme, "key_back_color", fb));
    var fg =
        resolveKeyColorRgba(key, "key_text_color", scheme, fb) ||
        (functional
            ? resolvedRgba(scheme, "off_key_text_color", fb) || resolvedRgba(scheme, "key_text_color", fb)
            : resolvedRgba(scheme, "key_text_color", fb));
    var symbol =
        resolveKeyColorRgba(key, "key_symbol_color", scheme, fb) ||
        (functional
            ? resolvedRgba(scheme, "off_key_symbol_color", fb) || resolvedRgba(scheme, "key_symbol_color", fb)
            : resolvedRgba(scheme, "key_symbol_color", fb));
    return { bg, fg, symbol };
}
