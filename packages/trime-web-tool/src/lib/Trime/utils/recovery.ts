import {
    type Theme,
    parseThemeYaml,
    themeFromObject,
    themeToObject,
    stripUnmodifiedBuiltinPresets,
    attachOrigLabelSymbols,
    stringifyYamlWithSymbolComments,
    hideAllKeySymbols,
} from "trime-web-core";
import { get } from "svelte/store";
import { persistHideKeySymbols } from "./revision";

export const THEME_STORAGE_KEY = "recoveryTrimeTheme";

export function loadTheme(key: string): Theme | null {
    var recoveryData = localStorage.getItem(key);
    if (!recoveryData) return null;
    try {
        var { obj } = parseThemeYaml(recoveryData);
        var theme = themeFromObject(obj);
        var target = localStorage.getItem(`${key}:targetTrimeVersion`);
        if (target === "3.3.11" || target === "3.3.12") theme.targetTrimeVersion = target;
        persistHideKeySymbols.set(localStorage.getItem(`${key}:persistHideKeySymbols`) === "true");
        return theme;
    } catch (err) {
        alert(`failed to load recovery data: ${(err as Error).message}`);
        return null;
    }
}

export function saveTheme(key: string, theme: Theme): void {
    var persistHide = get(persistHideKeySymbols);
    if (persistHide) {
        hideAllKeySymbols(theme);
    }
    // Drop accidental builtin clones so the editable list and recovery stay lean.
    theme.presetKeys = stripUnmodifiedBuiltinPresets(theme.presetKeys);
    // Never inject builtins into recovery: loadTheme would turn them into
    // editable「本主題預設鍵」and deleting them would not survive reload.
    var obj: any = themeToObject(theme, { includeBuiltinPresets: false });
    attachOrigLabelSymbols(obj, theme, persistHide);
    localStorage.setItem(key, stringifyYamlWithSymbolComments(obj));
    localStorage.setItem(`${key}:targetTrimeVersion`, theme.targetTrimeVersion);
    localStorage.setItem(`${key}:persistHideKeySymbols`, String(persistHide));
}

/** Sync editor persist-hide store after import/merge. */
export function syncPersistHideStore(_theme: Theme, persistHide = false): void {
    // YAML records per-key visibility, not whether the editor bulk switch was on.
    persistHideKeySymbols.set(persistHide);
}
