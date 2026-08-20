import { Preedit } from "$lib/Trime/model/preedit";
import { CandidateWindow } from "$lib/Trime/model/window";
import { ToolBar } from "$lib/Trime/model/toolBar";

function asString(obj: any, fallback: string = ""): string {
    if (typeof obj === "number") return String(obj);
    return typeof obj === "string" ? obj : fallback;
}

/** Trime 3.3.x font fields are YAML sequences; keep comma-separated text in UI. */
function asFontText(obj: any): string {
    if (Array.isArray(obj)) return obj.map(String).filter(Boolean).join(", ");
    return asString(obj);
}

function fontList(text: string): string[] | undefined {
    var list = text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return list.length ? list : undefined;
}

function asNumber(obj: any, fallback: number = 0): number {
    if (typeof obj === "number" && !Number.isNaN(obj)) return obj;
    if (typeof obj === "string" && obj !== "") {
        var n = Number(obj);
        if (!Number.isNaN(n)) return n;
    }
    return fallback;
}

function asBool(obj: any, fallback: boolean = false): boolean {
    return typeof obj === "boolean" ? obj : fallback;
}

export class EnterLabels {
    go: string = "前往";
    done: string = "完成";
    next: string = "下個";
    pre: string = "上個";
    search: string = "搜索";
    send: string = "發送";
    default: string = "Enter";

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.go = asString(obj.go, this.go);
        this.done = asString(obj.done, this.done);
        this.next = asString(obj.next, this.next);
        this.pre = asString(obj.pre, this.pre);
        this.search = asString(obj.search, this.search);
        this.send = asString(obj.send, this.send);
        this.default = asString(obj.default, this.default);
    }

    toObject(): object {
        return {
            go: this.go,
            done: this.done,
            next: this.next,
            pre: this.pre,
            search: this.search,
            send: this.send,
            default: this.default,
        };
    }

    clone(): EnterLabels {
        var e = new EnterLabels();
        e.fromObject(this.toObject());
        return e;
    }
}

/** 主題 style 段 */
export class Style {
    auto_caps: boolean = false;
    comment_position: string = "right";
    keyboards: string[] = [];
    key_width: number = 10;
    key_height: number = 44;
    round_corner: number = 8;
    horizontal_gap: number = 1;
    vertical_gap: number = 1;
    keyboard_padding: number = 0;
    keyboard_padding_left: number = 0;
    keyboard_padding_right: number = 0;
    keyboard_padding_bottom: number = 0;
    keyboard_padding_land: number = 0;
    keyboard_padding_land_bottom: number = 0;
    keyboard_height: number = 250;
    keyboard_height_land: number = 200;
    candidate_padding: number = 5;
    candidate_spacing: number = 0;
    candidate_text_size: number = 22;
    candidate_view_height: number = 28;
    candidate_text_vertical_bias: number = 1;
    comment_height: number = 12;
    comment_text_size: number = 10;
    comment_vertical_bias: number = 0;
    key_text_size: number = 22;
    key_long_text_size: number = 14;
    label_text_size: number = 22;
    symbol_text_size: number = 10;
    popup_height: number = 60;
    popup_bottom_margin: number = -12;
    popup_width: number = 0;
    popup_key_height: number = 0;
    popup_text_size: number = 40;
    shadow_radius: number = 0;
    reset_ascii_mode_on_focus_change: boolean = false;
    enter_label_mode: number = 0;
    candidate_font: string = "";
    comment_font: string = "";
    hanb_font: string = "";
    key_font: string = "";
    label_font: string = "";
    latin_font: string = "";
    popup_font: string = "";
    symbol_font: string = "";
    text_font: string = "";
    background_folder: string = "";
    enter_labels: EnterLabels = new EnterLabels();
    preedit: Preedit = new Preedit();
    window: CandidateWindow = new CandidateWindow();
    toolBar: ToolBar = new ToolBar();

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.auto_caps = asBool(obj.auto_caps, this.auto_caps);
        this.comment_position = asString(obj.comment_position, this.comment_position);
        this.key_width = asNumber(obj.key_width, this.key_width);
        this.key_height = asNumber(obj.key_height, this.key_height);
        this.round_corner = asNumber(obj.round_corner, this.round_corner);
        this.horizontal_gap = asNumber(obj.horizontal_gap, this.horizontal_gap);
        this.vertical_gap = asNumber(obj.vertical_gap, this.vertical_gap);
        this.keyboard_padding = asNumber(obj.keyboard_padding, this.keyboard_padding);
        this.keyboard_padding_left = asNumber(obj.keyboard_padding_left, this.keyboard_padding_left);
        this.keyboard_padding_right = asNumber(obj.keyboard_padding_right, this.keyboard_padding_right);
        this.keyboard_padding_bottom = asNumber(obj.keyboard_padding_bottom, this.keyboard_padding_bottom);
        this.keyboard_padding_land = asNumber(obj.keyboard_padding_land, this.keyboard_padding_land);
        this.keyboard_padding_land_bottom = asNumber(
            obj.keyboard_padding_land_bottom,
            this.keyboard_padding_land_bottom,
        );
        this.keyboard_height = asNumber(obj.keyboard_height, this.keyboard_height);
        this.keyboard_height_land = asNumber(obj.keyboard_height_land, this.keyboard_height_land);
        this.candidate_padding = asNumber(obj.candidate_padding, this.candidate_padding);
        this.candidate_spacing = asNumber(obj.candidate_spacing, this.candidate_spacing);
        this.candidate_text_size = asNumber(obj.candidate_text_size, this.candidate_text_size);
        this.candidate_view_height = asNumber(obj.candidate_view_height, this.candidate_view_height);
        this.candidate_text_vertical_bias = asNumber(
            obj.candidate_text_vertical_bias,
            this.candidate_text_vertical_bias,
        );
        this.comment_height = asNumber(obj.comment_height, this.comment_height);
        this.comment_text_size = asNumber(obj.comment_text_size, this.comment_text_size);
        this.comment_vertical_bias = asNumber(obj.comment_vertical_bias, this.comment_vertical_bias);
        this.key_text_size = asNumber(obj.key_text_size, this.key_text_size);
        this.key_long_text_size = asNumber(obj.key_long_text_size, this.key_long_text_size);
        this.label_text_size = asNumber(obj.label_text_size, this.label_text_size);
        this.symbol_text_size = asNumber(obj.symbol_text_size, this.symbol_text_size);
        this.popup_height = asNumber(obj.popup_height ?? obj.preview_height, this.popup_height);
        this.popup_bottom_margin = asNumber(
            obj.popup_bottom_margin ?? obj.preview_offset,
            this.popup_bottom_margin,
        );
        this.popup_width = asNumber(obj.popup_width, this.popup_width);
        this.popup_key_height = asNumber(obj.popup_key_height, this.popup_key_height);
        this.popup_text_size = asNumber(obj.popup_text_size ?? obj.preview_text_size, this.popup_text_size);
        this.shadow_radius = asNumber(obj.shadow_radius, this.shadow_radius);
        this.reset_ascii_mode_on_focus_change = asBool(
            obj.reset_ascii_mode_on_focus_change,
            this.reset_ascii_mode_on_focus_change,
        );
        this.enter_label_mode = asNumber(obj.enter_label_mode, this.enter_label_mode);
        this.candidate_font = asFontText(obj.candidate_font);
        this.comment_font = asFontText(obj.comment_font);
        this.hanb_font = asFontText(obj.hanb_font);
        this.key_font = asFontText(obj.key_font);
        this.label_font = asFontText(obj.label_font);
        this.latin_font = asFontText(obj.latin_font);
        this.popup_font = asFontText(obj.popup_font ?? obj.preview_font);
        this.symbol_font = asFontText(obj.symbol_font);
        this.text_font = asFontText(obj.text_font);
        this.background_folder = asString(obj.background_folder);
        if (obj.enter_labels) this.enter_labels.fromObject(obj.enter_labels);
    }

    toObject(): object {
        var obj: any = {
            auto_caps: this.auto_caps || undefined,
            comment_position: this.comment_position || undefined,
            keyboards: this.keyboards.length ? this.keyboards : undefined,
            keyboard_padding: this.keyboard_padding || undefined,
            keyboard_padding_left: this.keyboard_padding_left || undefined,
            keyboard_padding_right: this.keyboard_padding_right || undefined,
            keyboard_padding_bottom: this.keyboard_padding_bottom || undefined,
            keyboard_padding_land: this.keyboard_padding_land || undefined,
            keyboard_padding_land_bottom: this.keyboard_padding_land_bottom || undefined,
            candidate_padding: this.candidate_padding,
            candidate_spacing: this.candidate_spacing || undefined,
            candidate_text_size: this.candidate_text_size,
            candidate_view_height: this.candidate_view_height,
            candidate_text_vertical_bias: this.candidate_text_vertical_bias,
            comment_height: this.comment_height,
            comment_text_size: this.comment_text_size,
            comment_vertical_bias: this.comment_vertical_bias,
            key_text_size: this.key_text_size,
            key_long_text_size: this.key_long_text_size,
            label_text_size: this.label_text_size,
            symbol_text_size: this.symbol_text_size,
            popup_height: this.popup_height,
            popup_bottom_margin: this.popup_bottom_margin,
            popup_width: this.popup_width || undefined,
            popup_key_height: this.popup_key_height || undefined,
            popup_text_size: this.popup_text_size,
            shadow_radius: this.shadow_radius || undefined,
            reset_ascii_mode_on_focus_change: this.reset_ascii_mode_on_focus_change || undefined,
            enter_label_mode: this.enter_label_mode || undefined,
            candidate_font: fontList(this.candidate_font),
            comment_font: fontList(this.comment_font),
            hanb_font: fontList(this.hanb_font),
            key_font: fontList(this.key_font),
            label_font: fontList(this.label_font),
            latin_font: fontList(this.latin_font),
            popup_font: fontList(this.popup_font),
            symbol_font: fontList(this.symbol_font),
            text_font: fontList(this.text_font),
            background_folder: this.background_folder || undefined,
            enter_labels: this.enter_labels.toObject(),
        };
        return obj;
    }

    clone(): Style {
        var s = new Style();
        s.fromObject(this.toObject());
        s.preedit = (this.preedit ?? new Preedit()).clone();
        s.window = (this.window ?? new CandidateWindow()).clone();
        s.toolBar = (this.toolBar ?? new ToolBar()).clone();
        s.keyboards = this.keyboards.slice();
        return s;
    }
}
