function asNumber(obj: any, fallback: number): number {
    if (typeof obj === "number" && !Number.isNaN(obj)) return obj;
    if (typeof obj === "string" && obj !== "") {
        var n = Number(obj);
        if (!Number.isNaN(n)) return n;
    }
    return fallback;
}

/** 頂層 window 段: 候選懸浮窗 (2025-09 新配置) */
export class CandidateWindow {
    inset_vertical: number = 4;
    inset_horizontal: number = 4;
    item_padding_vertical: number = 2;
    item_padding_horizontal: number = 4;
    min_width: number = 0;
    corner_radius: number = 0;
    border: number = 0;
    shadow: number = 0;
    alpha: number = 1;
    label_font_size: number = 20;
    text_font_size: number = 20;
    comment_font_size: number = 16;

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        if (obj.insets && typeof obj.insets === "object") {
            this.inset_vertical = asNumber(obj.insets.vertical, this.inset_vertical);
            this.inset_horizontal = asNumber(obj.insets.horizontal, this.inset_horizontal);
        }
        if (obj.item_padding && typeof obj.item_padding === "object") {
            this.item_padding_vertical = asNumber(obj.item_padding.vertical, this.item_padding_vertical);
            this.item_padding_horizontal = asNumber(obj.item_padding.horizontal, this.item_padding_horizontal);
        }
        this.min_width = asNumber(obj.min_width, this.min_width);
        this.corner_radius = asNumber(obj.corner_radius, this.corner_radius);
        this.border = asNumber(obj.border, this.border);
        this.shadow = asNumber(obj.shadow, this.shadow);
        this.alpha = asNumber(obj.alpha, this.alpha);
        if (obj.foreground && typeof obj.foreground === "object") {
            this.label_font_size = asNumber(obj.foreground.label_font_size, this.label_font_size);
            this.text_font_size = asNumber(obj.foreground.text_font_size, this.text_font_size);
            this.comment_font_size = asNumber(obj.foreground.comment_font_size, this.comment_font_size);
        }
    }

    toObject(): object {
        var obj: any = {
            insets: {
                vertical: this.inset_vertical,
                horizontal: this.inset_horizontal,
            },
            item_padding: {
                vertical: this.item_padding_vertical,
                horizontal: this.item_padding_horizontal,
            },
            foreground: {
                label_font_size: this.label_font_size,
                text_font_size: this.text_font_size,
                comment_font_size: this.comment_font_size,
            },
        };
        if (this.min_width) obj.min_width = this.min_width;
        if (this.corner_radius) obj.corner_radius = this.corner_radius;
        if (this.border) obj.border = this.border;
        if (this.shadow) obj.shadow = this.shadow;
        if (this.alpha !== 1) obj.alpha = this.alpha;
        return obj;
    }

    clone(): CandidateWindow {
        var w = new CandidateWindow();
        w.fromObject(this.toObject());
        return w;
    }
}
