import { ColorScheme } from "./colorScheme";
import { ColorValue } from "./color";
import { Keyboard } from "./keyboard";
import { Key } from "./key";
import { PresetKey } from "./presetKey";
import { Style } from "./style";
import YAML from "yaml";
import { KEYBOARDS_YAML as keyboardsYaml } from "../assets/keyboards";
import { COLORSCHEMES_YAML as colorsYaml } from "../assets/colorschemes";

/** 完整 Trime 主題 */
export class Theme {
    config_version: string = "3.0";
    name: string = "自定義主題";
    author: string = "";
    /** Gallery／列表用簡介；同文 Theme.decode 不讀此欄，會原樣 roundtrip 進 YAML。 */
    description: string = "";
    style: Style = new Style();
    fallbackColors: { [id: string]: string } = { candidate_text_color: "text_color" };
    colorSchemes: ColorScheme[] = [];
    presetKeys: PresetKey[] = [];
    keyboards: Keyboard[] = [];

    constructor() {
        this.name = "預設";
        this.author = "";
        this.description = "";
        this.colorSchemes = [builtinDefaultColorScheme()];
        this.keyboards = [builtinDefaultKeyboard()];
        this.style.keyboards = this.keyboards.map((k) => k.schemaId || k.name).filter(Boolean);
        this.fillKeyboardMetrics();
        this.style.candidate_font = "han.ttf";
        this.style.comment_font = "comment.ttf";
        this.style.key_font = "symbol.ttf";
        this.style.label_font = "label.ttf";
        this.style.latin_font = "latin.ttf";
        this.style.symbol_font = "symbol.ttf";
        this.style.text_font = "latin.ttf";
        this.style.popup_font = "latin.ttf";
        this.style.hanb_font = "hanb.ttf";
    }

    clone(): Theme {
        var t = new Theme();
        t.config_version = this.config_version;
        t.name = this.name;
        t.author = this.author;
        t.description = this.description;
        t.style = this.style.clone();
        t.fallbackColors = { ...this.fallbackColors };
        t.colorSchemes = this.colorSchemes.map((s) => s.clone());
        t.presetKeys = this.presetKeys.map((k) => k.clone());
        t.keyboards = this.keyboards.map((k) => k.clone());
        t.style.keyboards = t.keyboards.map((k) => k.schemaId || k.name).filter(Boolean);
        return t;
    }

    fillKeyboardMetrics(): void {
        var s = this.style;
        for (let k of this.keyboards) {
            if (!k.width) k.width = s.key_width || 10;
            if (!k.height) k.height = s.key_height || 44;
            if (k.round_corner < 0) k.round_corner = s.round_corner;
            if (!k.horizontal_gap) k.horizontal_gap = s.horizontal_gap || 1;
            if (!k.vertical_gap) k.vertical_gap = s.vertical_gap || 1;
            if (!k.keyboard_height) k.keyboard_height = s.keyboard_height || 250;
            if (!k.keyboard_height_land) k.keyboard_height_land = s.keyboard_height_land || 200;
        }
    }
}

function put(scheme: ColorScheme, id: string, hex: string): void {
    scheme.colors[id] = ColorValue.fromAny(hex);
}

export function defaultColorScheme(): ColorScheme {
    var s = new ColorScheme();
    s.schemaId = "default";
    s.name = "預設／default";
    s.author = "";
    put(s, "back_color", "0xe4e7e9");
    put(s, "border_color", "0xc1c7ca");
    put(s, "candidate_separator_color", "0xc1c7ca");
    put(s, "candidate_text_color", "0x5a676e");
    put(s, "comment_text_color", "0x7b868c");
    put(s, "hilited_back_color", "0xccd3d7da");
    put(s, "hilited_candidate_back_color", "0xd3d7da");
    put(s, "hilited_candidate_text_color", "0x000000");
    put(s, "hilited_comment_text_color", "0x000000");
    put(s, "hilited_key_back_color", "0xd3d7da");
    put(s, "hilited_key_symbol_color", "0x000000");
    put(s, "hilited_key_text_color", "0x000000");
    put(s, "hilited_off_key_back_color", "0xd3d7da");
    put(s, "hilited_off_key_text_color", "0x000000");
    put(s, "hilited_on_key_back_color", "0xd3d7da");
    put(s, "hilited_on_key_text_color", "0x000000");
    put(s, "hilited_text_color", "0x23948e");
    put(s, "keyboard_back_color", "0xe4e7e9");
    put(s, "key_back_color", "0xffffff");
    put(s, "key_symbol_color", "0x5f6b73");
    put(s, "key_text_color", "0x37474f");
    put(s, "label_color", "0x000000");
    put(s, "off_key_back_color", "0xd3d7da");
    put(s, "off_key_text_color", "0x000000");
    put(s, "on_key_back_color", "0x23948e");
    put(s, "on_key_text_color", "0x37474f");
    put(s, "preview_back_color", "0x55bfbfbf");
    put(s, "preview_text_color", "0x23948e");
    put(s, "shadow_color", "0x000000");
    put(s, "text_color", "0x5a676e");
    put(s, "text_back_color", "0xcce4e7e9");
    return s;
}

function k(spec: any): Key {
    var key = new Key();
    key.fromObject(spec);
    return key;
}

export function builtinDefaultKeyboard(): Keyboard {
    var all = builtinKeyboards();
    return all.find((kb) => kb.schemaId === "qwerty") || all[0] || defaultKeyboard();
}

export function builtinDefaultColorScheme(): ColorScheme {
    try {
        var parsed = YAML.parse(colorsYaml);
        var list = parsed && Array.isArray(parsed.schemes) ? parsed.schemes : [];
        var spec = list.find((item: any) => item && item.schemaId === "default") || list[0];
        if (spec) {
            var s = new ColorScheme();
            s.fromObject(spec, spec.schemaId || "default");
            s.author = "";
            return s;
        }
    } catch {
        /* fallback below */
    }
    return defaultColorScheme();
}

export function builtinKeyboards(): Keyboard[] {
    try {
        var parsed = YAML.parse(keyboardsYaml);
        var list = parsed && Array.isArray(parsed.keyboards) ? parsed.keyboards : [];
        var kbs: Keyboard[] = list.map((spec: any) => {
            var kb = new Keyboard();
            kb.fromObject(spec, spec.schemaId);
            kb.author = "";
            return kb;
        });
        if (!kbs.length) return [defaultKeyboard()];
        var qwerty = kbs.find((kb) => kb.schemaId === "qwerty");
        if (qwerty) kbs = [qwerty, ...kbs.filter((kb) => kb !== qwerty)];
        return kbs;
    } catch {
        return [defaultKeyboard()];
    }
}

export function defaultKeyboard(): Keyboard {
    var kb = new Keyboard();
    kb.schemaId = "default";
    kb.name = "預設40鍵";
    kb.author = "";
    kb.ascii_mode = 0;
    kb.width = 10;
    kb.height = 44;
    kb.lock = true;
    kb.keys = [
        k({ click: "1", long_click: "!" }),
        k({ click: "2", long_click: "@" }),
        k({ click: "3", long_click: "#" }),
        k({ click: "4", long_click: "$" }),
        k({ click: "5", long_click: "%" }),
        k({ click: "6", long_click: "^" }),
        k({ click: "7", long_click: "&" }),
        k({ click: "8", long_click: "*" }),
        k({ click: "9", long_click: "(" }),
        k({ click: "0", long_click: ")" }),
        k({ click: "q", long_click: "_" }),
        k({ click: "w", long_click: "-" }),
        k({ click: "e", long_click: "+" }),
        k({ click: "r", long_click: "=" }),
        k({ click: "t", long_click: "|" }),
        k({ click: "y", long_click: "\\" }),
        k({ click: "u", long_click: "[" }),
        k({ click: "i", long_click: "]" }),
        k({ click: "o", long_click: "{" }),
        k({ click: "p", long_click: "}" }),
        k({ click: "a", long_click: "select_all" }),
        k({ click: "s", long_click: "Home" }),
        k({ click: "d", long_click: "End" }),
        k({ click: "f", long_click: "Page_Up" }),
        k({ click: "g", long_click: "Page_Down" }),
        k({ click: "h", long_click: "Left" }),
        k({ click: "j", long_click: "Down" }),
        k({ click: "k", long_click: "Up" }),
        k({ click: "l", long_click: "Right" }),
        k({ click: ";", long_click: ":" }),
        k({ click: "z", long_click: "`" }),
        k({ click: "x", long_click: "cut" }),
        k({ click: "c", long_click: "copy" }),
        k({ click: "v", long_click: "paste" }),
        k({ click: "b", long_click: "~" }),
        k({ click: "n", long_click: "Insert" }),
        k({ click: "m", long_click: "Delete" }),
        k({ click: ",", long_click: "<" }),
        k({ click: ".", long_click: ">" }),
        k({ click: "/", long_click: "?" }),
        k({ click: "Shift_L" }),
        k({ click: "Keyboard_symbols", long_click: "Keyboard_number" }),
        k({ click: "Mode_switch", long_click: "Menu" }),
        k({ click: "space", width: 30 }),
        k({ click: "'", long_click: '"' }),
        k({ click: "BackSpace", width: 15 }),
        k({ click: "Return", composing: "Return1", long_click: "CommitComment", width: 15 }),
    ];
    return kb;
}
