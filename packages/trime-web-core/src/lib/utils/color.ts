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
