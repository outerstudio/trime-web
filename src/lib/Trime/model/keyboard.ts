import { newId } from "$lib/Trime/model/id";
import { Key } from "$lib/Trime/model/key";
import { ColorValue } from "$lib/Trime/model/color";

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

function asBool(obj: any, fallback: boolean = false): boolean {
    return typeof obj === "boolean" ? obj : fallback;
}

/** 鍵盤 preset_keyboards 條目 */
export class Keyboard {
    id: number = newId();
    schemaId: string = "default";
    name: string = "鍵盤";
    author: string = "";
    ascii_mode: number = 0;
    ascii_keyboard: string = "";
    reset_ascii_mode: boolean = false;
    label_transform: string = "";
    lock: boolean = false;
    columns: number = 0;
    width: number = 10;
    height: number = 44;
    keyboard_height: number = 250;
    keyboard_height_land: number = 200;
    auto_height_index: number = -1;
    horizontal_gap: number = 1;
    vertical_gap: number = 1;
    round_corner: number = 8;
    key_text_offset_x: number = 0;
    key_text_offset_y: number = 0;
    key_symbol_offset_x: number = 0;
    key_symbol_offset_y: number = 0;
    key_hint_offset_x: number = 0;
    key_hint_offset_y: number = 0;
    key_press_offset_x: number = 0;
    key_press_offset_y: number = 0;
    key_text_size: number = 0;
    key_long_text_size: number = 0;
    symbol_text_size: number = 0;
    keyboard_back_color: ColorValue = new ColorValue();
    keys: Key[] = [];

    fromObject(obj: any, schemaId?: string): void {
        if (!obj || typeof obj !== "object") return;
        if (schemaId) this.schemaId = schemaId;
        this.name = asString(obj.name, this.name);
        this.author = asString(obj.author);
        // Match Trime 3.3.11's decoder: a missing field means ASCII (1).
        // New editor-created keyboards still start at 0 via the class default.
        this.ascii_mode = obj.ascii_mode === undefined ? 1 : asNumber(obj.ascii_mode);
        this.ascii_keyboard = asString(obj.ascii_keyboard);
        this.reset_ascii_mode = asBool(obj.reset_ascii_mode);
        this.label_transform = asString(obj.label_transform);
        this.lock = asBool(obj.lock);
        this.columns = asNumber(obj.columns);
        this.width = asNumber(obj.width, 10);
        this.height = asNumber(obj.height, 44);
        this.keyboard_height = asNumber(obj.keyboard_height);
        this.keyboard_height_land = asNumber(obj.keyboard_height_land);
        this.auto_height_index = obj.auto_height_index !== undefined ? asNumber(obj.auto_height_index) : -1;
        this.horizontal_gap = asNumber(obj.horizontal_gap);
        this.vertical_gap = asNumber(obj.vertical_gap);
        this.round_corner = obj.round_corner !== undefined ? asNumber(obj.round_corner) : -1;
        this.key_text_offset_x = asNumber(obj.key_text_offset_x);
        this.key_text_offset_y = asNumber(obj.key_text_offset_y);
        this.key_symbol_offset_x = asNumber(obj.key_symbol_offset_x);
        this.key_symbol_offset_y = asNumber(obj.key_symbol_offset_y);
        this.key_hint_offset_x = asNumber(obj.key_hint_offset_x);
        this.key_hint_offset_y = asNumber(obj.key_hint_offset_y);
        this.key_press_offset_x = asNumber(obj.key_press_offset_x);
        this.key_press_offset_y = asNumber(obj.key_press_offset_y);
        this.key_text_size = asNumber(obj.key_text_size);
        this.key_long_text_size = asNumber(obj.key_long_text_size);
        this.symbol_text_size = asNumber(obj.symbol_text_size);
        if (obj.keyboard_back_color !== undefined) {
            this.keyboard_back_color = ColorValue.fromAny(obj.keyboard_back_color);
        }
        this.keys = [];
        if (Array.isArray(obj.keys)) {
            this.keys = obj.keys.map((item: any) => {
                var key = new Key();
                key.fromObject(item);
                return key;
            });
        }
    }

    toObject(): object {
        var obj: any = {
            name: this.name,
            author: this.author || undefined,
            // Trime 3.3.x defaults a missing ascii_mode to 1. Keep 0 explicit,
            // otherwise a Chinese keyboard is silently loaded as ASCII.
            ascii_mode: this.ascii_mode,
            ascii_keyboard: this.ascii_keyboard || undefined,
            reset_ascii_mode: this.reset_ascii_mode || undefined,
            label_transform: this.label_transform || undefined,
            lock: this.lock || undefined,
            columns: this.columns !== 0 ? this.columns : undefined,
            width: this.width || undefined,
            height: this.height || undefined,
            keyboard_height: this.keyboard_height || undefined,
            keyboard_height_land: this.keyboard_height_land || undefined,
            horizontal_gap: this.horizontal_gap,
            vertical_gap: this.vertical_gap,
            round_corner: this.round_corner >= 0 ? this.round_corner : undefined,
            auto_height_index: this.auto_height_index >= 0 ? this.auto_height_index : undefined,
            key_text_offset_x: this.key_text_offset_x || undefined,
            key_text_offset_y: this.key_text_offset_y || undefined,
            key_symbol_offset_x: this.key_symbol_offset_x || undefined,
            key_symbol_offset_y: this.key_symbol_offset_y || undefined,
            key_hint_offset_x: this.key_hint_offset_x || undefined,
            key_hint_offset_y: this.key_hint_offset_y || undefined,
            key_press_offset_x: this.key_press_offset_x || undefined,
            key_press_offset_y: this.key_press_offset_y || undefined,
            keys: this.keys.map((k) => k.toObject()),
        };
        return obj;
    }

    clone(): Keyboard {
        var k = new Keyboard();
        k.schemaId = this.schemaId;
        k.fromObject(this.toObject(), this.schemaId);
        k.keys = this.keys.map((key) => key.clone());
        return k;
    }
}
