import type { PageLoad } from "./$types";
import { listCatalogThemes } from "$lib/loadTheme";
import {
    GALLERY_PAGE_SIZE,
    galleryPageCount,
    parseGalleryPage,
} from "$lib/pagination";

export const load: PageLoad = ({ url }) => {
    const all = listCatalogThemes().map(({ id, title, author, description, yaml }) => ({
        id,
        title,
        author,
        description,
        yaml,
    }));
    const total = all.length;
    const totalPages = galleryPageCount(total);
    const page = parseGalleryPage(url.searchParams.get("page"), totalPages);
    const start = (page - 1) * GALLERY_PAGE_SIZE;

    return {
        title: page > 1 ? `Trime 主題列表 · 第 ${page} 頁` : "Trime 主題列表",
        themes: all.slice(start, start + GALLERY_PAGE_SIZE),
        page,
        totalPages,
        total,
        pageSize: GALLERY_PAGE_SIZE,
    };
};
