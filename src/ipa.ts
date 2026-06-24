import { phonemizeRaw, warmUp } from "./engine/espeak";
import { normalizeNativeIPA } from "./phonemes/normalize";
import { mapToRuneIPA } from "./phonemes/map";
import { LanguageModule } from "./languages";

export { warmUp };

// French inclusive writing uses a median dot (petit·te, ami·e·s, tou·te·s) that
// eSpeak would otherwise read aloud as the word "point". Drop it so the parts
// concatenate into the natural full form (petit·te → petitte → /pətit/). Covers
// the common median-dot / bullet variants.
const INCLUSIVE_MIDDOT = /[··•‧・]/g;

export interface Translation {
    /** Cleaned native IPA of the source language (y, ʁ, ɑ̃, ç, …). */
    nativeIPA: string;
    /** Native phonemes mapped into the rune (General American) inventory. */
    runeIPA: string;
}

/**
 * Full pipeline: source text -> eSpeak native IPA -> normalized native IPA
 * -> rune IPA. Runs entirely in the browser. Async because the eSpeak engine
 * is a lazily-loaded WASM module.
 */
export async function translate(
    text: string,
    language: LanguageModule,
): Promise<Translation> {
    const raw = await phonemizeRaw(
        text.replace(INCLUSIVE_MIDDOT, ""),
        language.espeakVoice,
    );
    const nativeIPA = normalizeNativeIPA(raw);
    const runeIPA = mapToRuneIPA(nativeIPA, language.phonemeMap);
    return { nativeIPA, runeIPA };
}
