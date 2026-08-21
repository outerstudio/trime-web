/** 内置 preset_keys, 摘自 Trime 預設 trime.yaml */
export const BUILTIN_PRESET_KEYS: { [id: string]: any } = {
    BRIGHTNESS_DOWN: {
        label: "亮度-",
        send: "BRIGHTNESS_DOWN",
    },
    BRIGHTNESS_UP: {
        label: "亮度+",
        send: "BRIGHTNESS_UP",
    },
    CALCULATOR: {
        label: "計算機",
        send: "CALCULATOR",
    },
    CALENDAR: {
        label: "日曆",
        send: "CALENDAR",
    },
    CONTACTS: {
        label: "電話簿",
        send: "CONTACTS",
    },
    ENVELOPE: {
        label: "信箱",
        send: "ENVELOPE",
    },
    EXPLORER: {
        label: "瀏覽器",
        send: "EXPLORER",
    },
    MUSIC: {
        label: "音樂",
        send: "MUSIC",
    },
    POWER: {
        label: "電源",
        send: "POWER",
    },
    SEARCH: {
        label: "搜尋",
        send: "SEARCH",
    },
    SLEEP: {
        label: "休眠",
        send: "SLEEP",
    },
    VOICE_ASSIST: {
        label: "語音",
        send: "VOICE_ASSIST",
    },
    VOLUME_DOWN: {
        label: "音量-",
        send: "VOLUME_DOWN",
    },
    VOLUME_UP: {
        label: "音量+",
        send: "VOLUME_UP",
    },
    VOLUME_MUTE: {
        label: "靜音",
        send: "VOLUME_MUTE",
    },
    Shift_L: {
        label: "Shift",
        send: "Shift_L",
        shift_lock: "ascii_long",
    },
    Return: {
        label: "enter_labels",
        send: "Return",
    },
    Return1: {
        label: "Enter",
        send: "Return",
    },
    Return2: {
        label: "回车",
        send: "Return",
    },
    Hide: {
        label: "隱藏",
        send: "BACK",
    },
    BackSpace: {
        label: "退格",
        repeatable: true,
        send: "BackSpace",
    },
    space: {
        repeatable: false,
        functional: false,
        send: "space",
    },
    space1: {
        label: "空格",
        repeatable: false,
        functional: false,
        send: "space",
    },
    Escape: {
        label: "Esc",
        send: "Escape",
    },
    Home: {
        label: "行首",
        send: "Home",
    },
    Insert: {
        label: "插入",
        send: "Insert",
    },
    Delete: {
        label: "刪除",
        send: "Delete",
    },
    End: {
        label: "行尾",
        send: "End",
    },
    Page_Up: {
        label: "上頁",
        send: "Page_Up",
    },
    Page_Down: {
        label: "下頁",
        send: "Page_Down",
    },
    Left: {
        label: "←",
        send: "Left",
    },
    Down: {
        label: "↓",
        send: "Down",
    },
    Up: {
        label: "↑",
        send: "Up",
    },
    Right: {
        label: "→",
        send: "Right",
    },
    select_all: {
        label: "全選",
        send: "Control+a",
    },
    Clear: {
        label: "清除",
        text: "{Control+a}{BackSpace}",
    },
    cut: {
        label: "剪下",
        send: "Control+x",
    },
    cut_all: {
        label: "全挪",
        text: "{Control+a}{Control+x}",
    },
    copy: {
        label: "複製",
        send: "Control+c",
    },
    copy_all: {
        label: "全謄",
        text: "{Control+a}{Control+c}",
    },
    paste: {
        label: "貼上",
        send: "Control+v",
    },
    paste_text: {
        label: "貼上文本",
        send: "Control+Shift+Alt+v",
    },
    share_text: {
        label: "分享文本",
        send: "Control+Alt+s",
    },
    redo: {
        label: "重做",
        send: "Control+Shift+z",
    },
    undo: {
        label: "撤銷",
        send: "Control+z",
    },
    F4: {
        label: "方案選單",
        send: "F4",
    },
    BackToPreviousSyllable: {
        label: "刪音節",
        send: "Control+BackSpace",
    },
    CommitRawInput: {
        label: "編碼",
        send: "Control+Return",
    },
    CommitScriptText: {
        label: "編碼",
        send: "Shift+Return",
    },
    CommitComment: {
        label: "編碼",
        send: "Control+Shift+Return",
    },
    DeleteCandidate: {
        label: "刪詞",
        send: "Control+Delete",
    },
    Mode_switch: {
        toggle: "ascii_mode",
        send: "Mode_switch",
        states: ["中文", "西文"],
    },
    Zenkaku_Hankaku: {
        toggle: "full_shape",
        send: "Mode_switch",
        states: ["半角", "全角"],
    },
    Henkan: {
        toggle: "simplification",
        send: "Mode_switch",
        states: ["漢字", "汉字"],
    },
    Charset_switch: {
        toggle: "extended_charset",
        send: "Mode_switch",
        states: ["常用", "增廣"],
    },
    Punct_switch: {
        toggle: "ascii_punct",
        send: "Mode_switch",
        states: ["。，", "．，"],
    },
    Keyboard_symbols: {
        label: "符號",
        send: "Eisu_toggle",
        select: "symbols",
    },
    Keyboard_number: {
        label: "數字",
        send: "Eisu_toggle",
        select: "number",
    },
    Keyboard_mini: {
        label: "迷你",
        send: "Eisu_toggle",
        select: "mini",
    },
    Keyboard_letter: {
        label: "字母",
        send: "Eisu_toggle",
        select: "default",
    },
    Keyboard_default: {
        label: "返回",
        send: "Eisu_toggle",
        select: ".default",
    },
    Keyboard_switch: {
        label: "鍵盤",
        send: "Eisu_toggle",
        select: ".next",
    },
    liquid_keyboard_switch: {
        label: "更多",
        send: "FUNCTION",
        command: "liquid_keyboard",
        option: "更多",
    },
    liquid_keyboard_exit: {
        label: "返回",
        send: "FUNCTION",
        command: "liquid_keyboard",
        option: "-1",
    },
    liquid_keyboard_emoji: {
        label: "🙂",
        send: "FUNCTION",
        command: "liquid_keyboard",
        option: "emoji",
    },
    clipboard_window: {
        label: "剪贴",
        send: "FUNCTION",
        command: "clipboard_window",
        option: "0",
    },
    set_color_ink: {
        label: "切换到ink配色",
        send: "FUNCTION",
        command: "set_color_scheme",
        option: "ink",
    },
    set_theme_ink: {
        label: "切换到ink主题",
        send: "FUNCTION",
        command: "set_theme",
        option: "ink",
    },
    IME_switch: {
        label: "🌐",
        send: "LANGUAGE_SWITCH",
    },
    IME_last: {
        label: "上一輸入法",
        send: "LANGUAGE_SWITCH",
        select: ".last",
    },
    IME_next: {
        label: "下一輸入法",
        send: "LANGUAGE_SWITCH",
        select: ".next",
    },
    Schema_switch: {
        label: "下一方案",
        send: "Control+Shift+1",
    },
    one_hand_switch_1: {
        toggle: "_one_hand_mode_1",
        send: "Mode_switch",
        states: ["左手", "普通"],
    },
    one_hand_switch_2: {
        toggle: "_one_hand_mode_2",
        send: "Mode_switch",
        states: ["右手", "普通"],
    },
    one_hand_switch_3: {
        toggle: "_one_hand_mode_3",
        send: "Mode_switch",
        states: ["左手", "右手"],
    },
    Color_switch: {
        label: "配色",
        send: "PROG_RED",
    },
    Help: {
        label: "說明",
        send: "HELP",
    },
    Info: {
        label: "關於",
        send: "INFO",
    },
    Menu: {
        label: "方案",
        send: "MENU",
    },
    Settings: {
        label: "設定",
        send: "SETTINGS",
    },
    Color_settings: {
        label: "配色",
        send: "SETTINGS",
        option: "color",
    },
    Theme_settings: {
        label: "主題",
        send: "SETTINGS",
        option: "theme",
    },
    Schema_settings: {
        label: "方案",
        send: "SETTINGS",
        option: "schema",
    },
    Candidate_switch: {
        toggle: "_hide_candidate",
        send: "Mode_switch",
        states: ["有候選", "無候選"],
    },
    Comment_switch: {
        toggle: "_hide_comment",
        send: "Mode_switch",
        states: ["有註釋", "無註釋"],
    },
    Hint_switch: {
        toggle: "_hide_key_hint",
        send: "Mode_switch",
        states: ["有助記", "無助記"],
    },
    Symbol_switch: {
        toggle: "_hide_key_symbol",
        send: "Mode_switch",
        states: ["有符號", "無符號"],
    },
    Date: {
        label: "日期",
        command: "date",
        option: "yyyy-MM-dd",
    },
    ChineseDate: {
        label: "農曆",
        command: "date",
        option: "zh_CN@calendar=chinese",
    },
    Time: {
        label: "時間",
        command: "date",
        option: "HH:mm:ss",
    },
    TrimeApp: {
        label: "同文",
        command: "run",
        option: "com.osfans.trime",
    },
    TrimeCmp: {
        label: "同文組件",
        command: "run",
        option: "com.osfans.trime/.ui.main.MainActivity",
    },
    Homepage: {
        label: "同文主頁",
        command: "run",
        option: "https://github.com/osfans/trime",
    },
    CommitHomepage: {
        label: "同文網址",
        commit: "https://github.com/osfans/trime",
    },
    Wiki: {
        label: "維基",
        command: "run",
        option: "https://zh.wikipedia.org/wiki/%s",
    },
    Google: {
        label: "谷歌",
        command: "run",
        option: "https://www.google.com/search?q=%s",
    },
    MoeDict: {
        label: "萌典",
        command: "run",
        option: "https://www.moedict.tw/%3$s",
    },
    Baidu: {
        label: "百度搜索",
        command: "run",
        option: "https://www.baidu.com/s?wd=%4$s",
    },
    Zdic: {
        label: "漢典",
        command: "run",
        option: "http://www.zdic.net/sousuo/?q=%1$s",
    },
    Zdic2: {
        label: "漢典",
        command: "run",
        option: "http://www.zdic.net/sousuo/?q=%2$s",
    },
    WebSearch: {
        label: "搜索網頁",
        command: "web_search",
        option: "%4$s",
    },
    Search: {
        label: "搜索",
        command: "search",
        option: "%1$s",
    },
    Share: {
        label: "分享",
        command: "send",
        option: "%s",
    },
    Deploy: {
        label: "部署",
        send: "FUNCTION",
        command: "apply",
        option: "DEPLOY",
    },
    Sync: {
        label: "同步",
        send: "FUNCTION",
        command: "apply",
        option: "SYNC_USER_DATA",
    },
    updateConfig: {
        label: "更新配置",
        send: "FUNCTION",
        command: "apply",
        option: "UPDATE_CONFIG",
    },
    RepeatCommit: {
        label: "重复",
        command: "commit",
        option: "%1$s",
    },
};

export const BUILTIN_PRESET_KEY_IDS: string[] = Object.keys(BUILTIN_PRESET_KEYS);

/** 常用 Android / Rime 鍵名, 供編輯器 datalist 補全 */
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
    "BRIGHTNESS_DOWN",
    "BRIGHTNESS_UP",
    "VOLUME_DOWN",
    "VOLUME_UP",
    "VOLUME_MUTE",
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
