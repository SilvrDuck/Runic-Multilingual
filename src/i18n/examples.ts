/**
 * Per-language reference-table data, keyed by the rune's IPA symbol (see
 * src/runeDataset.ts). For every rune a language can produce, supply BOTH:
 *   - `pronunciation`: a short "sounds-like" hint in that language's own terms
 *     (the English defaults like "uh"/"ee" make no sense to other speakers)
 *   - `examples`: native example words that the translator maps to that rune
 *
 * Runes a language can't produce are greyed out in the table and fall back to
 * the English defaults from runeDataset.ts, so they need no entry here.
 *
 * Both fields are enforced for every reachable rune by `npm test`.
 * Machine-drafted — review with a native speaker before relying on it.
 */

export interface ExampleOverride {
    examples?: string;
    pronunciation?: string;
}

export const TABLE_EXAMPLES: Record<
    string,
    Record<string, ExampleOverride>
> = {
    en: {}, // English uses the defaults in runeDataset.ts

    fr: {
        i: { pronunciation: "i", examples: "lit, midi, riz" },
        u: { pronunciation: "ou", examples: "fou, vous, loup" },
        eɪ: { pronunciation: "é", examples: "été, blé, nez" },
        ɛ: { pronunciation: "è", examples: "père, mère, sept" },
        ɑ: { pronunciation: "a", examples: "pâte, bas, là" },
        oʊ: { pronunciation: "o", examples: "beau, mot, eau" },
        ə: { pronunciation: "e", examples: "le, je, demain" },
        s: { pronunciation: "s", examples: "sel, classe, six" },
        z: { pronunciation: "z", examples: "zéro, maison, rose" },
        f: { pronunciation: "f", examples: "feu, photo, neuf" },
        v: { pronunciation: "v", examples: "vie, vous, rêve" },
        m: { pronunciation: "m", examples: "main, pomme, femme" },
        n: { pronunciation: "n", examples: "non, nous, animal" },
        p: { pronunciation: "p", examples: "papa, pont, soupe" },
        t: { pronunciation: "t", examples: "table, tout, petit" },
        k: { pronunciation: "c / qu", examples: "café, quatre, sac" },
        b: { pronunciation: "b", examples: "bébé, robe, beau" },
        d: { pronunciation: "d", examples: "dans, monde, aide" },
        ɡ: { pronunciation: "g (dur)", examples: "gare, bague, gros" },
        l: { pronunciation: "l", examples: "lune, ville, sel" },
        ʃ: { pronunciation: "ch", examples: "chat, chien, vache" },
        ʒ: { pronunciation: "j", examples: "jour, rouge, jeu" },
        ɹ: { pronunciation: "r", examples: "rouge, rire, Paris" }, // /ʁ/
        j: { pronunciation: "y / ille", examples: "yeux, paille, hier" },
        w: { pronunciation: "ou / w", examples: "oui, moi, jouer" },
        ŋ: { pronunciation: "ng", examples: "camping, parking" },
    },

    de: {
        i: { pronunciation: "i (lang)", examples: "Liebe, wie, Igel" },
        ɪ: { pronunciation: "i (kurz)", examples: "Fisch, mit, Kind" },
        eɪ: { pronunciation: "e (lang)", examples: "See, Tee, geht" },
        ɛ: { pronunciation: "e (kurz) / ä", examples: "Bett, Wetter, hätte" },
        ɑ: { pronunciation: "a", examples: "Vater, Tag, Wasser" },
        oʊ: { pronunciation: "o (lang)", examples: "Boot, rot, Sohn" },
        u: { pronunciation: "u", examples: "Buch, gut, Uhr" },
        ʊ: { pronunciation: "u (kurz)", examples: "und, Hund, Mutter" },
        ə: { pronunciation: "e (Schwa)", examples: "bitte, Name, Gabe" },
        aɪ: { pronunciation: "ei / ai", examples: "mein, Eis, Zeit" },
        aʊ: { pronunciation: "au", examples: "Haus, Frau, blau" },
        ɔɪ: { pronunciation: "eu / äu", examples: "neu, Heu, Häuser" },
        s: { pronunciation: "ß / ss", examples: "Wasser, das, Bus" },
        z: { pronunciation: "s (weich)", examples: "Sonne, sie, Rose" },
        f: { pronunciation: "f / v", examples: "Fisch, Vater, fünf" },
        v: { pronunciation: "w", examples: "Wasser, Wein, wo" },
        m: { pronunciation: "m", examples: "Mann, Mutter, kommen" },
        n: { pronunciation: "n", examples: "nein, Name, Sonne" },
        ŋ: { pronunciation: "ng", examples: "lang, singen, Ring" },
        p: { pronunciation: "p", examples: "Papa, Pause, Lampe" },
        t: { pronunciation: "t", examples: "Tag, Tisch, Mutter" },
        k: { pronunciation: "k", examples: "Kind, Kuchen, Ecke" },
        b: { pronunciation: "b", examples: "Buch, Baum, geben" },
        d: { pronunciation: "d", examples: "das, drei, Dame" },
        ɡ: { pronunciation: "g", examples: "Garten, gut, geben" },
        l: { pronunciation: "l", examples: "Liebe, Ball, Hilfe" },
        ʃ: { pronunciation: "sch", examples: "Schule, schön, Tisch" },
        ɹ: { pronunciation: "r", examples: "rot, Reise, fahren" }, // /ʁ/
        j: { pronunciation: "j", examples: "ja, jung, Jahr" },
        h: { pronunciation: "h", examples: "Haus, Hund, hallo" },
        tʃ: { pronunciation: "tsch", examples: "Deutsch, Tschüss, Matsch" },
        dʒ: { pronunciation: "dsch", examples: "Dschungel" },
    },
};
