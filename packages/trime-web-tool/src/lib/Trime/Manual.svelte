<script lang="ts">
    import Markdown from "$lib/Component/Markdown.svelte";
    import manual from "$lib/assets/trime-tools/manual.md?raw";
</script>

<div class="variant-soft rounded-md px-3 py-3">
    <Markdown source={manual} />
</div>
