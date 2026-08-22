<script lang="ts">
    import { getToastStore } from "@skeletonlabs/skeleton";
    import type { Theme } from "trime-web-core";
    import { toastError } from "$lib/utils/error";
    import { syncPersistHideStore } from "./utils/recovery";
    import { bumpPreview } from "./utils/revision";
    import { isEditablePasteTarget, pasteThemeFromClipboard, commitMergedTheme } from "./utils/themePaste";

    /** Current editor theme; updated in place via bind:theme from the page. */
    export var theme: Theme;

    const toastStore = getToastStore();
    var busy = false;

    const applyPasteResult = async (fromButton: boolean) => {
        if (busy) return;
        busy = true;
        try {
            var result = await pasteThemeFromClipboard(theme, { confirm: true });
            if (!result.ok) {
                if (result.reason === "cancel") return;
                // Ctrl+V with unrelated clipboard: stay quiet.
                if (!fromButton && result.reason === "not-theme") return;
                if (result.message) toastError(toastStore, result.message);
                return;
            }
            commitMergedTheme(theme, result.theme);
            theme = theme;
            syncPersistHideStore(theme);
            bumpPreview();
            if (result.warnings.length) {
                toastError(toastStore, result.warnings.join("\n"));
            }
            toastStore.trigger({
                message: `已粘貼並合併：${result.label}`,
                timeout: 2500,
                hoverable: true,
                background: "variant-filled-success",
            });
        } finally {
            busy = false;
        }
    };

    /** Used by ExportBar「粘貼」button. */
    export async function pasteWithConfirm(): Promise<void> {
        await applyPasteResult(true);
    }

    const onWindowKeydown = (e: KeyboardEvent) => {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
        if (e.key !== "v" && e.key !== "V") return;
        if (isEditablePasteTarget(e.target)) return;
        e.preventDefault();
        void applyPasteResult(false);
    };
</script>

<svelte:window on:keydown={onWindowKeydown} />
