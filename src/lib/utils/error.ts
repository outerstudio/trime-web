import type { ToastStore } from "@skeletonlabs/skeleton";

export function toastError(toastStore: ToastStore, message: string) {
    toastStore.trigger({
        message,
        timeout: 3000,
        hoverable: true,
        background: "variant-filled-error",
    });
}

export function toastWarn(toastStore: ToastStore, message: string) {
    toastStore.trigger({
        message,
        timeout: 4000,
        hoverable: true,
        background: "variant-filled-warning",
    });
}
