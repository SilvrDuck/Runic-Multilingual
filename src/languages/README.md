# Adding a Language

Runic translates source text into Tunic runes through a small, modular
pipeline. Every language is a self-contained module — **English is not a
special case**, it's just a module whose phoneme map is near-identity.

```
source text
  → eSpeak-ng (WASM)        native IPA          src/engine/espeak.ts
  → normalize               clean native IPA    src/phonemes/normalize.ts
  → phoneme map             rune IPA            src/phonemes/map.ts + maps.generated.ts
  → tokenizer + renderer    runes               src/components/RuneSVG/
```

A rune can only encode one **General-American** phoneme, so a language module's
job is to map each of its native phonemes to the *closest-sounding* phoneme in
that fixed inventory (defined in [`src/runeDataset.ts`](../runeDataset.ts)).
"Closest" is resolved two ways:

- **Automated base** — PanPhon articulatory feature-distance picks the nearest
  rune phoneme. Handles the bulk (identical consonants, plain vowels) for free.
- **Perceptual overrides** — for sounds English lacks (`y ø œ`, nasals, `ç`,
  `x`, `ʁ`, …) feature-distance is *wrong* (perception ≠ articulation), so we
  override with values from assimilation research (e.g. French `y → u`).

Both live in `scripts/gen_phoneme_map.py`, which bakes them into the frozen
lookup table `src/phonemes/maps.generated.ts` at build time (no Python or model
runs in the browser).

---

## Steps

Adding, say, **Spanish**:

### 1. Find the eSpeak voice id

eSpeak-ng ships ~100 voices. Find the code (`espeak-ng --voices`, or the
[language list](https://github.com/espeak-ng/espeak-ng/blob/master/docs/languages.md)).
Spanish is `es`. This is the value you'll pass as `espeakVoice`.

### 2. Add the voice's phoneme inventory

In `scripts/gen_phoneme_map.py`, add an entry to `INVENTORY` listing the IPA
symbols that voice actually emits.

> **Tip — discover the symbols from the app itself.** Add the module (steps 4–5)
> with an empty inventory first, run `npm run dev`, pick the language, and type
> representative text. The **Native IPA** box shows exactly the eSpeak symbols
> you need to cover — copy them into `INVENTORY`. (eSpeak's symbols differ from
> textbook IPA: e.g. German vocalised-r is `ɜ`, French `/ɥ/` comes out as `y`.)

```python
INVENTORY = {
    # ...
    "es": ["b", "d", "f", "ɡ", "k", "l", "m", "n", "ɲ", "p", "ɾ", "r",
           "s", "t", "x", "θ", "ʃ", "tʃ", "j", "w",
           "a", "e", "i", "o", "u"],
}
```

### 3. Add perceptual overrides (recommended)

Add an `OVERRIDES` entry only for sounds where the automated base would sound
wrong, mapping to the closest rune phoneme. The shared `COMMON` artifacts
(`ᵻ→ɪ`, `ɾ→ɹ`, …) are applied automatically — don't repeat them. Flag any
genuinely contested choice in a comment so it's easy to revisit.

See [Finding perceptual overrides](#finding-perceptual-overrides) below for how
to source good values.

```python
OVERRIDES = {
    # ...
    "es": {
        "x": "h",        # Spanish jota -> /h/ (CONTESTED: h vs k)
        "ɲ": "nj",       # "ñ" -> n + j
        "r": "ɹ", "ɾ": "ɹ",
        "θ": "θ",        # already in the inventory; identity
    },
}
```

A value may be a **sequence** of rune phonemes (e.g. `"nj"`, `"ɑn"`) when one
foreign sound is best rendered as two runes.

### 4. Regenerate the frozen map

```bash
pip install panphon          # once
python scripts/gen_phoneme_map.py
```

This rewrites `src/phonemes/maps.generated.ts` with an `es` entry (and prints a
per-language summary so you can sanity-check the mappings). The language list is
derived from `INVENTORY`, so nothing else in the script needs editing.

### 5. Register the module

Add an entry to `LANGUAGES` in [`index.ts`](./index.ts):

```ts
{
    id: "es",
    label: "Español",
    espeakVoice: "es",
    phonemeMap: PHONEME_MAPS.es,
    sampleText: "Hola\nmundo",
},
```

### 6. Translate the UI strings

Add an entry for your language id to `STRINGS` in
[`../i18n/strings.ts`](../i18n/strings.ts). `en` is the complete reference; any
key you omit falls back to English. (The dropdown shows each language's endonym
from `label`, so language names themselves aren't translated.)

### 7. Add reference-table examples

Add an entry to `TABLE_EXAMPLES` in [`../i18n/examples.ts`](../i18n/examples.ts)
for every rune your language can produce, keyed by the rune's IPA symbol. Each
entry has two fields:

- `pronunciation` — a short "sounds-like" hint in your language's own terms
  (e.g. `ʃ → "ch"` for French). The table shows it prefixed with `~` to flag it
  as an approximation. Do **not** reuse the English hints (uh, ee, aw…) — they're
  meaningless to other speakers.
- `examples` — native example words that the translator maps to that rune.

Three rules, **all enforced by `npm test`** (which also runs on `npm run build`):

- **Correctness** — each example word, run through the translator, must contain
  the rune it's listed under (no coincidental English words — they'd be re-read
  through your language's phonology).
- **Coverage** — every rune your language can produce must have both a
  `pronunciation` and `examples`. That set is computed for you as
  `REACHABLE_RUNES` in `maps.generated.ts` (regenerated in step 4).
- Runes your language _can't_ produce are greyed out automatically and shown with
  the English defaults, so leave them out.

Run `npm test` and fix whatever it flags — it names the exact bad word, or the
reachable rune missing an example or hint.

### 8. Done

The top-of-page language dropdown, the persisted last-choice, the three-box
editor, the rune tables and the renderer all update **live** when the language
changes — no page reload. Verify with `npm run dev`: pick the language and
confirm the UI labels, the **Native IPA** / **Rune IPA** readouts, and the table
examples all look right.

---

## Finding perceptual overrides

An override answers one question: **when a native English speaker hears this
foreign sound, which English phoneme do they think they heard?** That is
*perceptual* similarity, and it routinely differs from how a sound is *produced*
or how it looks on a spectrogram. The textbook example: French `/y/` (the *tu*
vowel) is acoustically closest to English `/i/`, yet English ears file it under
`/u/` because the lip-rounding cue dominates. The automated PanPhon base already
covers articulatory closeness — so overrides exist **specifically for the cases
where perception diverges from articulation** (front-rounded vowels, nasal
vowels, `ç`, `x`, uvular `ʁ`, …).

### Where the data lives

- **Perceptual assimilation studies — the gold standard.** These literally
  measure which native category listeners choose for a non-native sound.
  - Frameworks to search by name: **Perceptual Assimilation Model** (PAM /
    PAM-L2 — Best; Best & Tyler 2007) and the **Speech Learning Model**
    (SLM / SLM-r — Flege; Flege & Bohn 2021).
  - Productive authors: **Catherine Best, James Flege, Winifred Strange,
    Ocke-Schwen Bohn**. (Strange et al.'s French & German vowel-assimilation
    studies by American-English listeners are exactly what the current `fr`/`de`
    overrides rest on.)
  - Search Google Scholar / *JASA* (J. Acoustical Society of America) /
    *Journal of Phonetics* / *Language and Speech* for queries like:
    - `perceptual assimilation of <language> vowels by English listeners`
    - `cross-language speech perception <language> consonants`
    - `<language> L2 English perception assimilation`
- **Loanword / nativization phonology.** How English actually borrows words
  from the language reveals the habitual substitutions (e.g. why *Bach* becomes
  "Bock"). Search `loanword adaptation <language> English`,
  `nativization of <language> in English`.
- **"&lt;Language&gt; phonology" on Wikipedia** + the IPA help pages — fastest
  first pass; phoneme tables there often list an "English approximation" and
  example words per sound.
- **Pronunciation / teaching guides** that describe the "nearest English sound"
  for learners — informal, but fine for the obvious cases.

Prefer published perceptual data; fall back to loanword patterns, then teaching
guides, then (last resort) reasoned articulatory analogy.

### Asking an LLM

An LLM is good for a first draft and for surfacing the relevant studies — but
only if you force it to **actually research and cite**. Use a model with web
search / browsing or a "deep research" mode enabled; a model answering from
memory alone **will invent plausible-looking citations**. Give it the *fixed
target inventory*, force the *perceptual* criterion, and make verifiable
citations a hard requirement:

> Research the perceptual assimilation of **&lt;LANGUAGE&gt;** phonemes by native
> English listeners, then map each &lt;LANGUAGE&gt; phoneme to the closest phoneme
> in this FIXED inventory (General American English):
> `æ ɑ ɔ eɪ ɛ i ə ɪ aɪ ɝ oʊ ɔɪ u ʊ aʊ  b tʃ d f ɡ h dʒ k l m n ŋ p ɹ s ʃ t θ ð v w j z ʒ`
>
> **Search the current literature before answering — do not rely on memory.**
> Prioritise perceptual-assimilation and L2-perception studies (PAM / SLM;
> authors such as Best, Flege, Strange, Bohn) and loanword-adaptation phonology.
>
> Return a table, one row per &lt;LANGUAGE&gt; phoneme, with columns:
> 1. target phoneme(s) — which the native English listener most likely perceives
>    it as (perceptual, **NOT** articulatory or spectral similarity); use a
>    two-rune sequence where better (nasal vowel → vowel + nasal consonant,
>    affricate → stop + fricative);
> 2. confidence (high / medium / low);
> 3. a **real, openable citation** — author(s), year, title, venue, and a DOI or
>    URL I can click.
>
> Rules: cite only sources you have actually found and can link; if you cannot
> find a source for a phoneme, write "no source — reasoned" instead of inventing
> one; and explicitly flag any phoneme where acoustic and perceptual similarity
> disagree.

Then **open every cited link yourself** to confirm it exists and says what's
claimed, keep only the mappings you can corroborate, and mark the rest
`CONTESTED` in a code comment (as the `fr`/`de` tables do).

### Validate

- Run `npm run dev`, type words that exercise each tricky sound, and check the
  **Native IPA** → **Rune IPA** readouts: does the rune output *sound* like the
  word said aloud?
- The strongest check: have a fluent/native speaker read the source text and
  confirm the runes match what they actually hear.
