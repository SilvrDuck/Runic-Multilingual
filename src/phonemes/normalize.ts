/**
 * Normalize raw eSpeak-ng `--ipa` output into clean NATIVE IPA, ready to be
 * tokenized and mapped. We keep the native phonemes intact (y, ʁ, ɑ̃, ç, …);
 * only suprasegmental noise is removed.
 */

// Stress (ˈ ˌ), half-length (ˑ), tie bar (͡), zero-width joiner ties (‍).
// Full-length ː is deliberately KEPT: Swiss French encodes the patte/pâte
// (/a/–/ɑ/) contrast purely as length (a vs aː), and the fr-ch map turns aː into a
// back ɑ. A length mark on any vowel without an explicit map key is dropped in map.ts.
const SUPRASEGMENTALS = /[ˈˌˑ͡‍]/g;

export function normalizeNativeIPA(raw: string): string {
    return (
        raw
            // eSpeak language-switch markers, e.g. "(en)" / "(fr)"
            .replace(/\([^)]*\)/g, "")
            // strip stress / length / ties
            .replace(SUPRASEGMENTALS, "")
            // stray hyphen artifact on dropped-e etc.
            .replace(/-/g, "")
            // collapse runs of spaces/tabs but preserve newlines
            .replace(/[^\S\n]+/g, " ")
            // keep combining marks (e.g. nasal tilde) attached to their base
            .normalize("NFC")
            .trim()
    );
}
