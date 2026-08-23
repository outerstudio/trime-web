/** Themes per gallery list page. */
export const GALLERY_PAGE_SIZE = 42;

export function parseGalleryPage(raw: string | null, totalPages: number): number {
    const n = Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, Math.max(1, totalPages));
}

export function galleryPageCount(total: number, pageSize = GALLERY_PAGE_SIZE): number {
    return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}
