<script lang="ts" context="module">
    import { marked, type Tokens } from "marked";

    const escapeHtml = (value: string) =>
        value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    marked.use({
        renderer: {
            heading({ tokens, depth }: Tokens.Heading) {
                const text = this.parser.parseInline(tokens);
                return `<h${depth} class="h${depth}">${text}</h${depth}>\n`;
            },
            codespan({ text }: Tokens.Codespan) {
                return `<code class="code">${text}</code>`;
            },
            code({ text, lang }: Tokens.Code) {
                const title = lang ? ` title="${escapeHtml(lang)}"` : "";
                return `<pre${title} class="variant-soft pre rounded-md p-2 text-sm">${escapeHtml(text)}</pre>\n`;
            },
            em({ tokens }: Tokens.Em) {
                return `<em class="italic">${this.parser.parseInline(tokens)}</em>`;
            },
            strong({ tokens }: Tokens.Strong) {
                return `<strong class="font-bold">${this.parser.parseInline(tokens)}</strong>`;
            },
            list({ ordered, start, items }: Tokens.List) {
                const body = items.map((item) => this.listitem(item)).join("");
                if (ordered) {
                    const startAttr = start !== 1 ? ` start="${start}"` : "";
                    return `<ol class="ml-4"${startAttr}>${body}</ol>\n`;
                }
                return `<ul class="ml-4 list-disc">${body}</ul>\n`;
            },
        },
    });
</script>

<script lang="ts">
    export var source: string;

    $: html = marked.parse(source, { async: false }) as string;
</script>

{@html html}
