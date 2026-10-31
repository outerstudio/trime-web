import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ configFile: false, server: { middlewareMode: true } });
try {
    const api = await server.ssrLoadModule(new URL("../src/lib/index.ts", import.meta.url).pathname);
    const raw = {
        name: "Version compatibility",
        style: { keyboard_height: 250, key_text_size: 19, key_long_text_size: 12 },
        preset_keys: {
            Custom_toggle: { send: "Mode_switch", toggle: "ascii_mode", states: ["ic@translate", "ic@translate"] },
            Literal_text: { commit: "Mode_switch SWITCH_CHARSET", label: "文字" },
            Custom_command: { send: "Return", toggle: "custom_option" },
        },
        preset_keyboards: {
            main: {
                ascii_mode: 0,
                keys: [
                    { click: "Custom_toggle", label_symbol: " " },
                    { click: "Henkan" }, // referenced builtin must be converted too
                    { click: { send: "Mode_switch", toggle: "ascii_punct", states: ["。，", "．，"] } },
                ],
            },
        },
    };
    for (const version of ["3.3.11", "3.3.12"]) {
        const theme = api.themeFromObject(raw);
        theme.targetTrimeVersion = version;
        assert.equal(theme.clone().targetTrimeVersion, version);
        const expectedSend = version === "3.3.12" ? "SWITCH_CHARSET" : "Mode_switch";
        const exported = api.parseThemeYaml(api.themeToExportYaml(theme)).obj;
        assert.equal(exported.preset_keys.Custom_toggle.send, expectedSend);
        assert.equal(exported.preset_keys.Henkan.send, expectedSend);
        const inlineId = exported.preset_keyboards.main.keys[2].click;
        assert.equal(exported.preset_keys[inlineId].send, expectedSend);
        assert.deepEqual(exported.preset_keys.Custom_toggle.states, raw.preset_keys.Custom_toggle.states);
        assert.equal(exported.preset_keys.Literal_text.commit, raw.preset_keys.Literal_text.commit);
        assert.equal(exported.preset_keys.Custom_command.send, "Return");
        assert.equal(exported.preset_keyboards.main.ascii_mode, 0);
        assert.equal(exported.preset_keyboards.main.keys[0].label_symbol, " ");
        assert.equal(exported.targetTrimeVersion, undefined);
        assert.equal(exported.supported_trime_version, version);
        // Export normalization must not mutate editable data or raw recovery.
        assert.equal(theme.presetKeys.find((p) => p.id === "Custom_toggle").send, "Mode_switch");
        assert.equal(api.parseThemeYaml(api.themeToYaml(theme)).obj.preset_keys.Custom_toggle.send, "Mode_switch");
        const restored = api.themeFromObject(exported);
        assert.equal(restored.targetTrimeVersion, version);
        assert.deepEqual(api.parseThemeYaml(api.themeToExportYaml(restored)).obj, exported);
        const section = api.parseThemeYaml(api.sectionToYaml(theme, "preset_keys")).obj;
        assert.equal(section.preset_keys.Custom_toggle.send, expectedSend);
        const icon = api.keyFaceSize("ic@translate", 0, 19, 12, version);
        assert.equal(icon, version === "3.3.12" ? 19 : 12);
        assert.equal(api.keyFaceSize("ic@translate", 18, 19, 12, version), 18);
        assert.equal(api.keyFaceSize("朙月拼音", 0, 19, 12, version), 12);
    }
    assert.equal(api.themeFromObject({ preset_keys: { a: { send: "SWITCH_CHARSET", toggle: "ascii_mode" } } }).targetTrimeVersion, "3.3.11");
    assert.equal(api.themeFromObject({ supported_trime_version: "3.3.12" }).targetTrimeVersion, "3.3.12");
    assert.equal(api.inferTrimeVersion({}), undefined);
    assert.equal(api.inferTrimeVersion({ a: { send: "SWITCH_CHARSET", toggle: "ascii_mode" } }), "3.3.12");
    const mixed = {
        ...raw,
        preset_keys: { ...raw.preset_keys, newer: { send: "SWITCH_CHARSET", toggle: "ascii_mode" } },
    };
    assert.equal(api.inferTrimeVersion(mixed.preset_keys), undefined);
    const mixedResult = api.parseThemeYaml(JSON.stringify(mixed));
    assert.ok(mixedResult.warnings.some((w) => w.includes("混用")));
    const newer = api.themeFromObject(raw);
    newer.targetTrimeVersion = "3.3.12";
    assert.equal(api.mergeTheme(newer, { style: { key_text_size: 20 } }).targetTrimeVersion, "3.3.12");
    // Per-key restore metadata must never opt the entire theme into bulk hide.
    const symbols = api.themeFromObject({
        style: { keyboard_height: 100 },
        preset_keyboards: { main: { ascii_mode: 0, keys: [
            { click: "a", long_click: "@", label_symbol: "custom" },
            { click: "b", long_click: "#" },
        ] } },
    });
    api.hideKeySymbol(symbols.keyboards[0].keys[0]);
    for (const exportYaml of [api.themeToYaml, api.themeToExportYaml, (t) => api.sectionToYaml(t, "preset_keyboards")]) {
        const serialized = exportYaml(symbols);
        const restored = api.themeFromObject(api.parseThemeYaml(serialized).obj);
        const [a, b] = restored.keyboards[0].keys;
        assert.equal(a.label_symbol, " ");
        assert.equal(a.labelSymbolSaved, "custom");
        assert.equal(b.label_symbol, "");
        assert.equal(b.labelSymbolSaved, undefined);
        assert.equal(symbols.keyboards[0].keys[1].label_symbol, "");
        api.restoreAllKeySymbols(restored);
        assert.equal(restored.keyboards[0].keys[0].label_symbol, "custom");
        assert.equal(api.parseThemeYaml(api.themeToYaml(restored)).obj.preset_keyboards.main.keys[0].label_symbol, "custom");
    }
    const bulk = api.themeFromObject(api.parseThemeYaml(api.themeToYaml(symbols, { persistHideKeySymbols: true })).obj);
    assert.ok(bulk.keyboards[0].keys.every((k) => k.label_symbol === " " && k.labelSymbolSaved !== undefined));
    const except = bulk.keyboards[0].keys[1];
    except.label_symbol = except.labelSymbolSaved;
    except.labelSymbolSaved = undefined;
    const mixedVisibility = api.parseThemeYaml(api.themeToExportYaml(bulk)).obj.preset_keyboards.main.keys;
    assert.equal(mixedVisibility[0].label_symbol, " ");
    assert.equal(mixedVisibility[1].label_symbol, undefined);
    console.log("Trime version compatibility and per-key/bulk symbol roundtrip passed.");
} finally {
    await server.close();
}
