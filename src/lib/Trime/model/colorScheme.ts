import { ColorValue } from "$lib/Trime/model/color";
import { KNOWN_COLOR_IDS } from "$lib/Trime/model/colorKeys";
import { newId } from "$lib/Trime/model/id";

const META_KEYS = new Set(["name", "author", "sound", "dark_scheme", "light_scheme", "schemaId"]);

/** 配色方案 */
export class ColorScheme {
    id: number = newId();
    /** 方案 id, 即 YAML 鍵名 */
    schemaId: string = "default";
    name: string = "預設";
    author: string = "";
    sound: string = "";
    dark_scheme: string = "";
    light_scheme: string = "";
    colors: { [key: string]: ColorValue } = {};

    getColor(key: string): ColorValue {
        return this.colors[key] || new ColorValue();
    }

    setColor(key: string, value: ColorValue): void {
        if (value && !value.isEmpty()) {
            this.colors[key] = value;
        } else {
            delete this.colors[key];
        }
    }

    customLabels(): string[] {
        return Object.keys(this.colors).filter((k) => !KNOWN_COLOR_IDS.has(k));
    }

    toObject(): object {
        var obj: any = {
            name: this.name,
            author: this.author || undefined,
            sound: this.sound || undefined,
            dark_scheme: this.dark_scheme || undefined,
            light_scheme: this.light_scheme || undefined,
        };
        for (let [k, v] of Object.entries(this.colors)) {
            var yaml = v.toYaml();
            if (yaml) obj[k] = yaml;
        }
        return obj;
    }

    fromObject(obj: any, schemaId?: string): void {
        if (!obj || typeof obj !== "object") return;
        if (schemaId) this.schemaId = schemaId;
        this.name = typeof obj.name === "string" ? obj.name : this.schemaId;
        this.author = typeof obj.author === "string" ? obj.author : "";
        this.sound = typeof obj.sound === "string" ? obj.sound : "";
        this.dark_scheme = typeof obj.dark_scheme === "string" ? obj.dark_scheme : "";
        this.light_scheme = typeof obj.light_scheme === "string" ? obj.light_scheme : "";
        this.colors = {};
        for (let [k, v] of Object.entries(obj)) {
            if (META_KEYS.has(k)) continue;
            var cv = ColorValue.fromAny(v);
            if (!cv.isEmpty()) this.colors[k] = cv;
        }
    }

    clone(): ColorScheme {
        var s = new ColorScheme();
        s.schemaId = this.schemaId;
        s.name = this.name;
        s.author = this.author;
        s.sound = this.sound;
        s.dark_scheme = this.dark_scheme;
        s.light_scheme = this.light_scheme;
        s.colors = {};
        for (let [k, v] of Object.entries(this.colors)) {
            s.colors[k] = v.clone();
        }
        return s;
    }
}
