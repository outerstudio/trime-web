import { ColorValue } from "$lib/Trime/model/color";
import { newId } from "$lib/Trime/model/id";
import { PresetKey, type TriggerValue, isInlinePreset, parseTrigger, triggerToYaml } from "$lib/Trime/model/presetKey";

export const TRIGGER_SLOTS = [
    "click",
    "long_click",
    "swipe_left",
    "swipe_right",
    "swipe_up",
    "swipe_down",
    "composing",
    "has_menu",
    "paging",
    "combo",
    "ascii",
    "double_click",
    "lazy_double_click",
    "extra",
] as const;

export type TriggerSlot = (typeof TRIGGER_SLOTS)[number];

export const TRIGGER_LABELS: { [k in TriggerSlot]: string } = {
    click: "中文單按",
    long_click: "長按",
    swipe_left: "左滑",
    swipe_right: "右滑",
    swipe_up: "上滑",
    swipe_down: "下滑",
    composing: "輸入中",
    has_menu: "有選單",
    paging: "翻頁",
    combo: "並擊",
    ascii: "西文單按",
    double_click: "雙按",
    lazy_double_click: "延遲雙按",
    extra: "額外",
};

/** 不放在主區、收進「其他觸發槽」的槽（ascii 會影響鍵面，與 click 並列） */
export const SECONDARY_TRIGGER_SLOTS: TriggerSlot[] = TRIGGER_SLOTS.filter(
    (s) => s !== "click" && s !== "ascii",
);

const KEY_COLOR_FIELDS = [
    "key_back_color",
    "key_text_color",
    "key_symbol_color",
    "hilited_key_back_color",
    "hilited_key_text_color",
    "hilited_key_symbol_color",
];

function asNumber(obj: any, fallback: number = 0): number {
    if (typeof obj === "number" && !Number.isNaN(obj)) return obj;
    if (typeof obj === "string" && obj !== "") {
        var n = Number(obj);
        if (!Number.isNaN(n)) return n;
    }
    return fallback;
}

function asString(obj: any, fallback: string = ""): string {
    if (typeof obj === "number") return String(obj);
    return typeof obj === "string" ? obj : fallback;
}

function asBool(obj: any): boolean | undefined {
    return typeof obj === "boolean" ? obj : undefined;
}

/** 鍵盤按鍵 */
export class Key {
    id: number = newId();
    click: TriggerValue = "";
    long_click: TriggerValue = "";
    swipe_left: TriggerValue = "";
    swipe_right: TriggerValue = "";
    swipe_up: TriggerValue = "";
    swipe_down: TriggerValue = "";
    composing: TriggerValue = "";
    has_menu: TriggerValue = "";
    paging: TriggerValue = "";
    combo: TriggerValue = "";
    ascii: TriggerValue = "";
    double_click: TriggerValue = "";
    lazy_double_click: TriggerValue = "";
    extra: TriggerValue = "";
    width: number = 0;
    height: number = 0;
    label: string = "";
    label_symbol: string = "";
    hint: string = "";
    popup: string[] = [];
    preview: string = "";
    functional: boolean | undefined = undefined;
    repeatable: boolean | undefined = undefined;
    send_bindings: boolean | undefined = undefined;
    key_text_size: number = 0;
    symbol_text_size: number = 0;
    key_border: number = -1;
    key_text_offset_x: number = 0;
    key_text_offset_y: number = 0;
    key_symbol_offset_x: number = 0;
    key_symbol_offset_y: number = 0;
    key_hint_offset_x: number = 0;
    key_hint_offset_y: number = 0;
    colors: { [key: string]: ColorValue } = {};
    /** click 明確寫成空字串時強制換行 */
    clickEmpty: boolean = false;
    /** 整批隱藏角標前的 label_symbol，導出時寫成註釋 */
    labelSymbolSaved: string | undefined = undefined;

    getTrigger(slot: TriggerSlot): TriggerValue {
        return (this as any)[slot] as TriggerValue;
    }

    setTrigger(slot: TriggerSlot, value: TriggerValue): void {
        (this as any)[slot] = value;
        if (slot === "click") {
            this.clickEmpty = value === "";
        }
    }

    fromObject(obj: any): void {
        if (typeof obj === "string" || typeof obj === "number") {
            this.click = String(obj);
            this.clickEmpty = false;
            return;
        }
        if (!obj || typeof obj !== "object") return;
        if (isInlinePreset(obj)) {
            var p = new PresetKey();
            p.fromObject(obj);
            this.click = p;
            return;
        }
        for (let slot of TRIGGER_SLOTS) {
            if (obj[slot] !== undefined) {
                (this as any)[slot] = parseTrigger(obj[slot]);
                if (slot === "click" && obj.click === "") {
                    this.clickEmpty = true;
                }
            }
        }
        this.width = asNumber(obj.width);
        this.height = asNumber(obj.height);
        this.label = asString(obj.label);
        this.label_symbol = asString(obj.label_symbol);
        if (obj.__orig_label_symbol !== undefined) {
            this.labelSymbolSaved = asString(obj.__orig_label_symbol);
        }
        this.hint = asString(obj.hint);
        this.popup = Array.isArray(obj.popup) ? obj.popup.map(String) : [];
        this.preview = asString(obj.preview);
        this.functional = asBool(obj.functional);
        this.repeatable = asBool(obj.repeatable);
        this.send_bindings = asBool(obj.send_bindings);
        this.key_text_size = asNumber(obj.key_text_size);
        this.symbol_text_size = asNumber(obj.symbol_text_size);
        this.key_border = obj.key_border !== undefined ? asNumber(obj.key_border) : -1;
        this.key_text_offset_x = asNumber(obj.key_text_offset_x);
        this.key_text_offset_y = asNumber(obj.key_text_offset_y);
        this.key_symbol_offset_x = asNumber(obj.key_symbol_offset_x);
        this.key_symbol_offset_y = asNumber(obj.key_symbol_offset_y);
        this.key_hint_offset_x = asNumber(obj.key_hint_offset_x);
        this.key_hint_offset_y = asNumber(obj.key_hint_offset_y);
        this.colors = {};
        for (let field of KEY_COLOR_FIELDS) {
            if (obj[field] !== undefined) {
                this.colors[field] = ColorValue.fromAny(obj[field]);
            }
        }
    }

    toObject(): any {
        var obj: any = {};
        for (let slot of TRIGGER_SLOTS) {
            var v = this.getTrigger(slot);
            if (slot === "click" && this.clickEmpty) {
                obj.click = "";
                continue;
            }
            var y = triggerToYaml(v);
            if (y !== undefined) obj[slot] = y;
        }
        if (this.width) obj.width = this.width;
        if (this.height) obj.height = this.height;
        if (this.label) obj.label = this.label;
        if (this.label_symbol) obj.label_symbol = this.label_symbol;
        if (this.hint) obj.hint = this.hint;
        if (this.popup.length) obj.popup = this.popup.slice();
        // Trime 3.3.11 reads preview/functional/repeatable from preset_keys,
        // not from individual keyboard key entries.
        if (this.send_bindings !== undefined) obj.send_bindings = this.send_bindings;
        if (this.key_text_size) obj.key_text_size = this.key_text_size;
        if (this.symbol_text_size) obj.symbol_text_size = this.symbol_text_size;
        if (this.key_border >= 0) obj.key_border = this.key_border;
        if (this.key_text_offset_x) obj.key_text_offset_x = this.key_text_offset_x;
        if (this.key_text_offset_y) obj.key_text_offset_y = this.key_text_offset_y;
        if (this.key_symbol_offset_x) obj.key_symbol_offset_x = this.key_symbol_offset_x;
        if (this.key_symbol_offset_y) obj.key_symbol_offset_y = this.key_symbol_offset_y;
        if (this.key_hint_offset_x) obj.key_hint_offset_x = this.key_hint_offset_x;
        if (this.key_hint_offset_y) obj.key_hint_offset_y = this.key_hint_offset_y;
        for (let [k, v] of Object.entries(this.colors)) {
            var yaml = v.toYaml();
            if (yaml) obj[k] = yaml;
        }
        return obj;
    }

    clone(): Key {
        var k = new Key();
        k.fromObject(this.toObject());
        k.clickEmpty = this.clickEmpty;
        k.labelSymbolSaved = this.labelSymbolSaved;
        return k;
    }
}

export { KEY_COLOR_FIELDS };
