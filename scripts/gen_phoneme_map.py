#!/usr/bin/env python3
"""
Generate frozen phoneme maps: eSpeak-ng native IPA symbol -> rune (GenAm) IPA.

Objective: ROUND-TRIP through a NATIVE reader — pick the rune(s) a native speaker,
sounding them out, re-reads as the source phoneme, keeping that speaker's contrasts
distinct. (See PHONEME-REFRAME-REPORT.md for the per-phoneme evidence.)

Pipeline:
  1. Override layer  : per-language hand tables, authoritative. A value may be a
                       SEQUENCE of rune symbols (e.g. "pf", "ɑn") or "" to drop.
  2. Automated base  : PanPhon feature-edit distance — a FALLBACK that picks the
                       nearest single rune phoneme for any symbol not overridden.

Run:  python scripts/gen_phoneme_map.py
Out:  src/phonemes/maps.generated.ts   (do not edit by hand; edit overrides here)

Requires: pip install panphon
"""

import json
import os
import panphon.distance

dst = panphon.distance.Distance()

# --- Rune inventory: the ONLY symbols a rune can encode (General American) ---
# Single-segment members used for automated nearest-neighbour.
TARGETS_SINGLE = [
    # consonants
    "b", "d", "f", "ɡ", "h", "k", "l", "m", "n", "ŋ", "p", "ɹ", "s", "ʃ",
    "t", "θ", "ð", "v", "w", "j", "z", "ʒ",
    # monophthong vowels
    "æ", "ɑ", "ɔ", "ɛ", "i", "ə", "ɪ", "ɝ", "u", "ʊ",
]


def nearest(seg: str) -> str:
    best, best_d = None, 1e9
    for t in TARGETS_SINGLE:
        d = dst.feature_edit_distance(seg, t)
        if d < best_d:
            best, best_d = t, d
    return best


# Every rune symbol that can appear in a map value, longest first so multi-char
# runes ("tʃ", "eɪ") stay whole while sequences ("ɑn", "pf") split correctly.
RUNE_TOKENS = sorted(
    set(TARGETS_SINGLE) | {"eɪ", "oʊ", "aɪ", "aʊ", "ɔɪ", "tʃ", "dʒ"},
    key=lambda s: -len(s),
)


def tokenize_runes(value: str) -> list:
    toks, i = [], 0
    while i < len(value):
        for tk in RUNE_TOKENS:
            if value.startswith(tk, i):
                toks.append(tk)
                i += len(tk)
                break
        else:
            i += 1  # skip spaces / stray chars
    return toks


def reachable_runes(lang: str, mapping: dict) -> list:
    """Runes the language can actually produce: map each symbol the eSpeak
    voice emits (INVENTORY) through the frozen map, collect the rune tokens.
    Drives both the reference-table greying and the coverage test."""
    out = set()
    for sym in INVENTORY[lang]:
        out.update(tokenize_runes(mapping.get(sym, "")))
    return sorted(out)


# --- eSpeak symbol inventories actually emitted per voice (research ground truth) ---
INVENTORY = {
    "en": [
        "b", "d", "f", "ɡ", "h", "k", "l", "m", "n", "ŋ", "p", "ɹ", "s", "ʃ",
        "t", "θ", "ð", "v", "w", "j", "z", "ʒ", "tʃ", "dʒ",
        "i", "ɪ", "ɛ", "æ", "ə", "ʌ", "ɑ", "ɔ", "ʊ", "u",
        "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "ɝ", "ɚ", "ᵻ", "ɫ", "ɐ",
    ],
    # Swiss French (Geneva). eSpeak's fr-ch voice is IPA-identical to fr; the
    # length mark on aː (pâte vs patte) is the only suprasegmental we exploit.
    # /ð/ and /ɪ/ only appear for English loanwords (not native), so they're left
    # out — those runes grey out in the table.
    "fr-ch": [
        "b", "d", "f", "ɡ", "k", "l", "m", "n", "ɲ", "ŋ", "p", "s", "t",
        "v", "w", "j", "z", "ʁ", "ʃ", "ʒ",
        "a", "aː", "e", "i", "o", "u", "y", "ø", "œ", "ɔ", "ə", "ɛ",
        "ɛ̃", "ɑ̃", "ɔ̃", "œ̃",
    ],
    "de": [
        "b", "d", "f", "ɡ", "h", "j", "k", "l", "m", "n", "ŋ", "p", "s",
        "t", "v", "x", "z", "ç", "ʃ", "pf", "ts", "tʃ", "dʒ", "r", "ɾ", "ʁ", "ɜ",
        "a", "ɑ", "e", "i", "o", "u", "y", "ø", "ɪ", "ʏ", "ʊ", "ɛ", "œ", "ɔ",
        "ə", "aɪ", "aʊ", "ɔø", "ɐ",
    ],
}

# --- Universal phonetic normalizations (apply to EVERY language). ---
# Cross-language facts, NOT English reductions: any trill/tap r is closest to
# GenAm /ɹ/, dark l to /l/, near-open central to schwa.
COMMON = {
    "r": "ɹ",    # trill/tap r -> GenAm rhotic
    "ɾ": "ɹ",
    "ɫ": "l",    # dark l -> l
    "ɐ": "ə",    # near-open central -> schwa (e.g. German final -er variants)
}

# --- English-only GenAm reductions: must NOT leak into native-reader maps. ---
COMMON_EN = {
    "ᵻ": "ɪ",    # barred-i reduced vowel -> ɪ
    "ɚ": "ɝ",    # r-coloured schwa -> ɝ
    "ʌ": "ə",    # no /ʌ/ rune; nearest reduced central
}

# --- Per-language overrides (authoritative; chosen for native-reader round-trip). ---
# A value may be a SEQUENCE of rune symbols, or "" to drop the phoneme.
OVERRIDES = {
    "en": {
        # identity for diphthongs/affricates that ARE in the inventory
        "eɪ": "eɪ", "aɪ": "aɪ", "ɔɪ": "ɔɪ", "oʊ": "oʊ", "aʊ": "aʊ",
        "tʃ": "tʃ", "dʒ": "dʒ", "ɝ": "ɝ",
    },
    # Swiss French (Geneva): preserve patte/pâte (/a/–/ɑ/), merge brun/brin (/œ̃/→/ɛ̃/).
    "fr-ch": {
        "a": "æ",        # short /a/ (patte) -> front æ
        "aː": "ɑ",       # long /ɑ/ (pâte) -> back ɑ (length preserved by normalize)
        "y": "ju",       # tu≠tout≠dis; no front-rounded rune; CONTESTED: ju vs i
        "ø": "ə",        # peu; French schwa ≈ [ø], stays distinct from œ→ɝ
        "œ": "ɝ",        # peur / "-eur" set -> NURSE vowel
        "ʁ": "ɹ",        # uvular -> only rhotic consonant
        "ɲ": "nj",       # palatal nasal -> [nj] (modern French realisation)
        "ɛ̃": "ɛn",       # nasal -> oral vowel + n; ɛ reads back as /ɛ̃/ (Geneva [ɛ̃])
        "ɑ̃": "ɑn",
        "ɔ̃": "oʊn",      # rounded back nasal [õ] -> "ohn"
        "œ̃": "ɛn",       # Geneva: brun=brin -> merge into /ɛ̃/
        "e": "eɪ", "o": "oʊ", "ɔ": "ɑ",
        "ð": "z", "θ": "s", "h": "",  # guard: no French /ð θ h/ (loanword leakage)
    },
    # Standard German, native reader.
    "de": {
        "ɑ": "ɑ",        # long /aː/ (Staat) -> back ɑ
        "a": "æ",        # short /a/ (Stadt) -> front æ; keeps Stadt≠Staat
        "x": "h",        # ach-laut -> h (fricative manner kept; Bach≠Backe)
        "ç": "ʃ",        # ich-laut -> ʃ ("isch"); merges Kirche/Kirsche (accepted)
        "ʁ": "ɹ",        # uvular onset r -> only rhotic
        "ɜ": "ə",        # vocalised -er is non-rhotic [ɐ] -> schwa (never ɝ)
        "y": "ju",       # über; Tür≠Tour; CONTESTED: ju vs i
        "ʏ": "ɪ",        # Glück; front lax
        "ø": "ɝ",        # schön -> NURSE (off oʊ; fixes schön/schon)
        "œ": "ɝ",        # können; stressed-readable mid-central
        "ɔø": "ɔɪ",      # eu/äu -> boy-diphthong
        "pf": "pf",      # affricate -> p + f
        "ts": "ts",      # affricate -> t + s
        "tʃ": "tʃ",
        "dʒ": "dʒ",      # affricate in inventory (loanwords); PanPhon picks bare /d/
        "aɪ": "aɪ", "aʊ": "aʊ",
        "e": "eɪ", "o": "oʊ", "ɔ": "ɑ",
    },
}


# Languages to generate, derived from INVENTORY — add a language by adding an
# entry to INVENTORY (and optionally OVERRIDES); nothing else here changes.
LANGS = list(INVENTORY.keys())


def build(lang: str) -> dict:
    # Universal normalizations apply everywhere; English-only reductions only to
    # en; per-language overrides win on conflict; everything else falls back to
    # the automated PanPhon nearest-neighbour.
    overrides = {
        **COMMON,
        **(COMMON_EN if lang == "en" else {}),
        **OVERRIDES.get(lang, {}),
    }
    out = {}
    for sym in set(INVENTORY[lang]) | set(overrides):
        out[sym] = overrides[sym] if sym in overrides else nearest(sym)
    return out


HEADER = """\
// AUTO-GENERATED by scripts/gen_phoneme_map.py — do not edit by hand.
// eSpeak-ng native IPA symbol -> rune (General American) IPA symbol(s).
// Per-language overrides chosen for native-reader round-trip; PanPhon fallback.
"""

TEMPLATE = """\
{header}
export const PHONEME_MAPS: Record<string, Record<string, string>> = {maps};

// Runes each language can actually produce — drives reference-table greying
// and the build-time coverage test.
export const REACHABLE_RUNES: Record<string, string[]> = {reachable};
"""


def ts_literal(value) -> str:
    # JSON object/array literals are valid TypeScript for these plain
    # string maps and string arrays.
    return json.dumps(value, ensure_ascii=False, indent=4, sort_keys=True)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, "..", "src", "phonemes", "maps.generated.ts")
    maps = {lang: build(lang) for lang in LANGS}
    reachable = {lang: reachable_runes(lang, maps[lang]) for lang in LANGS}

    content = TEMPLATE.format(
        header=HEADER,
        maps=ts_literal(maps),
        reachable=ts_literal(reachable),
    )
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    for lang in LANGS:
        print(
            f"{lang}: {len(maps[lang])} symbols, "
            f"{len(reachable[lang])} reachable runes"
        )
    print(f"Wrote {os.path.normpath(out_path)}")


if __name__ == "__main__":
    main()
