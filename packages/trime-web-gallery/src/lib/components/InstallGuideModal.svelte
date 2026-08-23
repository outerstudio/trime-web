<script lang="ts">
    import Icon from "@iconify/svelte";

    export let open: boolean = false;

    const close = () => {
        open = false;
    };
</script>

{#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-[200] flex items-center justify-center bg-surface-900/70 p-4 backdrop-blur-sm"
        on:click={close}
    >
        <div
            class="relative flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-800 text-surface-50 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-guide-title"
            on:click|stopPropagation
        >
            <div class="flex shrink-0 items-start justify-between gap-3 border-b border-surface-500/30 px-5 py-4">
                <h3 id="install-guide-title" class="h3 text-surface-50">安裝教學</h3>
                <button
                    type="button"
                    class="variant-ghost btn-icon btn-icon-sm shrink-0"
                    title="關閉"
                    aria-label="關閉"
                    on:click={close}
                >
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-surface-200">
                <ol class="list-decimal space-y-3 pl-5">
                    <li>
                        在本頁點
                        <strong class="font-semibold text-surface-50">下載主題</strong>
                        ，得到
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">主題名.trime.yaml</code>
                        （檔名須以
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">trime.yaml</code>
                        結尾）。
                    </li>
                    <li>
                        把檔案放到 Android
                        <strong class="font-semibold text-surface-50">同文輸入法</strong>
                        的 Rime
                        <strong class="font-semibold text-surface-50">用戶資料目錄根目錄</strong>
                        （路徑以 App 設定為準，常見為
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">rime/</code>
                        ）。
                    </li>
                    <li>
                        若主題用了背景圖或自訂字型：圖檔依主題裡的背景目錄放置；字型檔放到用戶目錄的
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">fonts/</code>
                        。
                    </li>
                    <li>
                        在同文執行
                        <strong class="font-semibold text-surface-50">部署</strong>
                        （只複製檔案或只重啟鍵盤通常不夠）。
                    </li>
                    <li>
                        到主題／配色設定選取對應主題。選單裡的 ID 是
                        <strong class="font-semibold text-surface-50">去掉副檔名</strong>
                        後的名稱，例如
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">gary.trime.yaml</code>
                        →
                        <code class="rounded bg-surface-700 px-1 py-0.5 text-xs">gary.trime</code>
                        。
                    </li>
                </ol>

                <p class="rounded-lg bg-surface-700/60 px-3 py-2 text-xs text-surface-300">
                    提示：若選了主題卻看不到新樣貌，請確認是否有
                    <code class="rounded bg-surface-600 px-1 py-0.5">主題ID.custom.yaml</code>
                    的
                    <code class="rounded bg-surface-600 px-1 py-0.5">patch:</code>
                    覆蓋，以及同文實際指向的用戶目錄與已部署的
                    <code class="rounded bg-surface-600 px-1 py-0.5">build/</code>
                    版本。
                </p>
            </div>

            <div class="shrink-0 border-t border-surface-500/30 px-5 py-3">
                <button type="button" class="variant-filled-primary btn w-full" on:click={close}>
                    知道了
                </button>
            </div>
        </div>
    </div>
{/if}
