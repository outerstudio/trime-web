import { writable } from "svelte/store";
import { snap } from "trime-web-core";

export { snap };

/** 遞增時預覽與縮略圖重新解析顔色與佈局 */
export const previewRevision = writable(0);

/** 預覽隱藏鍵面上方的長按角標（不寫進主題） */
export const hideKeySymbols = writable(false);

/**
 * 預覽用 ascii_mode 顯示（不寫進主題、不改鍵盤 ascii_mode）。
 * false＝中文鍵面條件；true＝西文（Mode_switch states／per-key label 規則會跟著變）。
 */
export const previewAsciiMode = writable(false);

/** 主題「功能」：導出／儲存時整批空白角標 */
export const persistHideKeySymbols = writable(false);

export function bumpPreview() {
    previewRevision.update((n) => n + 1);
}
