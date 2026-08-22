# trime-web-core

Reusable Trime **theme core** for the web: models, YAML import/export, and optional Svelte keyboard preview.

Source: https://github.com/garyyeap/trime-web-core.git

The default entry is headless IO. Preview lives on `trime-web-core/preview` so the package is not a renderer-only library.

Compatible with Trime **v3.3.11** theme YAML (map-key IDs, scalar triggers, `ascii_mode` defaults). This package approximates on-device layout and labels for editors and docs — it is not the Android runtime.

## Install

```bash
npm install trime-web-core
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
const exportYaml = themeToExportYaml(theme);

// Inspect serializer output without stringifying
const plain = themeToObject(theme, { includeBuiltinPresets: true });
```

## Preview (Svelte)

```svelte
<script>
  import { PreviewStage } from "trime-web-core/preview";
  // theme.keyboard / scheme / style / presetKeys from the headless API
</script>

<PreviewStage
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

```bash
npm install
npm run package   # builds dist/ via @sveltejs/package
npm run check
```

Publish when ready:

```bash
npm publish
```

(`prepublishOnly` runs `npm run package`.)
