export type ColorGroup = "window" | "candidate" | "keyboard" | "functional";

export interface ColorKeyMeta {
    id: string;
    label: string;
    group: ColorGroup;
    /** 是否允許圖片檔名 */
    image?: boolean;
    /** 内置 fallback 父鍵; 空表示根顔色 */
    fallback?: string;
}

export const COLOR_GROUPS: { id: ColorGroup; label: string }[] = [
    { id: "window", label: "懸浮窗 / 編碼" },
    { id: "candidate", label: "候選欄" },
    { id: "keyboard", label: "鍵盤" },
    { id: "functional", label: "功能鍵" },
];

/**
 * 配色欄位元數據. fallback 鏈來自 Trime 預設 fallback_colors 註釋 / 文檔.
 */
export const colorKeys: ColorKeyMeta[] = [
    { id: "text_color", label: "編碼文字", group: "window" },
    { id: "text_back_color", label: "編碼區背景", group: "window", image: true, fallback: "back_color" },
    { id: "hilited_text_color", label: "標明編碼", group: "window", fallback: "text_color" },
    { id: "hilited_back_color", label: "標明編碼背景", group: "window", image: true, fallback: "back_color" },
    { id: "border_color", label: "邊框", group: "window", fallback: "back_color" },
    { id: "shadow_color", label: "按鍵陰影", group: "window", fallback: "border_color" },

    { id: "back_color", label: "候選區背景", group: "candidate", image: true },
    { id: "candidate_text_color", label: "候選文字", group: "candidate", fallback: "text_color" },
    { id: "comment_text_color", label: "註釋文字", group: "candidate", fallback: "candidate_text_color" },
    { id: "label_color", label: "候選序號", group: "candidate", fallback: "candidate_text_color" },
    {
        id: "candidate_separator_color",
        label: "候選分割線",
        group: "candidate",
        fallback: "border_color",
    },
    {
        id: "hilited_candidate_text_color",
        label: "標明候選文字",
        group: "candidate",
        fallback: "hilited_text_color",
    },
    {
        id: "hilited_candidate_back_color",
        label: "標明候選背景",
        group: "candidate",
        image: true,
        fallback: "hilited_back_color",
    },
    {
        id: "hilited_label_color",
        label: "標明候選序號",
        group: "candidate",
        fallback: "hilited_candidate_text_color",
    },
    {
        id: "hilited_comment_text_color",
        label: "標明註釋",
        group: "candidate",
        fallback: "comment_text_color",
    },
    { id: "candidate_background", label: "候選欄整體背景", group: "candidate", image: true, fallback: "back_color" },
    { id: "root_background", label: "鍵盤+候選整體背景", group: "candidate", image: true, fallback: "back_color" },

    { id: "key_back_color", label: "按鍵背景", group: "keyboard", image: true, fallback: "back_color" },
    { id: "key_text_color", label: "按鍵文字", group: "keyboard", fallback: "candidate_text_color" },
    { id: "key_symbol_color", label: "按鍵符號", group: "keyboard", fallback: "comment_text_color" },
    { id: "key_border_color", label: "按鍵邊框", group: "keyboard", fallback: "border_color" },
    { id: "keyboard_back_color", label: "鍵盤區背景", group: "keyboard", image: true, fallback: "border_color" },
    {
        id: "hilited_key_back_color",
        label: "標明按鍵背景",
        group: "keyboard",
        image: true,
        fallback: "hilited_candidate_back_color",
    },
    {
        id: "hilited_key_text_color",
        label: "標明按鍵文字",
        group: "keyboard",
        fallback: "hilited_candidate_text_color",
    },
    {
        id: "hilited_key_symbol_color",
        label: "標明按鍵符號",
        group: "keyboard",
        fallback: "hilited_comment_text_color",
    },
    { id: "preview_back_color", label: "按鍵提示背景", group: "keyboard", image: true, fallback: "key_back_color" },
    { id: "preview_text_color", label: "按鍵提示文字", group: "keyboard", fallback: "key_text_color" },
    {
        id: "long_text_back_color",
        label: "長文本按鍵背景",
        group: "keyboard",
        image: true,
        fallback: "key_back_color",
    },
    {
        id: "liquid_keyboard_background",
        label: "Liquid 鍵盤背景",
        group: "keyboard",
        image: true,
        fallback: "keyboard_back_color",
    },

    { id: "off_key_back_color", label: "功能鍵關閉背景", group: "functional", image: true, fallback: "key_back_color" },
    { id: "off_key_text_color", label: "功能鍵關閉文字", group: "functional", fallback: "key_text_color" },
    {
        id: "on_key_back_color",
        label: "功能鍵打開背景",
        group: "functional",
        image: true,
        fallback: "hilited_key_back_color",
    },
    { id: "on_key_text_color", label: "功能鍵打開文字", group: "functional", fallback: "hilited_key_text_color" },
    {
        id: "hilited_off_key_back_color",
        label: "標明功能鍵關閉背景",
        group: "functional",
        image: true,
        fallback: "hilited_key_back_color",
    },
    {
        id: "hilited_off_key_text_color",
        label: "標明功能鍵關閉文字",
        group: "functional",
        fallback: "hilited_key_text_color",
    },
    {
        id: "hilited_on_key_back_color",
        label: "標明功能鍵打開背景",
        group: "functional",
        image: true,
        fallback: "hilited_key_back_color",
    },
    {
        id: "hilited_on_key_text_color",
        label: "標明功能鍵打開文字",
        group: "functional",
        fallback: "hilited_key_text_color",
    },
];

export const colorKeyById: { [id: string]: ColorKeyMeta } = {};
for (let meta of colorKeys) {
    colorKeyById[meta.id] = meta;
}

/** 程式内置 fallback_colors (可被主題覆蓋) */
export const DEFAULT_FALLBACK_COLORS: { [id: string]: string } = {};
for (let meta of colorKeys) {
    if (meta.fallback) {
        DEFAULT_FALLBACK_COLORS[meta.id] = meta.fallback;
    }
}

export const KNOWN_COLOR_IDS = new Set(colorKeys.map((k) => k.id));
