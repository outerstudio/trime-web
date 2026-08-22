import { newId } from "./id";

function asString(obj: any, fallback: string = ""): string {
    if (typeof obj === "number") return String(obj);
    return typeof obj === "string" ? obj : fallback;
}

function asBool(obj: any, fallback?: boolean): boolean | undefined {
    return typeof obj === "boolean" ? obj : fallback;
}

/** 預設鍵 preset_keys 條目 */
export class PresetKey {
    /** 編輯器列表用穩定鍵；不寫進 yaml */
    uid: number = newId();
    id: string = "";
    label: string = "";
    send: string = "";
    text: string = "";
    commit: string = "";
    command: string = "";
    option: string = "";
    select: string = "";
    toggle: string = "";
    states: string[] = [];
    preview: string = "";
    functional: boolean | undefined = undefined;
    repeatable: boolean | undefined = undefined;
    sticky: boolean | undefined = undefined;
    slide_cursor: boolean | undefined = undefined;
    slide_delete: boolean | undefined = undefined;
    shift_lock: string = "";

    displayLabel(): string {
        // Trime KeyAction.getLabel: toggle+states 優先於 label
        if (this.toggle && this.states && this.states.length) return this.states[0];
        if (this.label) return this.label;
        if (this.states && this.states.length) return this.states[0];
        if (this.commit) return this.commit;
        if (this.text) return this.text;
        if (this.send) return this.send;
        return this.id;
    }

    fromObject(obj: any, id?: string): void {
        if (id) this.id = id;
        if (!obj || typeof obj !== "object") return;
        this.label = asString(obj.label);
        this.send = asString(obj.send);
        this.text = asString(obj.text);
        this.commit = asString(obj.commit);
        this.command = asString(obj.command);
        this.option = asString(obj.option);
        this.select = asString(obj.select);
        this.toggle = asString(obj.toggle);
        this.preview = asString(obj.preview);
        this.shift_lock = asString(obj.shift_lock);
        this.functional = asBool(obj.functional);
        this.repeatable = asBool(obj.repeatable);
        this.sticky = asBool(obj.sticky);
        this.slide_cursor = asBool(obj.slide_cursor);
        this.slide_delete = asBool(obj.slide_delete);
        if (Array.isArray(obj.states)) {
            this.states = obj.states.map((s: any) => String(s));
        }
    }

    toObject(): object {
        var obj: any = {};
        if (this.label) obj.label = this.label;
        if (this.send) obj.send = this.send;
        if (this.text) obj.text = this.text;
        if (this.commit) obj.commit = this.commit;
        if (this.command) obj.command = this.command;
        if (this.option) obj.option = this.option;
        if (this.select) obj.select = this.select;
        if (this.toggle) obj.toggle = this.toggle;
        if (this.preview) obj.preview = this.preview;
        if (this.shift_lock) obj.shift_lock = this.shift_lock;
        if (this.functional !== undefined) obj.functional = this.functional;
        if (this.repeatable !== undefined) obj.repeatable = this.repeatable;
        if (this.sticky !== undefined) obj.sticky = this.sticky;
        if (this.slide_cursor !== undefined) obj.slide_cursor = this.slide_cursor;
        if (this.slide_delete !== undefined) obj.slide_delete = this.slide_delete;
        if (this.states.length) obj.states = this.states.slice();
        return obj;
    }

    clone(): PresetKey {
        var p = new PresetKey();
        p.id = this.id;
        p.fromObject(this.toObject());
        return p;
    }
}

/** 觸發槽可爲字串或内聯 preset 動作 */
export type TriggerValue = string | PresetKey;

export function parseTrigger(raw: any): TriggerValue {
    if (raw === undefined || raw === null) return "";
    if (typeof raw === "number") return String(raw);
    if (typeof raw === "string") return raw;
    if (typeof raw === "object") {
        var p = new PresetKey();
        p.fromObject(raw);
        return p;
    }
    return "";
}

export function triggerToYaml(v: TriggerValue): any {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    return v.toObject();
}

export function triggerDisplay(v: TriggerValue): string {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v.displayLabel();
}

export function isInlinePreset(raw: any): boolean {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
    var actionKeys = ["send", "text", "commit", "command", "option", "select", "toggle", "label", "states"];
    var hasAction = actionKeys.some((k) => raw[k] !== undefined);
    var triggerKeys = [
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
        "width",
        "height",
        "hint",
        "preview",
        "functional",
        "repeatable",
        "label_symbol",
        "popup",
        "key_text_size",
        "symbol_text_size",
        "key_border",
        "key_text_offset_x",
        "key_text_offset_y",
        "key_symbol_offset_x",
        "key_symbol_offset_y",
        "key_hint_offset_x",
        "key_hint_offset_y",
    ];
    var hasTrigger = triggerKeys.some((k) => raw[k] !== undefined);
    return hasAction && !hasTrigger;
}
