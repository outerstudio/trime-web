import type { PresetKey } from "../model/presetKey";

export type TrimeVersion = "3.3.11" | "3.3.12";

/** Verified against v3.3.11 e4e67cdb and v3.3.12 e09ac711. */
export function toggleSendForVersion(version: TrimeVersion): string {
    return version === "3.3.12" ? "SWITCH_CHARSET" : "Mode_switch";
}

/** Only migrate known toggle sends; never rewrite arbitrary macros or preset IDs. */
export function isVersionedToggle(preset: { send?: string; toggle?: string }): boolean {
    return !!preset.toggle && (preset.send === "Mode_switch" || preset.send === "SWITCH_CHARSET");
}

/** Mixed or unrecognizable input needs an explicit target choice. */
export function inferTrimeVersion(presets: Record<string, any> | undefined): TrimeVersion | undefined {
    const sends = new Set(
        Object.values(presets || {})
            .filter((p) => p && isVersionedToggle(p))
            .map((p) => p.send),
    );
    if (sends.size !== 1) return undefined;
    return sends.has("SWITCH_CHARSET") ? "3.3.12" : "3.3.11";
}

export function conflictingTogglePresets(presets: PresetKey[], version: TrimeVersion): PresetKey[] {
    return presets.filter((p) => isVersionedToggle(p) && p.send !== toggleSendForVersion(version));
}
