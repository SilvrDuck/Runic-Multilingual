#!/usr/bin/env python3
"""
Generate frozen phoneme maps: eSpeak-ng native IPA symbol -> rune (GenAm) IPA.

Pipeline (per the design decision "precompute a frozen table offline"):
  1. Automated base  : PanPhon weighted feature-edit distance picks the nearest
                       single rune-inventory phoneme for each native symbol.
  2. Perceptual layer : hand overrides (from the research: PAM/SLM assimilation
                       data) replace the base where perception != feature-distance.
                       A value may be a SEQUENCE of rune symbols (e.g. "pf", "ɑn").

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
    "fr": [
        # /ð/ and /ɪ/ only appear in eSpeak French for English loanwords; they
        # aren't native, so they're left out (those runes grey out in the table).
        "b", "d", "f", "ɡ", "k", "l", "m", "n", "ɲ", "ŋ", "p", "s", "t",
        "v", "w", "j", "z", "ʁ", "ʃ", "ʒ",
        "a", "e", "i", "o", "u", "y", "ø", "œ", "ɔ", "ə", "ɛ",
        "ɛ̃", "ɑ̃", "ɔ̃", "œ̃",
    ],
    "de": [
        "b", "d", "f", "ɡ", "h", "j", "k", "l", "m", "n", "ŋ", "p", "s",
        "t", "v", "x", "z", "ç", "ʃ", "pf", "ts", "tʃ", "dʒ", "r", "ɾ", "ʁ", "ɜ",
        "a", "ɑ", "e", "i", "o", "u", "y", "ø", "ɪ", "ʏ", "ʊ", "ɛ", "œ", "ɔ",
        "ə", "aɪ", "aʊ", "ɔø", "ɐ",
    ],
}

# --- Perceptual overrides (take precedence over the automated base). ---
# Sources: Strange et al. cross-language assimilation; Flege SLM; research report.
# Values may be multi-symbol rune sequences (rendered as consecutive runes).
COMMON = {
    # eSpeak artifacts / GenAm reductions present across voices
    "ᵻ": "ɪ",    # barred-i reduced vowel -> ɪ
    "ɚ": "ɝ",    # r-coloured schwa -> ɝ
    "ɐ": "ə",    # near-open central -> schwa
    "ʌ": "ə",    # no /ʌ/ rune; nearest reduced central
    "ɫ": "l",    # dark l -> l
    "r": "ɹ",    # any trill/tap r -> GenAm rhotic
    "ɾ": "ɹ",
}
OVERRIDES = {
    "en": {
        # identity for diphthongs/affricates that ARE in the inventory
        "eɪ": "eɪ", "aɪ": "aɪ", "ɔɪ": "ɔɪ", "oʊ": "oʊ", "aʊ": "aʊ",
        "tʃ": "tʃ", "dʒ": "dʒ", "ɝ": "ɝ",
    },
    "fr": {
        "y": "u",       # front rounded -> back rounded (rounding cue dominates; PAM)
        "ø": "oʊ",      # -> back rounded mid
        "œ": "ə",       # -> reduced central (no /ʌ/)
        "ʁ": "ɹ",       # uvular -> GenAm rhotic
        "ɲ": "nj",      # palatal nasal -> n + j
        "ɛ̃": "ɛn",      # nasal vowels: oral vowel + /n/ (English reanalysis)
        "ɑ̃": "ɑn",
        "ɔ̃": "ɑn",      # CONTESTED: ɑn (default) vs oʊ
        "œ̃": "ən",      # CONTESTED: rare, merges with ɛ̃ in Parisian French
        "a": "ɑ",       # CONTESTED: ɑ (research default) vs æ (frontness)
        "e": "eɪ", "o": "oʊ", "ɔ": "ɑ",
    },
    "de": {
        "ç": "ʃ",       # ich-laut -> ʃ (dominant English substitution); CONTESTED vs h
        "x": "k",       # ach-laut -> k; CONTESTED vs h
        "ʁ": "ɹ",
        "ɜ": "ə",       # vocalised r (-er); CONTESTED vs ɝ
        "y": "u",
        "ʏ": "ʊ",
        "ø": "oʊ",
        "œ": "ə",       # CONTESTED vs ɛ
        "ɔø": "ɔɪ",     # eu/aeu diphthong -> boy-diphthong
        "pf": "pf",     # decompose affricate -> p + f
        "ts": "ts",     # decompose -> t + s
        "tʃ": "tʃ",     # affricate in inventory -> keep
        "dʒ": "dʒ",     # affricate in inventory (loanwords); PanPhon picks bare /d/
        "aɪ": "aɪ", "aʊ": "aʊ",
        "e": "eɪ", "o": "oʊ", "ɔ": "ɑ", "a": "ɑ",
    },
}


# Languages to generate, derived from INVENTORY — add a language by adding an
# entry to INVENTORY (and optionally OVERRIDES); nothing else here changes.
LANGS = list(INVENTORY.keys())


def build(lang: str) -> dict:
    # COMMON artifacts/reductions apply to every language; per-language
    # overrides win on conflict; everything else falls back to the automated
    # PanPhon nearest-neighbour.
    overrides = {**COMMON, **OVERRIDES.get(lang, {})}
    out = {}
    for sym in set(INVENTORY[lang]) | set(overrides):
        out[sym] = overrides[sym] if sym in overrides else nearest(sym)
    return out


HEADER = """\
// AUTO-GENERATED by scripts/gen_phoneme_map.py — do not edit by hand.
// eSpeak-ng native IPA symbol -> rune (General American) IPA symbol(s).
// Base: PanPhon feature-distance. Overrides: perceptual assimilation data.
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
