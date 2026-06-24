/**
 * UI string translations, keyed by language id. `en` is the complete reference;
 * other languages fall back to `en` for any missing key (see `t()` in ./index).
 *
 * Adding a language means adding an entry here. Machine-drafted translations
 * below should be reviewed by a native speaker.
 */

export type StringKey =
    | "language"
    | "input"
    | "nativeIpa"
    | "runeIpa"
    | "translating"
    | "approxNotice"
    | "settings"
    | "thickness"
    | "glow"
    | "lineHeight"
    | "runeColor"
    | "background"
    | "hidePhonemes"
    | "showPhonemes"
    | "transparentBg"
    | "opaqueBg"
    | "copy"
    | "share";

export const STRINGS: Record<string, Partial<Record<StringKey, string>>> = {
    en: {
        language: "Language",
        input: "Input",
        nativeIpa: "English IPA",
        runeIpa: "English IPA (Tunic)",
        translating: "Translating…",
        approxNotice:
            "Runes are based on English sounds. Greyed runes rarely appear; others map to the closest English sound.",
        settings: "Settings",
        thickness: "Thickness",
        glow: "Glow Effect",
        lineHeight: "Line Height",
        runeColor: "Rune Color",
        background: "Background",
        hidePhonemes: "Hide phonemes",
        showPhonemes: "Show phonemes",
        transparentBg: "Transparent background",
        opaqueBg: "Opaque background",
        copy: "Copy",
        share: "Share",
    },
    "fr-ch": {
        language: "Langue",
        input: "Saisie",
        nativeIpa: "IPA français",
        runeIpa: "IPA anglais (Tunic)",
        translating: "Traduction…",
        approxNotice:
            "Les runes sont basées sur les sons anglais. Les runes grisées apparaissent rarement ; les autres utilisent le son anglais le plus proche.",
        settings: "Paramètres",
        thickness: "Épaisseur",
        glow: "Effet de lueur",
        lineHeight: "Hauteur de ligne",
        runeColor: "Couleur des runes",
        background: "Arrière-plan",
        hidePhonemes: "Masquer les phonèmes",
        showPhonemes: "Afficher les phonèmes",
        transparentBg: "Fond transparent",
        opaqueBg: "Fond opaque",
        copy: "Copier",
        share: "Partager",
    },
    de: {
        language: "Sprache",
        input: "Eingabe",
        nativeIpa: "Deutsche IPA",
        runeIpa: "Englische IPA (Tunic)",
        translating: "Übersetze…",
        approxNotice:
            "Runen basieren auf englischen Lauten. Ausgegraute Runen erscheinen kaum; die anderen nutzen den nächsten englischen Laut.",
        settings: "Einstellungen",
        thickness: "Dicke",
        glow: "Leuchteffekt",
        lineHeight: "Zeilenhöhe",
        runeColor: "Runenfarbe",
        background: "Hintergrund",
        hidePhonemes: "Phoneme ausblenden",
        showPhonemes: "Phoneme anzeigen",
        transparentBg: "Transparenter Hintergrund",
        opaqueBg: "Deckender Hintergrund",
        copy: "Kopieren",
        share: "Teilen",
    },
};

/**
 * Longer page copy (intro, section blurbs, footer). Values may contain inline
 * HTML (links, <b>, <br>). Keyed by the element's data-i18n attribute; applied
 * by setupPageLocalization() in ./index. `en` is the reference / fallback.
 * Machine-drafted — review with a native speaker.
 */
export const PAGE_COPY: Record<string, Record<string, string>> = {
    en: {
        intro: `This is a fan-made website that helps you read the in-game language of <a href="https://store.steampowered.com/app/553420/TUNIC/" target="_blank" rel="noopener">Tunic</a> - what the community calls <b>Runic</b>.`,
        translator: `Type text in your chosen language - it is converted to phonemes and mapped to the closest Tunic runes, then drawn below.`,
        vowel: `The perimeter of a rune describes the vowel - click on a card to copy it!`,
        consonant: `The inner segments of a rune describe the consonant - click on a card to copy it!`,
        playground: `Create your own runes by clicking on segments.`,
        testimonials: `See what fans are saying about this site!`,
        footerMain: `Made by <a href="https://github.com/aryanpingle" target="_blank" rel="noopener">Aryan Pingle</a>. This project is <a href="https://github.com/aryanpingle/Runic" target="_blank" rel="noopener">open source on GitHub</a>.`,
        footerDisclaimer: `I do not own any part of "Tunic", or have any relation to the development or production team.<br />I am simply a fan who loves this beautiful, <b>beautiful</b> game.<br />Praise be to indie games.`,
    },
    "fr-ch": {
        intro: `Ce site, créé par des fans, vous aide à lire la langue du jeu <a href="https://store.steampowered.com/app/553420/TUNIC/" target="_blank" rel="noopener">Tunic</a> - que la communauté appelle <b>Runic</b>.`,
        translator: `Saisissez du texte dans la langue choisie - il est converti en phonèmes puis associé aux runes Tunic les plus proches, et dessiné ci-dessous.`,
        vowel: `Le contour d'une rune décrit la voyelle - cliquez sur une carte pour la copier !`,
        consonant: `Les segments internes d'une rune décrivent la consonne - cliquez sur une carte pour la copier !`,
        playground: `Créez vos propres runes en cliquant sur les segments.`,
        testimonials: `Découvrez ce que les fans pensent de ce site !`,
        footerMain: `Créé par <a href="https://github.com/aryanpingle" target="_blank" rel="noopener">Aryan Pingle</a>. Ce projet est <a href="https://github.com/aryanpingle/Runic" target="_blank" rel="noopener">open source sur GitHub</a>.`,
        footerDisclaimer: `Je ne possède aucun droit sur « Tunic » et n'ai aucun lien avec l'équipe de développement ou de production.<br />Je suis simplement un fan qui adore ce jeu magnifique, <b>magnifique</b>.<br />Gloire aux jeux indépendants.`,
    },
    de: {
        intro: `Diese von Fans erstellte Website hilft dir, die Spielsprache von <a href="https://store.steampowered.com/app/553420/TUNIC/" target="_blank" rel="noopener">Tunic</a> zu lesen - von der Community <b>Runic</b> genannt.`,
        translator: `Gib Text in der gewählten Sprache ein - er wird in Phoneme umgewandelt, den nächstgelegenen Tunic-Runen zugeordnet und unten dargestellt.`,
        vowel: `Der Rand einer Rune beschreibt den Vokal - klicke auf eine Karte, um sie zu kopieren!`,
        consonant: `Die inneren Segmente einer Rune beschreiben den Konsonanten - klicke auf eine Karte, um sie zu kopieren!`,
        playground: `Erstelle deine eigenen Runen, indem du auf Segmente klickst.`,
        testimonials: `Sieh, was Fans über diese Seite sagen!`,
        footerMain: `Erstellt von <a href="https://github.com/aryanpingle" target="_blank" rel="noopener">Aryan Pingle</a>. Dieses Projekt ist <a href="https://github.com/aryanpingle/Runic" target="_blank" rel="noopener">Open Source auf GitHub</a>.`,
        footerDisclaimer: `Ich besitze keinerlei Rechte an „Tunic“ und habe keine Verbindung zum Entwicklungs- oder Produktionsteam.<br />Ich bin einfach ein Fan, der dieses wunderschöne, <b>wunderschöne</b> Spiel liebt.<br />Gelobt seien Indie-Spiele.`,
    },
};
