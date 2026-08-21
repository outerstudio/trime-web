function asNumber(obj: any, fallback: number): number {
    if (typeof obj === "number" && !Number.isNaN(obj)) return obj;
    if (typeof obj === "string" && obj !== "") {
        var n = Number(obj);
        if (!Number.isNaN(n)) return n;
    }
    return fallback;
}

/** 頂層 preedit 段 (2025-09 新配置) */
export class Preedit {
    horizontal_padding: number = 8;
    top_end_radius: number = 4;
    alpha: number = 1;
    font_size: number = 16;

    fromObject(obj: any): void {
        if (!obj || typeof obj !== "object") return;
        this.horizontal_padding = asNumber(obj.horizontal_padding, this.horizontal_padding);
        this.top_end_radius = asNumber(obj.top_end_radius, this.top_end_radius);
        this.alpha = asNumber(obj.alpha, this.alpha);
        if (obj.foreground && typeof obj.foreground === "object") {
            this.font_size = asNumber(obj.foreground.font_size, this.font_size);
        }
    }

    toObject(): object {
        var obj: any = {
            horizontal_padding: this.horizontal_padding,
            top_end_radius: this.top_end_radius,
            foreground: { font_size: this.font_size },
        };
        if (this.alpha !== 1) (obj as any).alpha = this.alpha;
        return obj;
    }

    clone(): Preedit {
        var p = new Preedit();
        p.fromObject(this.toObject());
        return p;
    }
}
