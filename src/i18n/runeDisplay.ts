/**
 * Per-language relabelling of rune-IPA symbols for DISPLAY only.
 *
 * Most language modules map their phonemes onto the *closest* General-American
 * rune, so the canonical rune-IPA symbol (e.g. "æ", "ɝ") is shown as-is. A
 * module that REASSIGNS idle runes to its own sounds (the native-runic modules)
 * needs the chart and the live "Rune IPA" readout to show the LANGUAGE'S symbol
 * instead — e.g. the rune drawn as English "θ" stands for French /ɲ/ here.
 *
 * This is presentation only: the underlying rune-IPA (and the glyph drawn) is
 * unchanged. Keyed by language id, then by rune-IPA symbol. Languages with no
 * entry render their canonical symbols (identity fallback).
 */

import { symbolDataTable } from "../runeDataset";

export const RUNE_DISPLAY: Record<string, Record<string, string>> = {
    // Native Swiss-French runic: show the French phoneme each glyph encodes.
    "ch-fr-override": {
        // vowels
        æ: "a", // patte
        ɑ: "ɑ", // pâte
        eɪ: "e", // été
        ɛ: "ɛ", // père
        i: "i",
        ə: "ə",
        oʊ: "o", // beau
        u: "u", // tout
        ʊ: "y", // tu      (reassigned)
        ɪ: "ø", // peu     (reassigned)
        ɝ: "œ", // peur
        aɪ: "ɛ̃", // vin     (reassigned)
        aʊ: "ɑ̃", // vent    (reassigned)
        ɔɪ: "ɔ̃", // bon     (reassigned)
        // consonants (only those whose French symbol differs)
        ɹ: "ʁ", // rue
        θ: "ɲ", // ligne   (reassigned)
    },
};

/** The symbol to show for a rune in a given language (identity if no override). */
export function runeDisplaySymbol(sym: string, langId: string): string {
    return RUNE_DISPLAY[langId]?.[sym] ?? sym;
}

// Rune symbols longest-first, so multi-char runes ("tʃ", "ɛ̃", "aɪ") match before
// their single-char prefixes (symbolDataTable is already sorted by length desc).
const SYMBOLS = symbolDataTable.map((s) => s.ipaSymbol);

/**
 * Relabel a rune-IPA string for display: greedy longest-match over the rune
 * inventory, replacing each rune token with its per-language display symbol.
 * Spaces, newlines and punctuation pass through. Mirrors the matcher in
 * src/phonemes/map.ts. No-op for languages without a RUNE_DISPLAY entry.
 */
export function relabelRuneIPA(runeIPA: string, langId: string): string {
    const table = RUNE_DISPLAY[langId];
    if (!table) return runeIPA;

    let out = "";
    let i = 0;
    while (i < runeIPA.length) {
        let matched = false;
        for (const sym of SYMBOLS) {
            if (sym && runeIPA.startsWith(sym, i)) {
                out += table[sym] ?? sym;
                i += sym.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            out += runeIPA[i];
            i += 1;
        }
    }
    return out;
}
