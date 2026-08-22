function asString(obj: any, fallback: string = ""): string {
    if (typeof obj === "number") return String(obj);
    return typeof obj === "string" ? obj : fallback;
}

function asNumber(obj: any, fallback: number): number {
    if (typeof obj === "number" && !Number.isNaN(obj)) return obj;
    if (typeof obj === "string" && obj !== "") {
        var n = Number(obj);
        if (!Number.isNaN(n)) return n;
    }
    return fallback;
}

function asStringList(obj: any): string[] {
    if (typeof obj === "string" && obj) return [obj];
    if (!Array.isArray(obj)) return [];
    return obj.map((s) => String(s)).filter(Boolean);
}

function firstString(...vals: any[]): string {
    for (let v of vals) {
        if (typeof v === "string" && v) return v;
    }
    return "";
}

function asIntList(obj: any): number[] {
    if (!Array.isArray(obj)) return [];
    return obj.map((n) => Number(n)).filter((n) => !Number.isNaN(n));
}

export class ToolBarButtonBackground {
    type: string = "rectangle";
    corner_radius: number = 10;
    normal: string = "";
    highlight: string = "";
    vertical_inset: number = 4;
    horizontal_inset: number = 4;

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.type = asString(obj.type, this.type) || "rectangle";
        this.corner_radius = asNumber(obj.corner_radius, this.corner_radius);
        this.normal = firstString(obj.bg_normal, obj.normal);
        this.highlight = firstString(obj.bg_highlight, obj.bg_hightlight, obj.highlight);
        this.vertical_inset = asNumber(obj.vertical_inset, this.vertical_inset);
        this.horizontal_inset = asNumber(obj.horizontal_inset, this.horizontal_inset);
    }

    toObject(): object | undefined {
        var obj: any = {};
        if (this.type && this.type !== "rectangle") obj.type = this.type;
        if (this.corner_radius !== 10) obj.corner_radius = this.corner_radius;
        if (this.normal) {
            obj.bg_normal = this.normal;
            obj.normal = this.normal;
        }
        if (this.highlight) {
            obj.bg_highlight = this.highlight;
            obj.highlight = this.highlight;
        }
        if (this.vertical_inset !== 4) obj.vertical_inset = this.vertical_inset;
        if (this.horizontal_inset !== 4) obj.horizontal_inset = this.horizontal_inset;
        return Object.keys(obj).length ? obj : undefined;
    }
}

export class ToolBarButtonForeground {
    style: string = "";
    option_styles: string[] = [];
    normal: string = "";
    highlight: string = "";
    font_size: number = 18;
    padding: number = 4;
    size: number[] = [];

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.style = asString(obj.style);
        this.option_styles = asStringList(obj.option_styles);
        this.normal = firstString(obj.fg_normal, obj.normal);
        this.highlight = firstString(obj.fg_highlight, obj.highlight);
        this.font_size = asNumber(obj.font_size, this.font_size);
        this.padding = asNumber(obj.padding, this.padding);
        this.size = asIntList(obj.size);
    }

    toObject(): object | undefined {
        var obj: any = {};
        if (this.style) obj.style = this.style;
        if (this.option_styles.length) obj.option_styles = this.option_styles.slice();
        if (this.normal) {
            obj.fg_normal = this.normal;
            obj.normal = this.normal;
        }
        if (this.highlight) {
            obj.fg_highlight = this.highlight;
            obj.highlight = this.highlight;
        }
        if (this.font_size !== 18) obj.font_size = this.font_size;
        if (this.padding !== 4) obj.padding = this.padding;
        if (this.size.length) obj.size = this.size.slice();
        return Object.keys(obj).length ? obj : undefined;
    }
}

export class ToolBarButton {
    background: ToolBarButtonBackground = new ToolBarButtonBackground();
    foreground: ToolBarButtonForeground = new ToolBarButtonForeground();
    action: string = "";
    long_press_action: string = "";
    size: number[] = [];

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.background.fromObject(obj.background);
        this.foreground.fromObject(obj.foreground);
        this.action = asString(obj.action);
        this.long_press_action = asString(obj.long_press_action);
        this.size = asIntList(obj.size);
        if (!this.size.length && this.foreground.size.length) this.size = this.foreground.size.slice();
    }

    toObject(): object {
        var obj: any = {};
        var bg = this.background.toObject();
        var fg = this.foreground.toObject();
        if (bg) obj.background = bg;
        if (fg) obj.foreground = fg;
        if (this.action) obj.action = this.action;
        if (this.long_press_action) obj.long_press_action = this.long_press_action;
        if (this.size.length) obj.size = this.size.slice();
        return obj;
    }

    clone(): ToolBarButton {
        var b = new ToolBarButton();
        b.fromObject(this.toObject());
        return b;
    }

    displayFace(): string {
        if (this.foreground.style) return this.foreground.style;
        if (this.foreground.option_styles.length) return this.foreground.option_styles[0];
        return this.action || "按鈕";
    }
}

/** 頂層 tool_bar 段 (2025-09 新配置) */
export class ToolBar {
    primary_button: ToolBarButton | null = null;
    buttons: ToolBarButton[] = [];
    button_spacing: number = 18;
    button_font: string[] = [];
    back_style: string = "ic@arrow_left";

    get empty(): boolean {
        return !this.primary_button && !this.buttons.length && !this.button_font.length && this.button_spacing === 18;
    }

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        if (obj.primary_button) {
            this.primary_button = new ToolBarButton();
            this.primary_button.fromObject(obj.primary_button);
        } else {
            this.primary_button = null;
        }
        this.buttons = Array.isArray(obj.buttons)
            ? obj.buttons.map((item: any) => {
                  var b = new ToolBarButton();
                  b.fromObject(item);
                  return b;
              })
            : [];
        this.button_spacing = asNumber(obj.button_spacing, this.button_spacing);
        this.button_font = asStringList(obj.button_font);
        this.back_style = asString(obj.back_style, this.back_style);
    }

    toObject(): object | undefined {
        if (this.empty) return undefined;
        var obj: any = {};
        if (this.primary_button) obj.primary_button = this.primary_button.toObject();
        if (this.buttons.length) obj.buttons = this.buttons.map((b) => b.toObject());
        if (this.button_spacing !== 18) obj.button_spacing = this.button_spacing;
        if (this.button_font.length) obj.button_font = this.button_font.slice();
        if (this.back_style && this.back_style !== "ic@arrow_left") obj.back_style = this.back_style;
        return obj;
    }

    clone(): ToolBar {
        var t = new ToolBar();
        t.button_spacing = this.button_spacing;
        t.button_font = this.button_font.slice();
        t.back_style = this.back_style;
        t.primary_button = this.primary_button ? this.primary_button.clone() : null;
        t.buttons = this.buttons.map((b) => b.clone());
        return t;
    }
}

/** Map Trime `ic@name` (Iconics cmd_*) to Iconify `mdi:…` for web preview. */
export function iconifyFromTrimeStyle(style: string): string {
    if (!style) return "";
    var s = style.trim();
    if (!s.startsWith("ic@")) return "";
    return "mdi:" + s.slice(3).replace(/_/g, "-");
}
