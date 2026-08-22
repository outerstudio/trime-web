import {
    type Theme,
    parseThemeYaml,
    themeFromObject,
    themeToObject,
    stripUnmodifiedBuiltinPresets,
    attachOrigLabelSymbols,
    stringifyYamlWithSymbolComments,
    hideAllKeySymbols,
    hasSavedKeySymbols,
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
        persistHideKeySymbols.set(hasSavedKeySymbols(theme));
        return theme;
    } catch (err) {
        alert(`failed to load recovery data: ${(err as Error).message}`);
        return null;
    }
}

export function saveTheme(key: string, theme: Theme): void {
    var persistHide = get(persistHideKeySymbols) || hasSavedKeySymbols(theme);
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
}

/** Sync editor persist-hide store after import/merge. */
export function syncPersistHideStore(theme: Theme): void {
    persistHideKeySymbols.set(hasSavedKeySymbols(theme));
}
