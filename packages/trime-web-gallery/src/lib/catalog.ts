/** Catalog entry after prepare-gallery-catalog.mjs */
export type GalleryThemeMeta = {
    id: string;
    file: string;
    title: string;
    author: string;
    description: string;
    /** Source YAML embedded at prepare time */
    yaml: string;
};

export type GalleryCatalog = {
    themes: GalleryThemeMeta[];
};

/** sessionStorage key for handoff to /tool/?from=gallery */
export const GALLERY_OPEN_THEME_KEY = "trimeGalleryOpenTheme";
