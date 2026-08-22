<script lang="ts" context="module">
    import { marked, type Tokens } from "marked";

    const escapeHtml = (value: string) =>
        value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    marked.use({
        renderer: {
            heading({ tokens, depth }: Tokens.Heading) {
                const text = this.parser.parseInline(tokens);
                return `<h${depth} class="h${depth} mb-2 mt-5 first:mt-0">${text}</h${depth}>\n`;
            },
            paragraph({ tokens }: Tokens.Paragraph) {
                return `<p class="my-2 leading-relaxed">${this.parser.parseInline(tokens)}</p>\n`;
            },
            blockquote({ tokens }: Tokens.Blockquote) {
                const body = this.parser.parse(tokens);
                return `<blockquote class="variant-soft my-2 rounded-md border-l-4 border-primary-500/60 px-3 py-2 text-sm leading-relaxed [&>p]:my-1.5">${body}</blockquote>\n`;
            },
            codespan({ text }: Tokens.Codespan) {
                return `<code class="code">${text}</code>`;
            },
            link({ href, title, tokens }: Tokens.Link) {
                const text = this.parser.parseInline(tokens);
                const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
                const url = escapeHtml(href || "");
                return `<a href="${url}"${titleAttr} target="_blank" rel="noopener noreferrer" class="anchor font-medium text-primary-500 underline decoration-primary-500/50 underline-offset-2 hover:decoration-primary-500">${text}</a>`;
            },
            code({ text, lang }: Tokens.Code) {
                const title = lang ? ` title="${escapeHtml(lang)}"` : "";
                return `<pre${title} class="variant-soft pre my-3 rounded-md p-2 text-sm leading-relaxed">${escapeHtml(text)}</pre>\n`;
            },
            em({ tokens }: Tokens.Em) {
                return `<em class="italic">${this.parser.parseInline(tokens)}</em>`;
            },
            strong({ tokens }: Tokens.Strong) {
                return `<strong class="font-bold">${this.parser.parseInline(tokens)}</strong>`;
            },
            list({ ordered, start, items }: Tokens.List) {
                const body = items.map((item) => this.listitem(item)).join("");
                const nested = "[&_ul]:my-1.5 [&_ul]:space-y-1 [&_ol]:my-1.5";
                if (ordered) {
                    const startAttr = start !== 1 ? ` start="${start}"` : "";
                    return `<ol class="my-3 ml-4 list-decimal space-y-2 ${nested}"${startAttr}>${body}</ol>\n`;
                }
                return `<ul class="my-3 ml-4 list-disc space-y-2 ${nested}">${body}</ul>\n`;
            },
            listitem({ tokens }: Tokens.ListItem) {
                return `<li class="leading-relaxed [&>p]:my-1.5">${this.parser.parse(tokens)}</li>\n`;
            },
        },
    });
</script>

<script lang="ts">
    export var source: string;

    $: html = marked.parse(source, { async: false }) as string;
</script>

<div class="text-sm leading-relaxed">
    {@html html}
</div>
