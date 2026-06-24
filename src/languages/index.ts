import { PHONEME_MAPS } from "../phonemes/maps.generated";

/**
 * A language module is fully self-contained: an eSpeak voice + a frozen
 * native-IPA -> rune-IPA map. Adding a language = add one entry here (and a
 * map in maps.generated.ts). English is NOT special-cased — it is just a
 * module whose map is near-identity.
 */
export interface LanguageModule {
    id: string;
    label: string;
    /** eSpeak-ng voice identifier passed to `-v`. */
    espeakVoice: string;
    /** Frozen map: eSpeak native IPA symbol -> rune IPA symbol(s). */
    phonemeMap: Record<string, string>;
    /** Placeholder shown when the language is selected. */
    sampleText: string;
}

export const LANGUAGES: LanguageModule[] = [
    {
        id: "en",
        label: "English",
        espeakVoice: "en-us",
        phonemeMap: PHONEME_MAPS.en,
        sampleText: "Tunic\nSecret Legend!",
    },
    {
        id: "fr-ch",
        label: "Français (Suisse)",
        espeakVoice: "fr-ch",
        // Bracket access: the hyphen makes PHONEME_MAPS.fr-ch invalid.
        phonemeMap: PHONEME_MAPS["fr-ch"],
        sampleText: "Château\nde sable",
    },
    {
        // Native Swiss-French runic: same fr-ch voice, but idle runes are
        // reassigned to French sounds (/y/, nasals, /ø/, /ɲ/). The chart + the
        // Rune IPA readout show the French symbols via src/i18n/runeDisplay.ts.
        id: "ch-fr-override",
        label: "Français (Suisse) · natif",
        espeakVoice: "fr-ch",
        phonemeMap: PHONEME_MAPS["ch-fr-override"],
        sampleText: "Montagnes\nde Genève",
    },
    {
        id: "de",
        label: "Deutsch",
        espeakVoice: "de",
        phonemeMap: PHONEME_MAPS.de,
        sampleText: "Schöne\nGrüße",
    },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export function getLanguage(id: string): LanguageModule {
    return LANGUAGES.find((lang) => lang.id === id) ?? DEFAULT_LANGUAGE;
}
