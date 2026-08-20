import type { Key } from "$lib/Trime/model/key";

function isSpacer(key: Key): boolean {
    return !key.click && !key.clickEmpty && !key.label && !key.long_click;
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
