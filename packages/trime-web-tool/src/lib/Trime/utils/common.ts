export function exportFile(data: string, filename: string, mimetype: string = "application/yaml") {
    var anchor = document.createElement("a");
    var blob = new Blob([data], {
        type: `${mimetype}; charset=utf-8`,
    });
    var url = window.URL.createObjectURL(blob);
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
}

/** 在已用名稱上遞增後綴，例如 鍵盤 → 鍵盤2 */
export function nextIndexed(used: string[], source: string, fallback: string): string {
    var raw = (source || fallback).trim() || fallback;
    var m = raw.match(/^(.*?)(\d+)$/);
    var base = m ? m[1] : raw;
    var set = new Set(used);
    var i = m ? Number(m[2]) + 1 : 2;
    var candidate = `${base}${i}`;
    while (set.has(candidate)) {
        i += 1;
        candidate = `${base}${i}`;
    }
    return candidate;
}
