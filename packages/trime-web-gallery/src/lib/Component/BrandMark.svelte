<script lang="ts">
    /** Compact Trime Web mark — adapts to light/dark via currentColor surfaces. */
    export var size: number = 32;
    export var title: string = "Trime Web";
</script>

<span
    class="inline-flex shrink-0 items-center justify-center rounded-[0.55rem] bg-surface-900 text-surface-50 shadow-sm ring-1 ring-surface-500/20 dark:bg-surface-50 dark:text-surface-900"
    style:width="{size}px"
    style:height="{size}px"
    aria-hidden="true"
    {title}
>
    <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" stroke="currentColor" stroke-width="1.6" />
        <path
            d="M7 9.2h10M7 12h4.2M13.2 12H17M9.5 14.8h5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
        />
        <circle cx="18.2" cy="14.8" r="1.15" fill="currentColor" class="text-success-500 dark:text-success-600" />
    </svg>
</span>
