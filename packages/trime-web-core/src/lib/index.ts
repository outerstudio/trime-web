// Models
export { Theme, defaultColorScheme, defaultKeyboard, builtinDefaultKeyboard, builtinDefaultColorScheme, builtinKeyboards } from "./model/theme";
export { Keyboard } from "./model/keyboard";
export { Key, TRIGGER_SLOTS, TRIGGER_LABELS, SECONDARY_TRIGGER_SLOTS, KEY_COLOR_FIELDS, type TriggerSlot } from "./model/key";
export { PresetKey, type TriggerValue, isInlinePreset, parseTrigger, triggerToYaml, triggerDisplay } from "./model/presetKey";
export { Style, EnterLabels } from "./model/style";
export { ColorScheme } from "./model/colorScheme";
export { ColorValue, type ColorKind, CSS_COLOR_NAMES } from "./model/color";
export {
    COLOR_GROUPS,
    colorKeys,
    KNOWN_COLOR_IDS,
    DEFAULT_FALLBACK_COLORS,
    colorKeyById,
    type ColorGroup,
    type ColorKeyMeta,
} from "./model/colorKeys";
export { Preedit } from "./model/preedit";
export { CandidateWindow } from "./model/window";
export {
    ToolBar,
    ToolBarButton,
    ToolBarButtonBackground,
    ToolBarButtonForeground,
    iconifyFromTrimeStyle,
} from "./model/toolBar";
export { newId } from "./model/id";

// Import / export
export {
    type ImportWarning,
    type ThemeSerializeOptions,
    themeToObject,
    themeToYaml,
    themeToExportYaml,
    sectionToYaml,
    parseThemeYaml,
    themeFromObject,
    mergeTheme,
    isUnmodifiedBuiltinPreset,
    stripUnmodifiedBuiltinPresets,
} from "./utils/theme";

// Helpers
export { wrapKeys } from "./utils/layout";
export { resolvedRgba, resolveColor, resolveKeyColorRgba, keyFaceColors } from "./utils/color";
export {
    type GetLabelContext,
    findPreset,
    prettyTrigger,
    clickLabel,
    trimeKeyLabel,
    isFunctionalClick,
    symbolLabel,
    keyFaceSize,
    applyLabelTransform,
    usesPerKeyLabel,
    perKeyLabelBlockReason,
    activeTrigger,
} from "./utils/labels";
export {
    BUILTIN_PRESET_KEYS,
    BUILTIN_PRESET_KEY_IDS,
    ANDROID_KEY_NAMES,
    allKeyNameSuggestions,
    builtinTitle,
    builtinsGrouped,
    builtinDefaultStates,
    builtinStateFieldHints,
    resolveDualStateBase,
    isDualStateEditable,
    makeDualStateVariantId,
    type BuiltinCategory,
} from "./utils/keydefs";
export {
    ORIG_LABEL_SYMBOL,
    hasSavedKeySymbols,
    hideKeySymbol,
    hideAllKeySymbols,
    restoreAllKeySymbols,
    hideKeysOnKeyboardIfPersisted,
    hideNewKeyIfPersisted,
    attachOrigLabelSymbols,
    stringifyYamlWithSymbolComments,
    commentsToOrigFields,
} from "./utils/labelSymbol";
export { snap } from "./utils/snap";
