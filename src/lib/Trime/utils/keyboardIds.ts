/** 同文內建 trime.yaml 的 preset_keyboards 鍵名（含常用方案對應） */
export const BUILTIN_KEYBOARD_PRESETS: { id: string; label: string }[] = [
    { id: "qwerty", label: "預設26鍵" },
    { id: "qwerty0", label: "預設36鍵" },
    { id: "default", label: "預設40鍵" },
    { id: "qwerty_", label: "qwerty 變體" },
    { id: "letter", label: "字母" },
    { id: "mini", label: "精簡／迷你" },
    { id: "number", label: "數字" },
    { id: "symbols", label: "符號" },
    { id: "us_intl", label: "美式國際" },
    { id: "bopomofo", label: "注音" },
    { id: "cangjie5", label: "倉頡五代" },
    { id: "cangjie6", label: "倉頡六代" },
    { id: "scj6", label: "快速倉頡" },
    { id: "stroke", label: "筆畫" },
    { id: "telegraph", label: "電碼" },
    { id: "terra_pinyin", label: "地球拼音" },
    { id: "luna_pinyin", label: "朙月拼音" },
    { id: "array30", label: "行列30" },
    { id: "quick5", label: "速成" },
];

/** 切換鍵盤用的特殊 select 值，不宜當作佈局自身代碼 */
export const SPECIAL_KEYBOARD_IDS: { id: string; label: string }[] = [
    { id: ".default", label: "依方案自動匹配" },
    { id: ".next", label: "下一張鍵盤" },
];

export function keyboardIdTitle(id: string): string {
    var hit = BUILTIN_KEYBOARD_PRESETS.find((x) => x.id === id) || SPECIAL_KEYBOARD_IDS.find((x) => x.id === id);
    return hit ? `${id} · ${hit.label}` : id;
}
