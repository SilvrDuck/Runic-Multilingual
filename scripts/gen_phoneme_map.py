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


# --- eSpeak symbol inventories actually emitted per voice (research ground truth) ---
INVENTORY = {
    "en": [
        "b", "d", "f", "ɡ", "h", "k", "l", "m", "n", "ŋ", "p", "ɹ", "s", "ʃ",
        "t", "θ", "ð", "v", "w", "j", "z", "ʒ", "tʃ", "dʒ",
        "i", "ɪ", "ɛ", "æ", "ə", "ʌ", "ɑ", "ɔ", "ʊ", "u",
        "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "ɝ", "ɚ", "ᵻ", "ɫ", "ɐ",
    ],
    "fr": [
        "b", "d", "f", "ɡ", "k", "l", "m", "n", "ɲ", "ŋ", "p", "s", "t",
        "v", "w", "j", "z", "ʁ", "ʃ", "ʒ", "ð",
        "a", "e", "i", "o", "u", "y", "ø", "œ", "ɔ", "ə", "ɛ", "ɪ",
        "ɛ̃", "ɑ̃", "ɔ̃", "œ̃",
    ],
    "de": [
        "b", "d", "f", "ɡ", "h", "j", "k", "l", "m", "n", "ŋ", "p", "s",
        "t", "v", "x", "z", "ç", "ʃ", "pf", "ts", "tʃ", "r", "ɾ", "ʁ", "ɜ",
        "a", "e", "i", "o", "u", "y", "ø", "ɪ", "ʏ", "ʊ", "ɛ", "œ", "ɔ",
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


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, "..", "src", "phonemes", "maps.generated.ts")
    maps = {lang: build(lang) for lang in LANGS}

    lines = [
        "// AUTO-GENERATED by scripts/gen_phoneme_map.py — do not edit by hand.",
        "// eSpeak-ng native IPA symbol -> rune (General American) IPA symbol(s).",
        "// Base: PanPhon feature-distance. Overrides: perceptual assimilation data.",
        "",
        "export const PHONEME_MAPS: Record<string, Record<string, string>> = {",
    ]
    for lang in LANGS:
        lines.append(f"    {lang}: {{")
        # longest keys first is irrelevant for an object; runtime sorts.
        for sym in sorted(maps[lang], key=lambda s: (-len(s), s)):
            lines.append(f'        {js_str(sym)}: {js_str(maps[lang][sym])},')
        lines.append("    },")
    lines.append("};")
    lines.append("")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # Print a human summary for sanity-checking.
    for lang in LANGS:
        print(f"\n=== {lang} ({len(maps[lang])} symbols) ===")
        print("  " + "  ".join(f"{k}->{v}" for k, v in sorted(maps[lang].items())))
    print(f"\nWrote {os.path.normpath(out_path)}")


def js_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


if __name__ == "__main__":
    main()
