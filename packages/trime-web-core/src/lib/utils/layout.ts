import type { Key } from "../model/key";

function isSpacer(key: Key): boolean {
    return !key.click && !key.clickEmpty && !key.label && !key.long_click;
}

/**
 * Per-row raw heights (v3.3.11 Keyboard): first key of each row; height>0 else defaultKeyHeight.
 * When keyboardHeight>0, scale like Trime (last row absorbs remainder). Else return raw (preview
 * must not collapse to 0 when keyboard_height is missing).
 * Returns CSS px when multiplied by design `scale` via the last step.
 */
export function scaledRowHeights(
    rows: Key[][],
    defaultKeyHeight: number,
    keyboardHeight: number,
    scale: number,
): number[] {
    var n = rows.length;
    if (!n) return [];
    var keyH = defaultKeyHeight > 0 ? defaultKeyHeight : 44;
    var raw = rows.map((row) => {
        var first = row[0];
        return first && first.height > 0 ? first.height : keyH;
    });
    var sum = raw.reduce((a, b) => a + b, 0);
    if (sum <= 0) sum = 1;

    var logical: number[];
    if (keyboardHeight > 0) {
        logical = [];
        var remain = keyboardHeight;
        var factor = keyboardHeight / sum;
        for (let i = 0; i < n - 1; i++) {
            var h = Math.trunc(raw[i] * factor);
            logical.push(h);
            remain -= h;
        }
        logical.push(remain);
    } else {
        logical = raw.slice();
    }

    return logical.map((h) => Math.max(1, Math.round(h * scale)));
}

/** 將扁平 keys 按 Trime 規則折成行 */
export function wrapKeys(keys: Key[], columns: number, defaultWidth: number): Key[][] {
    var rows: Key[][] = [];
    var current: Key[] = [];
    var acc = 0;
    var colCount = 0;
    var cols = 30;
    var dw = defaultWidth > 0 ? defaultWidth : 10;

    const flush = () => {
        if (current.length) {
            rows.push(current);
            current = [];
            acc = 0;
            colCount = 0;
        }
    };

    for (let key of keys) {
        if (key.clickEmpty) {
            flush();
            continue;
        }
        var w = key.width > 0 ? key.width : dw;
        var spacer = isSpacer(key);
        if (!spacer && colCount >= cols) {
            flush();
        }
        if (current.length > 0 && acc + w > 100 + 1e-6) {
            flush();
        }
        current.push(key);
        acc += w;
        if (!spacer) colCount++;
        if (acc >= 100 - 1e-6) {
            flush();
        }
    }
    flush();
    return rows;
}
