/**
 * 編輯器內建 preset_keys（同文版）。
 *
 * - YAML map key（id）維持同文常用英文 id，方便 roundtrip／官方主題相容。
 * - title／category 只給 UI 用，不得寫進導出 YAML。
 * - 對照倉輸入法「常用動作」清單收斂；Hamster 專有 API
 *   （deleteText／sendKeys／showScriptView／RimeSwitcher 等）不收。
 * - 行為以 osfans/trime v3.3.11 為準（Mode_switch＋toggle、Eisu＋select、command）。
 */

export type BuiltinCategory =
    | "輸入狀態"
    | "候選方案"
    | "游標編輯"
    | "基本按鍵"
    | "鍵盤切換"
    | "面板工具"
    | "設定部署"
    | "顯示開關"
    | "插入內容";

export type BuiltinPresetSpec = {
    label?: string;
    send?: string;
    select?: string;
    toggle?: string;
    command?: string;
    option?: string;
    states?: string[];
    text?: string;
    commit?: string;
    preview?: string;
    shift_lock?: string;
    sticky?: boolean;
    repeatable?: boolean;
    functional?: boolean;
    slide_cursor?: boolean;
    slide_delete?: boolean;
};

type BuiltinDef = {
    id: string;
    title: string;
    category: BuiltinCategory;
    spec: BuiltinPresetSpec;
};

/** 倉輸入法風格通俗名 → 同文可執行動作 */
const BUILTIN_DEFS: BuiltinDef[] = [
    // —— 輸入狀態（倉：重输／简繁／中英）——
    {
        id: "Escape",
        title: "重輸",
        category: "輸入狀態",
        spec: { label: "Esc", send: "Escape" },
    },
    {
        id: "Henkan",
        title: "簡繁切換",
        category: "輸入狀態",
        spec: {
            toggle: "simplification",
            send: "Mode_switch",
            states: ["漢字", "汉字"],
        },
    },
    {
        id: "Mode_switch",
        title: "中英切換",
        category: "輸入狀態",
        spec: {
            toggle: "ascii_mode",
            send: "Mode_switch",
            states: ["中文", "西文"],
        },
    },
    {
        id: "Punct_switch",
        title: "中英標點",
        category: "輸入狀態",
        spec: {
            toggle: "ascii_punct",
            send: "Mode_switch",
            states: ["。，", "．，"],
        },
    },
    {
        id: "Zenkaku_Hankaku",
        title: "全半形",
        category: "輸入狀態",
        spec: {
            toggle: "full_shape",
            send: "Mode_switch",
            states: ["半角", "全角"],
        },
    },
    {
        id: "Charset_switch",
        title: "常用／增廣字",
        category: "輸入狀態",
        spec: {
            toggle: "extended_charset",
            send: "Mode_switch",
            states: ["常用", "增廣"],
        },
    },

    // —— 候選／方案（倉：次选上屏／方案切换）——
    {
        id: "Select_2",
        title: "次選上屏",
        category: "候選方案",
        spec: { label: "次選", command: "select_candidate", option: "1" },
    },
    {
        id: "Select_3",
        title: "三選上屏",
        category: "候選方案",
        spec: { label: "三選", command: "select_candidate", option: "2" },
    },
    {
        id: "DeleteCandidate",
        title: "刪詞",
        category: "候選方案",
        spec: { label: "刪詞", send: "Control+Delete" },
    },
    {
        id: "CommitRawInput",
        title: "上屏編碼",
        category: "候選方案",
        spec: { label: "編碼", send: "Control+Return" },
    },
    {
        id: "CommitComment",
        title: "上屏註釋",
        category: "候選方案",
        spec: { label: "註釋", send: "Control+Shift+Return" },
    },
    {
        id: "BackToPreviousSyllable",
        title: "刪音節",
        category: "候選方案",
        spec: { label: "刪音節", send: "Control+BackSpace" },
    },
    {
        id: "Schema_switch",
        title: "下一方案",
        category: "候選方案",
        spec: { label: "下一方案", send: "Control+Shift+1" },
    },
    {
        id: "Menu",
        title: "方案選單",
        category: "候選方案",
        spec: { label: "方案", send: "MENU" },
    },

    // —— 游標／編輯（倉：行首／全选／剪切…）——
    {
        id: "Home",
        title: "行首",
        category: "游標編輯",
        spec: { label: "行首", send: "Home" },
    },
    {
        id: "End",
        title: "行尾",
        category: "游標編輯",
        spec: { label: "行尾", send: "End" },
    },
    {
        id: "Left",
        title: "左移",
        category: "游標編輯",
        spec: { label: "←", send: "Left" },
    },
    {
        id: "Right",
        title: "右移",
        category: "游標編輯",
        spec: { label: "→", send: "Right" },
    },
    {
        id: "Up",
        title: "上移",
        category: "游標編輯",
        spec: { label: "↑", send: "Up" },
    },
    {
        id: "Down",
        title: "下移",
        category: "游標編輯",
        spec: { label: "↓", send: "Down" },
    },
    {
        id: "Page_Up",
        title: "上頁",
        category: "游標編輯",
        spec: { label: "上頁", send: "Page_Up" },
    },
    {
        id: "Page_Down",
        title: "下頁",
        category: "游標編輯",
        spec: { label: "下頁", send: "Page_Down" },
    },
    {
        id: "Clear",
        title: "清空",
        category: "游標編輯",
        spec: { label: "清空", text: "{Control+a}{BackSpace}" },
    },
    {
        id: "select_all",
        title: "全選",
        category: "游標編輯",
        spec: { label: "全選", send: "Control+a" },
    },
    {
        id: "cut",
        title: "剪下",
        category: "游標編輯",
        spec: { label: "剪下", send: "Control+x" },
    },
    {
        id: "copy",
        title: "複製",
        category: "游標編輯",
        spec: { label: "複製", send: "Control+c" },
    },
    {
        id: "paste",
        title: "貼上",
        category: "游標編輯",
        spec: { label: "貼上", send: "Control+v" },
    },
    {
        id: "undo",
        title: "撤銷",
        category: "游標編輯",
        spec: { label: "撤銷", send: "Control+z" },
    },
    {
        id: "redo",
        title: "重做",
        category: "游標編輯",
        spec: { label: "重做", send: "Control+Shift+z" },
    },
    {
        id: "Delete",
        title: "向前刪除",
        category: "游標編輯",
        spec: { label: "刪除", send: "Delete" },
    },

    // —— 基本按鍵 ——
    {
        id: "Return",
        title: "換行／完成",
        category: "基本按鍵",
        spec: { label: "enter_labels", send: "Return" },
    },
    {
        id: "Return1",
        title: "Enter",
        category: "基本按鍵",
        spec: { label: "Enter", send: "Return" },
    },
    {
        id: "BackSpace",
        title: "退格",
        category: "基本按鍵",
        spec: { label: "退格", repeatable: true, send: "BackSpace" },
    },
    {
        id: "space",
        title: "空格",
        category: "基本按鍵",
        spec: { repeatable: false, functional: false, send: "space" },
    },
    {
        id: "Hide",
        title: "關閉鍵盤",
        category: "基本按鍵",
        spec: { label: "隱藏", send: "BACK" },
    },
    {
        id: "Shift_L",
        title: "Shift",
        category: "基本按鍵",
        spec: { label: "Shift", send: "Shift_L", shift_lock: "ascii_long" },
    },
    {
        id: "Shift_Lock",
        title: "大寫鎖定",
        category: "基本按鍵",
        spec: { label: "⇧", send: "Shift_L", shift_lock: "long" },
    },

    // —— 鍵盤切換（必須 Eisu_toggle + select）——
    {
        id: "Keyboard_default",
        title: "返回主鍵盤",
        category: "鍵盤切換",
        spec: { label: "返回", send: "Eisu_toggle", select: ".default" },
    },
    {
        id: "Keyboard_switch",
        title: "下一鍵盤",
        category: "鍵盤切換",
        spec: { label: "鍵盤", send: "Eisu_toggle", select: ".next" },
    },
    {
        id: "Keyboard_symbols",
        title: "符號鍵盤",
        category: "鍵盤切換",
        spec: { label: "符號", send: "Eisu_toggle", select: "symbols" },
    },
    {
        id: "Keyboard_number",
        title: "數字鍵盤",
        category: "鍵盤切換",
        spec: { label: "數字", send: "Eisu_toggle", select: "number" },
    },
    {
        id: "Keyboard_letter",
        title: "字母鍵盤",
        category: "鍵盤切換",
        spec: { label: "字母", send: "Eisu_toggle", select: "default" },
    },
    {
        id: "Keyboard_mini",
        title: "迷你鍵盤",
        category: "鍵盤切換",
        spec: { label: "迷你", send: "Eisu_toggle", select: "mini" },
    },
    {
        id: "one_hand_switch_1",
        title: "左手模式",
        category: "鍵盤切換",
        spec: {
            toggle: "_one_hand_mode_1",
            send: "Mode_switch",
            states: ["左手", "普通"],
        },
    },
    {
        id: "one_hand_switch_2",
        title: "右手模式",
        category: "鍵盤切換",
        spec: {
            toggle: "_one_hand_mode_2",
            send: "Mode_switch",
            states: ["右手", "普通"],
        },
    },
    {
        id: "one_hand_switch_3",
        title: "左右手切換",
        category: "鍵盤切換",
        spec: {
            toggle: "_one_hand_mode_3",
            send: "Mode_switch",
            states: ["左手", "右手"],
        },
    },
    {
        id: "IME_switch",
        title: "輸入法選單",
        category: "鍵盤切換",
        spec: { label: "🌐", send: "LANGUAGE_SWITCH" },
    },
    {
        id: "IME_next",
        title: "下一輸入法",
        category: "鍵盤切換",
        spec: { label: "下一輸入法", send: "LANGUAGE_SWITCH", select: ".next" },
    },
    {
        id: "IME_last",
        title: "上一輸入法",
        category: "鍵盤切換",
        spec: { label: "上一輸入法", send: "LANGUAGE_SWITCH", select: ".last" },
    },

    // —— 面板（倉：showPasteboardView／更多）——
    {
        id: "clipboard_window",
        title: "剪貼簿",
        category: "面板工具",
        spec: {
            label: "剪貼",
            send: "FUNCTION",
            command: "clipboard_window",
            option: "0",
        },
    },
    {
        id: "liquid_keyboard_switch",
        title: "更多符號",
        category: "面板工具",
        spec: {
            label: "更多",
            send: "FUNCTION",
            command: "liquid_keyboard",
            option: "更多",
        },
    },
    {
        id: "liquid_keyboard_emoji",
        title: "Emoji",
        category: "面板工具",
        spec: {
            label: "🙂",
            send: "FUNCTION",
            command: "liquid_keyboard",
            option: "emoji",
        },
    },
    {
        id: "liquid_keyboard_exit",
        title: "退出更多",
        category: "面板工具",
        spec: {
            label: "返回",
            send: "FUNCTION",
            command: "liquid_keyboard",
            option: "-1",
        },
    },

    // —— 設定／部署 ——
    {
        id: "Theme_settings",
        title: "主題設定",
        category: "設定部署",
        spec: { label: "主題", send: "SETTINGS", option: "theme" },
    },
    {
        id: "Color_settings",
        title: "配色設定",
        category: "設定部署",
        spec: { label: "配色", send: "SETTINGS", option: "color" },
    },
    {
        id: "Schema_settings",
        title: "方案設定",
        category: "設定部署",
        spec: { label: "方案", send: "SETTINGS", option: "schema" },
    },
    {
        id: "Settings",
        title: "同文設定",
        category: "設定部署",
        spec: { label: "設定", send: "SETTINGS" },
    },
    {
        id: "Color_switch",
        title: "切換配色",
        category: "設定部署",
        spec: { label: "配色", send: "PROG_RED" },
    },
    {
        id: "Deploy",
        title: "部署",
        category: "設定部署",
        spec: { label: "部署", send: "FUNCTION", command: "apply", option: "DEPLOY" },
    },
    {
        id: "Sync",
        title: "同步用戶資料",
        category: "設定部署",
        spec: {
            label: "同步",
            send: "FUNCTION",
            command: "apply",
            option: "SYNC_USER_DATA",
        },
    },

    // —— 顯示開關 ——
    {
        id: "Candidate_switch",
        title: "候選列開關",
        category: "顯示開關",
        spec: {
            toggle: "_hide_candidate",
            send: "Mode_switch",
            states: ["有候選", "無候選"],
        },
    },
    {
        id: "Comment_switch",
        title: "註釋開關",
        category: "顯示開關",
        spec: {
            toggle: "_hide_comment",
            send: "Mode_switch",
            states: ["有註釋", "無註釋"],
        },
    },
    {
        id: "Hint_switch",
        title: "助記開關",
        category: "顯示開關",
        spec: {
            toggle: "_hide_key_hint",
            send: "Mode_switch",
            states: ["有助記", "無助記"],
        },
    },
    {
        id: "Symbol_switch",
        title: "角標開關",
        category: "顯示開關",
        spec: {
            toggle: "_hide_key_symbol",
            send: "Mode_switch",
            states: ["有符號", "無符號"],
        },
    },

    // —— 插入 ——
    {
        id: "Date",
        title: "插入日期",
        category: "插入內容",
        spec: { label: "日期", command: "date", option: "yyyy-MM-dd" },
    },
    {
        id: "Time",
        title: "插入時間",
        category: "插入內容",
        spec: { label: "時間", command: "date", option: "HH:mm:ss" },
    },
    {
        id: "ChineseDate",
        title: "插入農曆",
        category: "插入內容",
        spec: { label: "農曆", command: "date", option: "zh_CN@calendar=chinese" },
    },
];

const CATEGORY_ORDER: BuiltinCategory[] = [
    "輸入狀態",
    "候選方案",
    "游標編輯",
    "基本按鍵",
    "鍵盤切換",
    "面板工具",
    "設定部署",
    "顯示開關",
    "插入內容",
];

/** YAML 可用的 preset 本體（不含 title／category） */
export const BUILTIN_PRESET_KEYS: { [id: string]: BuiltinPresetSpec } = Object.fromEntries(
    BUILTIN_DEFS.map((d) => [d.id, d.spec]),
);

export const BUILTIN_PRESET_KEY_IDS: string[] = BUILTIN_DEFS.map((d) => d.id);

export function builtinTitle(id: string): string {
    var def = BUILTIN_DEFS.find((d) => d.id === id);
    return def?.title || id;
}

export function builtinCategory(id: string): BuiltinCategory | "" {
    var def = BUILTIN_DEFS.find((d) => d.id === id);
    return def?.category || "";
}

/** 內建且為 toggle＋雙 states：鍵面由 states 決定，編輯器提供兩個 label */
export function isBuiltinDualState(id: string): boolean {
    var spec = BUILTIN_PRESET_KEYS[id];
    return !!(spec && spec.toggle && Array.isArray(spec.states) && spec.states.length >= 2);
}

export function builtinDefaultStates(id: string): [string, string] {
    var states = BUILTIN_PRESET_KEYS[id]?.states;
    if (!states || states.length < 2) return ["", ""];
    return [states[0] ?? "", states[1] ?? ""];
}

/**
 * 雙狀態變體 id 分隔符（全形／）。
 * Trime preset id＝YAML map key，可含中文；用全形分隔避免和英文 id 的 `_` 混淆。
 */
export const DUAL_STATE_ID_SEP = "／";

const DUAL_BUILTIN_IDS_LONGEST_FIRST: string[] = BUILTIN_PRESET_KEY_IDS.filter(isBuiltinDualState).sort(
    (a, b) => b.length - a.length,
);

function sanitizeDualStatePart(raw: string): string {
    var s = String(raw ?? "").trim();
    if (!s) s = "·";
    // 避免分隔符與 YAML 明文易炸字元進 id
    return s
        .replaceAll(DUAL_STATE_ID_SEP, "∕")
        .replace(/[:#\{\}\[\],&*!|>'"%@`\\]/g, "·")
        .slice(0, 24);
}

/** 從 click id 還原內建雙狀態基底（含 Mode_switch／文／A → Mode_switch） */
export function resolveDualStateBase(id: string): string {
    if (!id) return "";
    if (isBuiltinDualState(id)) return id;
    for (let base of DUAL_BUILTIN_IDS_LONGEST_FIRST) {
        var prefix = base + DUAL_STATE_ID_SEP;
        if (id.startsWith(prefix)) {
            var rest = id.slice(prefix.length);
            var parts = rest.split(DUAL_STATE_ID_SEP);
            if (parts.length === 2) return base;
        }
    }
    return "";
}

/** 是否可走「兩個狀態字」編輯（內建本體或由其衍生的變體 id） */
export function isDualStateEditable(id: string): boolean {
    return !!resolveDualStateBase(id);
}

/**
 * 依兩段狀態字產生獨立 preset id。
 * 若等於內建預設 states，回傳基底 id（不另開變體）。
 */
export function makeDualStateVariantId(baseId: string, state0: string, state1: string): string {
    if (!isBuiltinDualState(baseId)) return baseId;
    var defaults = builtinDefaultStates(baseId);
    var s0 = String(state0 ?? "").trim();
    var s1 = String(state1 ?? "").trim();
    if (s0 === defaults[0] && s1 === defaults[1]) return baseId;
    return [baseId, sanitizeDualStatePart(s0), sanitizeDualStatePart(s1)].join(DUAL_STATE_ID_SEP);
}

export function parseDualStateVariantId(
    id: string,
): { baseId: string; state0: string; state1: string } | null {
    var base = resolveDualStateBase(id);
    if (!base) return null;
    if (id === base) {
        var d = builtinDefaultStates(base);
        return { baseId: base, state0: d[0], state1: d[1] };
    }
    var rest = id.slice(base.length + DUAL_STATE_ID_SEP.length);
    var parts = rest.split(DUAL_STATE_ID_SEP);
    if (parts.length !== 2) return null;
    return { baseId: base, state0: parts[0], state1: parts[1] };
}

/** 雙狀態欄位提示：option 關／開時顯示的字（用基底 id） */
export function builtinStateFieldHints(id: string): [string, string] {
    var base = resolveDualStateBase(id) || id;
    var title = builtinTitle(base);
    switch (base) {
        case "Mode_switch":
            return ["中文時顯示", "西文時顯示"];
        case "Henkan":
            return ["繁體時顯示", "簡體時顯示"];
        case "Punct_switch":
            return ["中文標點時", "英文標點時"];
        case "Zenkaku_Hankaku":
            return ["半形時顯示", "全形時顯示"];
        case "one_hand_switch_1":
        case "one_hand_switch_2":
        case "one_hand_switch_3":
            return ["狀態一", "狀態二"];
        default:
            return [`${title}・關`, `${title}・開`];
    }
}

/** 依分類分組，供下拉選單 optgroup */
export function builtinsGrouped(): { category: BuiltinCategory; ids: string[] }[] {
    return CATEGORY_ORDER.map((category) => ({
        category,
        ids: BUILTIN_DEFS.filter((d) => d.category === category).map((d) => d.id),
    })).filter((g) => g.ids.length > 0);
}

/** 常用 Android／Rime 鍵名（非具名 preset），供 datalist／系統鍵分組 */
export const ANDROID_KEY_NAMES: string[] = [
    "Return",
    "BackSpace",
    "space",
    "Escape",
    "Home",
    "Insert",
    "Delete",
    "End",
    "Page_Up",
    "Page_Down",
    "Left",
    "Down",
    "Up",
    "Right",
    "Shift_L",
    "Shift_R",
    "Control_L",
    "Control_R",
    "Alt_L",
    "Alt_R",
    "Tab",
    "Caps_Lock",
    "Menu",
    "F4",
    "BACK",
    "LANGUAGE_SWITCH",
    "SETTINGS",
    "HELP",
    "INFO",
    "PROG_RED",
    "Mode_switch",
    "Eisu_toggle",
    "FUNCTION",
    "VOICE_ASSIST",
    "KP_0",
    "KP_1",
    "KP_2",
    "KP_3",
    "KP_4",
    "KP_5",
    "KP_6",
    "KP_7",
    "KP_8",
    "KP_9",
];

export function allKeyNameSuggestions(extra: string[] = []): string[] {
    var set = new Set<string>([...BUILTIN_PRESET_KEY_IDS, ...ANDROID_KEY_NAMES, ...extra]);
    return Array.from(set);
}
