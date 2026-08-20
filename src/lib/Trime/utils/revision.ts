import { writable } from "svelte/store";

/** 遞增時預覽與縮略圖重新解析顔色與佈局 */
export const previewRevision = writable(0);

/** 預覽隱藏鍵面上方的長按角標（不寫進主題） */
export const hideKeySymbols = writable(false);

/** 主題「功能」：導出／儲存時整批空白角標 */
export const persistHideKeySymbols = writable(false);

export function bumpPreview() {
    previewRevision.update((n) => n + 1);
}

/** 把 revision 納入依賴, 迫使計算重跑 */
export function snap<T>(revision: number, value: T): T {
    return value;
}
