import { languageStore } from "./store";
import { STRINGS, StringKey, PAGE_COPY } from "./strings";
import { TABLE_EXAMPLES, ExampleOverride } from "./examples";
import { REACHABLE_RUNES } from "../phonemes/maps.generated";

export { languageStore } from "./store";
export { TABLE_EXAMPLES } from "./examples";
export { runeDisplaySymbol, relabelRuneIPA } from "./runeDisplay";

/**
 * Whether the current language can actually produce this rune phoneme via the
 * translator. English produces the whole inventory; other languages only a
 * subset (the rest are greyed out in the reference tables).
 */
export function isRuneReachable(ipaSymbol: string): boolean {
    const lang = languageStore.get();
    if (lang === "en") return true;
    return REACHABLE_RUNES[lang]?.includes(ipaSymbol) ?? false;
}

/** Translate a UI string key for the current language, falling back to English. */
export function t(key: StringKey): string {
    const lang = languageStore.get();
    return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}

/**
 * Localize the static page copy: every element with a `data-i18n` attribute has
 * its innerHTML set to the matching PAGE_COPY entry. Runs once now and again on
 * every language change (live, no reload).
 *
 * Note: PAGE_COPY values are trusted, hard-coded build-time constants (never
 * user input), so assigning them via innerHTML carries no XSS risk.
 */
export function setupPageLocalization(): void {
    const apply = () => {
        const lang = languageStore.get();
        document
            .querySelectorAll<HTMLElement>("[data-i18n]")
            .forEach((el) => {
                const key = el.dataset.i18n;
                if (!key) return;
                const html = PAGE_COPY[lang]?.[key] ?? PAGE_COPY.en[key];
                if (html != null) el.innerHTML = html;
            });
    };
    apply();
    languageStore.subscribe(apply);
}

/** Per-language example/pronunciation override for a rune symbol, if any. */
export function exampleOverride(ipaSymbol: string): ExampleOverride | undefined {
    return TABLE_EXAMPLES[languageStore.get()]?.[ipaSymbol];
}
