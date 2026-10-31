# trime-web-core

Reusable Trime **theme core** for the web: models, YAML import/export, and optional Svelte keyboard preview.

Lives in the [`trime-web`](https://github.com/outerstudio/trime-web) monorepo at `packages/trime-web-core`.

The default entry is headless IO. Preview lives on `trime-web-core/preview` so the package is not a renderer-only library.

Compatible with Trime **v3.3.11** theme YAML (map-key IDs, scalar triggers, `ascii_mode` defaults). This package approximates on-device layout and labels for editors and docs — it is not the Android runtime.

## Install

From npm (when published):

```bash
npm install trime-web-core
```

In this monorepo, `trime-web-tool` depends on `"trime-web-core": "*"` via npm workspaces. From the repo root:

```bash
npm install
npm run package -w trime-web-core   # builds dist/
```

Peer dependencies for preview:

```bash
npm install svelte @iconify/svelte
```

## Headless: import / export

```ts
import {
  parseThemeYaml,
  themeFromObject,
  themeToYaml,
  themeToExportYaml,
  themeToObject,
} from "trime-web-core";

const { obj, warnings } = parseThemeYaml(yamlText);
const theme = themeFromObject(obj);

// Editor / recovery: do not inject builtin preset_keys
const yaml = themeToYaml(theme, { persistHideKeySymbols: false });

// Phone download: embed referenced builtins
// Import reads supported_trime_version, defaulting to 3.3.11 when absent.
theme.targetTrimeVersion = "3.3.12";
const exportYaml = themeToExportYaml(theme);

// Inspect serializer output without stringifying
const plain = themeToObject(theme, { includeBuiltinPresets: true });
```

`targetTrimeVersion` is serialized as the top-level `supported_trime_version` metadata field (3.3.11 or 3.3.12). Missing metadata defaults to 3.3.11; send values do not override it. Phone and section exports convert known toggle sends to `Mode_switch` (3.3.11) or `SWITCH_CHARSET` (3.3.12), including referenced builtins. Raw `themeToObject` / `themeToYaml` preserve editable data unless passed an explicit `targetTrimeVersion` option. This covers toggle sends and icon sizing, not all 3.3.12 runtime behavior. The version field roundtrips through YAML and Gallery.

## Preview (Svelte)

```svelte
<script>
  import { PreviewStage } from "trime-web-core/preview";
  // theme.keyboard / scheme / style / presetKeys from the headless API
</script>

<PreviewStage
  trimeVersion={theme.targetTrimeVersion}
  {scheme}
  {keyboard}
  style={theme.style}
  fallbackColors={theme.fallbackColors}
  presetKeys={theme.presetKeys}
  selected={{ row: 0, col: 0 }}
  revision={1}
  hideSymbols={false}
  on:clicked={(e) => console.log(e.detail)}
/>
```

Host controls:

- `revision` — bump to force label/color recompute
- `hideSymbols` — hide long-click corner marks in the preview only
- `selected` — which key is highlighted

`PreviewStage` / `KeyPreview` ship scoped CSS (no Tailwind required).

## Package entry points

| Import | Contents |
|--------|----------|
| `trime-web-core` | Models, YAML IO, layout/label/color helpers, builtin preset table |
| `trime-web-core/preview` | `PreviewStage`, `KeyPreview` |

## Develop

From the monorepo root:

```bash
npm install
npm run package -w trime-web-core
npm run check -w trime-web-core
```

Publish when ready:

```bash
npm publish -w trime-web-core
```

(`prepublishOnly` runs `npm run package`.)
