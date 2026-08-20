/** 配色取值種類: 實色 / 組標籤引用 / 圖片檔名 */
export type ColorKind = "color" | "ref" | "image";

const HEX6 = /^#?([0-9a-fA-F]{6})$/;
const HEX8 = /^#?([0-9a-fA-F]{8})$/;
const HEX0X6 = /^0x([0-9a-fA-F]{6})$/i;
const HEX0X8 = /^0x([0-9a-fA-F]{8})$/i;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|9\.png)$/i;

/** 常用 CSS 顔色名 → RGB */
export const CSS_COLOR_NAMES: { [name: string]: string } = {
    black: "#000000",
    silver: "#c0c0c0",
    gray: "#808080",
    grey: "#808080",
    white: "#ffffff",
    maroon: "#800000",
    red: "#ff0000",
    purple: "#800080",
    fuchsia: "#ff00ff",
    magenta: "#ff00ff",
    green: "#008000",
    lime: "#00ff00",
    olive: "#808000",
    yellow: "#ffff00",
    navy: "#000080",
    blue: "#0000ff",
    teal: "#008080",
    aqua: "#00ffff",
    cyan: "#00ffff",
    orange: "#ffa500",
    pink: "#ffc0cb",
    brown: "#a52a2a",
    gold: "#ffd700",
    indigo: "#4b0082",
    violet: "#ee82ee",
    transparent: "#00000000",
};

function padHex(hex: string, len: number): string {
    return hex.toUpperCase().padStart(len, "0");
}

function looksLikeImage(s: string): boolean {
    if (!s) return false;
    if (IMAGE_EXT.test(s)) return true;
    if (s.includes("/") && /\.[A-Za-z0-9]+$/.test(s)) return true;
    return false;
}

function looksLikeRef(s: string): boolean {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(s);
}

/**
 * Trime 顔色值. 導出爲 ARGB `0xAARRGGBB`, 預覽用 `rgba()`.
 */
export class ColorValue {
    kind: ColorKind = "color";
    /** `#RRGGBB` 或空 */
    color: string = "";
    /** 0–255 */
    alpha: number = 0xff;
    /** 組標籤名 */
    ref: string = "";
    /** 圖片檔名 */
    image: string = "";

    constructor(kind?: ColorKind) {
        if (kind) this.kind = kind;
    }

    static fromAny(raw: any): ColorValue {
        var value = new ColorValue();
        value.parse(raw);
        return value;
    }

    parse(raw: any): void {
        if (raw === undefined || raw === null || raw === "") {
            this.kind = "color";
            this.color = "";
            this.alpha = 0xff;
            this.ref = "";
            this.image = "";
            return;
        }
        if (typeof raw === "number") {
            var hex = raw.toString(16);
            if (raw > 0xffffff || hex.length > 6) {
                hex = padHex(hex, 8);
                this.kind = "color";
                this.alpha = parseInt(hex.slice(0, 2), 16);
                this.color = "#" + hex.slice(2, 8);
            } else {
                hex = padHex(hex, 6);
                this.kind = "color";
                this.alpha = 0xff;
                this.color = "#" + hex;
            }
            this.ref = "";
            this.image = "";
            return;
        }
        if (typeof raw !== "string") {
            this.parse("");
            return;
        }
        var s = raw.trim();
        var m8 = HEX0X8.exec(s) || HEX8.exec(s);
        if (m8) {
            this.kind = "color";
            this.alpha = parseInt(m8[1].slice(0, 2), 16);
            this.color = "#" + m8[1].slice(2, 8).toUpperCase();
            this.ref = "";
            this.image = "";
            return;
        }
        var m6 = HEX0X6.exec(s) || HEX6.exec(s);
        if (m6) {
            this.kind = "color";
            this.alpha = 0xff;
            this.color = "#" + m6[1].toUpperCase();
            this.ref = "";
            this.image = "";
            return;
        }
        var css = CSS_COLOR_NAMES[s.toLowerCase()];
        if (css) {
            if (css.length === 9) {
                this.kind = "color";
                this.alpha = parseInt(css.slice(1, 3), 16);
                this.color = "#" + css.slice(3);
            } else {
                this.kind = "color";
                this.alpha = 0xff;
                this.color = css.toUpperCase();
            }
            this.ref = "";
            this.image = "";
            return;
        }
        if (looksLikeImage(s)) {
            this.kind = "image";
            this.image = s;
            this.color = "";
            this.ref = "";
            this.alpha = 0xff;
            return;
        }
        if (looksLikeRef(s)) {
            this.kind = "ref";
            this.ref = s;
            this.color = "";
            this.image = "";
            this.alpha = 0xff;
            return;
        }
        this.kind = "color";
        this.color = "";
        this.alpha = 0xff;
        this.ref = "";
        this.image = "";
    }

    /** 規範寫法 `0xAARRGGBB`；引用與圖片原樣寫回 */
    toYaml(): string | undefined {
        if (this.kind === "ref") {
            return this.ref || undefined;
        }
        if (this.kind === "image") {
            return this.image || undefined;
        }
        if (!this.color) {
            return undefined;
        }
        var rgb = this.color.replace(/^#/, "").toUpperCase();
        if (rgb.length !== 6) {
            return undefined;
        }
        var a = padHex(this.alpha.toString(16), 2);
        return "0x" + a + rgb;
    }

    argb(): string {
        return this.toYaml() || "";
    }

    rgba(): string {
        if (this.kind !== "color" || !this.color) {
            return "";
        }
        var rgb = this.color.replace(/^#/, "");
        if (rgb.length !== 6) {
            return "";
        }
        var r = parseInt(rgb.slice(0, 2), 16);
        var g = parseInt(rgb.slice(2, 4), 16);
        var b = parseInt(rgb.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${this.alpha / 255})`;
    }

    hexInput(): string {
        return (this.color || "").replace(/^#/, "").toUpperCase();
    }

    isEmpty(): boolean {
        if (this.kind === "ref") return !this.ref;
        if (this.kind === "image") return !this.image;
        return !this.color;
    }

    clone(): ColorValue {
        var c = new ColorValue(this.kind);
        c.color = this.color;
        c.alpha = this.alpha;
        c.ref = this.ref;
        c.image = this.image;
        return c;
    }
}
