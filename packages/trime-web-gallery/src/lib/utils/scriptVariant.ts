import OpenCC from "opencc-js";
import { get } from "svelte/store";
import { browser } from "$app/environment";
import { persisted } from "./persisted";

/** Traditional (default UI) vs Simplified for chrome text. */
export type ScriptVariant = "hant" | "hans";

export const SCRIPT_STORAGE_KEY = "trimeScriptVariant";
export const scriptVariant = persisted<ScriptVariant>(SCRIPT_STORAGE_KEY, "hant");

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CODE", "PRE", "KBD"]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"];

const textOrig = new WeakMap<Text, string>();
const attrOrig = new WeakMap<Element, Record<string, string>>();

const toHans = OpenCC.Converter({ from: "tw", to: "cn" });

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function shouldSkipElement(el: Element): boolean {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.classList?.contains("ignore-opencc")) return true;
    return false;
}

function visit(node: Node, variant: ScriptVariant): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
        var el = node as Element;
        if (shouldSkipElement(el)) return;

        for (let attr of ATTRS) {
            if (!el.hasAttribute(attr)) continue;
            var bag = attrOrig.get(el);
            if (!bag) {
                bag = {};
                attrOrig.set(el, bag);
            }
            if (bag[attr] === undefined) bag[attr] = el.getAttribute(attr) || "";
            var orig = bag[attr];
            el.setAttribute(attr, variant === "hans" ? toHans(orig) : orig);
        }

        for (let child of Array.from(el.childNodes)) visit(child, variant);
        return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
        var text = node as Text;
        var value = text.nodeValue;
        if (!value || !value.trim()) return;
        if (!textOrig.has(text)) textOrig.set(text, value);
        var source = textOrig.get(text) || value;
        text.nodeValue = variant === "hans" ? toHans(source) : source;
    }
}

export function applyScriptVariant(variant: ScriptVariant = get(scriptVariant)): void {
    if (!browser || !document?.documentElement) return;
    document.documentElement.lang = variant === "hans" ? "zh-Hans" : "zh-Hant";
    var wasObserving = !!observer;
    observer?.disconnect();
    try {
        visit(document.body || document.documentElement, variant);
    } finally {
        if (wasObserving && observer) {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }
    }
}

export function toggleScriptVariant(): ScriptVariant {
    var next: ScriptVariant = get(scriptVariant) === "hans" ? "hant" : "hans";
    scriptVariant.set(next);
    applyScriptVariant(next);
    return next;
}

export function startScriptVariantWatch(): () => void {
    if (!browser) return () => {};
    applyScriptVariant(get(scriptVariant));

    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
        if (get(scriptVariant) !== "hans") return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => applyScriptVariant("hans"), 80);
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    return () => {
        observer?.disconnect();
        observer = null;
        if (debounceTimer) clearTimeout(debounceTimer);
    };
}
