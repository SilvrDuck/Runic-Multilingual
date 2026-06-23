/**
 * Map normalized NATIVE IPA to RUNE IPA (the General-American inventory the
 * renderer understands) using a frozen per-language lookup table.
 *
 * Tokenization is greedy longest-match (multi-codepoint symbols like "tʃ",
 * "eɪ", or the nasal "ɛ̃" must win over their single-char prefixes), mirroring
 * the renderer's own tokenizer.
 */

// Punctuation / whitespace passed through verbatim (rendered as gaps/specials).
const PASSTHROUGH = /[\s.,!?;:'"’()«»\-]/;

export function mapToRuneIPA(
    native: string,
    phonemeMap: Record<string, string>,
): string {
    const keys = Object.keys(phonemeMap).sort((a, b) => b.length - a.length);

    let result = "";
    let i = 0;
    while (i < native.length) {
        let matched = false;
        for (const key of keys) {
            if (native.startsWith(key, i)) {
                result += phonemeMap[key];
                i += key.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            const char = native[i];
            // Pass through punctuation/whitespace; drop unknown phonetic symbols
            // rather than emit garbage runes.
            if (PASSTHROUGH.test(char)) result += char;
            i += 1;
        }
    }
    return result;
}
