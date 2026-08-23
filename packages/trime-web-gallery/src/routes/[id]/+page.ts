import type { EntryGenerator, PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getCatalogTheme, listCatalogThemes, themeFromYaml } from "$lib/loadTheme";

export const entries: EntryGenerator = () => {
    return listCatalogThemes().map((t) => ({ id: t.id }));
};

export const load: PageLoad = ({ params }) => {
    const meta = getCatalogTheme(params.id);
    if (!meta?.yaml) {
        error(404, `Theme not found: ${params.id}`);
    }
    // Parse once for counts in data; page re-parses for interactive Theme instance.
    const theme = themeFromYaml(meta.yaml);
    return {
        title: `${meta.title} · Gallery`,
        meta: {
            id: meta.id,
            title: meta.title,
            author: meta.author,
            description: meta.description,
            file: meta.file,
        },
        yaml: meta.yaml,
        schemeCount: theme.colorSchemes.length,
        keyboardCount: theme.keyboards.length,
    };
};
