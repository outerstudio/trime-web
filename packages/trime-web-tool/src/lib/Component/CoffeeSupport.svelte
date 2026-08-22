<script lang="ts">
    import Icon from "@iconify/svelte";
    import { base } from "$app/paths";

    export let open: boolean = false;

    const coffeeUrl = "https://buymeacoffee.com/garyyeap";

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
            class="relative w-full max-w-sm rounded-2xl bg-surface-800 p-6 pt-10 text-surface-50 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coffee-support-title"
            on:click|stopPropagation
        >
            <button
                type="button"
                class="variant-ghost btn-icon btn-icon-sm absolute right-2 top-2 z-10"
                title="關閉"
                aria-label="關閉"
                on:click={close}
            >
                <Icon icon="mdi:close" />
            </button>

            <div class="flex w-full flex-col items-center text-center">
            <h3 id="coffee-support-title" class="h3 w-full text-center text-surface-50">
                Made with love
            </h3>
                <p class="mt-2 w-full text-center text-sm leading-relaxed text-surface-300">
                愛意滿出來了，但咖啡枯竭了
            </p>

                <div class="mt-5 flex w-full justify-center">
                    <div class="grid size-[240px] shrink-0 place-items-center rounded-xl bg-white p-3">
                        <img
                            src="{base}/bmc-qr.png"
                            alt="Buy Me a Coffee QR code"
                            width="216"
                            height="216"
                            class="size-[216px] max-w-none object-contain"
                        />
                    </div>
                </div>

            <a
                href={coffeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="variant-filled-success btn mt-6 inline-flex items-center justify-center gap-1.5 rounded-full !leading-none !text-surface-900"
            >
                <span class="leading-none">讓咖啡填滿愛</span>
                <Icon icon="mdi:coffee" class="block h-4 w-4 shrink-0" />
            </a>
            </div>
        </div>
    </div>
{/if}
