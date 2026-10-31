/**
 * Ingest gallery catalog YAML into static assets + generated manifest.
 *
 * Source (local fixtures, or external themes repo via GALLERY_CATALOG_ROOT):
 *   <catalogRoot>/
 *     themes/*.trime.yaml   required; id from filename (`foo.trime.yaml` → `foo`)
 *     catalog.json          optional overrides (title / author / description / id)
 *
 * Theme YAML may include gallery-only top-level `description:` (Trime ignores it).
 * `name` / `author` feed the list; catalog.json overrides win when present.
 *
 * Outputs:
 *   packages/trime-web-gallery/src/lib/generated/catalog.json
 *   packages/trime-web-gallery/static/themes/<id>.trime.yaml
 */
import {
    cpSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const galleryPkg = join(root, "packages", "trime-web-gallery");
/** Override with env GALLERY_CATALOG_ROOT when fetching an external themes repo. */
const catalogRoot = process.env.GALLERY_CATALOG_ROOT
    ? resolve(process.env.GALLERY_CATALOG_ROOT)
    : join(galleryPkg, "catalog");
const outStaticThemes = join(galleryPkg, "static", "themes");
const outGenerated = join(galleryPkg, "src", "lib", "generated");
const outCatalogJson = join(outGenerated, "catalog.json");

/**
 * @typedef {{ id: string, file: string, title?: string, author?: string, description?: string }} MetaEntry
 * @typedef {{ id: string, file: string, title: string, author: string, description: string, supportedTrimeVersion: string }} CatalogTheme
 */

function die(msg) {
    console.error(`prepare-gallery-catalog: ${msg}`);
    process.exit(1);
}

function slugFromFilename(name) {
    return name.replace(/\.trime\.yaml$/i, "").replace(/\.ya?ml$/i, "");
}

function isThemeYaml(name) {
    return name.toLowerCase().endsWith("trime.yaml");
}

function loadMetaMap() {
    /** @type {Map<string, MetaEntry>} */
    const map = new Map();
    const metaPath = join(catalogRoot, "catalog.json");
    if (!existsSync(metaPath)) return map;
    const raw = JSON.parse(readFileSync(metaPath, "utf8"));
    const list = Array.isArray(raw?.themes) ? raw.themes : [];
    for (const entry of list) {
        if (!entry || typeof entry !== "object") continue;
        const id = typeof entry.id === "string" ? entry.id.trim() : "";
        const file = typeof entry.file === "string" ? entry.file.trim() : "";
        if (!id || !file) continue;
        map.set(id, entry);
    }
    return map;
}

function listThemeFiles() {
    const themesDir = join(catalogRoot, "themes");
    if (!existsSync(themesDir)) return [];
    return readdirSync(themesDir)
        .filter(isThemeYaml)
        .map((name) => ({ name, abs: join(themesDir, name) }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

function validateYaml(text, label) {
    let doc;
    try {
        doc = parseYaml(text);
    } catch (err) {
        die(`invalid YAML (${label}): ${(err && err.message) || err}`);
    }
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
        die(`expected mapping root (${label})`);
    }
    if (!doc.preset_keyboards || typeof doc.preset_keyboards !== "object") {
        die(`missing preset_keyboards (${label})`);
    }
    if (!doc.preset_color_schemes || typeof doc.preset_color_schemes !== "object") {
        die(`missing preset_color_schemes (${label})`);
    }
    return doc;
}

if (!existsSync(catalogRoot)) {
    die(`catalog root not found: ${catalogRoot}`);
}

const metaById = loadMetaMap();
const files = listThemeFiles();
if (!files.length) {
    die(`no *.trime.yaml under ${join(catalogRoot, "themes")}`);
}

/** @type {Map<string, { abs: string, meta: MetaEntry | null }>} */
const byId = new Map();

for (const { name, abs } of files) {
    const derivedId = slugFromFilename(name);
    let meta = null;
    for (const entry of metaById.values()) {
        if (entry.file === `themes/${name}` || basename(entry.file) === name) {
            meta = entry;
            break;
        }
    }
    const id = meta?.id || derivedId;
    if (byId.has(id)) die(`duplicate theme id: ${id}`);
    byId.set(id, { abs, meta });
}

// Include catalog.json-only entries that point at existing files
for (const entry of metaById.values()) {
    if (byId.has(entry.id)) continue;
    const abs = join(catalogRoot, entry.file);
    if (!existsSync(abs)) die(`catalog.json file missing for ${entry.id}: ${entry.file}`);
    byId.set(entry.id, { abs, meta: entry });
}

rmSync(outStaticThemes, { recursive: true, force: true });
mkdirSync(outStaticThemes, { recursive: true });
mkdirSync(outGenerated, { recursive: true });

/**
 * @typedef {CatalogTheme & { yaml: string }} CatalogThemeWithYaml
 * @type {CatalogThemeWithYaml[]}
 */
const themes = [];

for (const [id, { abs, meta }] of [...byId.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const text = readFileSync(abs, "utf8");
    const doc = validateYaml(text, id);
    const title =
        (meta && typeof meta.title === "string" && meta.title.trim()) ||
        (typeof doc.name === "string" && doc.name.trim()) ||
        id;
    const author =
        (meta && typeof meta.author === "string" && meta.author.trim()) ||
        (typeof doc.author === "string" && doc.author.trim()) ||
        "";
    const description =
        (meta && typeof meta.description === "string" && meta.description.trim()) ||
        (typeof doc.description === "string" && doc.description.trim()) ||
        "";

    const destName = `${id}.trime.yaml`;
    cpSync(abs, join(outStaticThemes, destName));
    themes.push({
        id,
        file: `themes/${destName}`,
        title,
        author,
        description,
        supportedTrimeVersion: doc.supported_trime_version === "3.3.12" ? "3.3.12" : "3.3.11",
        // Embedded for prerender / SPA loads without depending on BASE_PATH fetch.
        yaml: text,
    });
    console.log(`→ gallery theme ${id} (${title})`);
}

writeFileSync(outCatalogJson, `${JSON.stringify({ themes }, null, 4)}\n`);
console.log(`→ wrote ${outCatalogJson} (${themes.length} themes)`);
