import catalogJson from "$lib/generated/catalog.json";
import type { GalleryCatalog, GalleryThemeMeta } from "$lib/catalog";
import { parseThemeYaml, themeFromObject, type Theme } from "trime-web-core";

const catalog = catalogJson as GalleryCatalog;

export function listCatalogThemes(): GalleryThemeMeta[] {
    return catalog.themes ?? [];
}

export function getCatalogTheme(id: string): GalleryThemeMeta | undefined {
    return listCatalogThemes().find((t) => t.id === id);
}

export function themeFromYaml(yaml: string): Theme {
    const { obj } = parseThemeYaml(yaml);
    return themeFromObject(obj);
}

export function loadCatalogTheme(id: string): { meta: GalleryThemeMeta; theme: Theme; yaml: string } {
    const meta = getCatalogTheme(id);
    if (!meta?.yaml) throw new Error(`unknown theme: ${id}`);
    return { meta, theme: themeFromYaml(meta.yaml), yaml: meta.yaml };
}
