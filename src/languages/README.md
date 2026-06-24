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
job is to map each native phoneme to the rune phoneme(s) that best survive a
**round-trip through a native reader**: the user *writes* their language in runes
and *reads it back*, so we pick the rune a **native speaker**, sounding it out,
will most reliably re-read as the original phoneme — while keeping that speaker's
own contrasts distinct, so minimal pairs stay recoverable. This is the **decode**
direction (how a French/German speaker assimilates GenAm sounds into their own
categories), **not** "what an English listener hears". It is resolved two ways:

- **Per-language overrides** — authoritative hand tables in
  `scripts/gen_phoneme_map.py`, chosen from native-as-listener perception and
  loanword-into-the-native-language evidence. Sounds with no GenAm rune
  (`y ø œ`, nasal vowels, `ç`, `x`, `ʁ`, …), contrast-preserving choices, and any
  genuinely contested call (flagged `CONTESTED`) live here.
- **Automated fallback** — PanPhon articulatory feature-distance fills in any
  symbol *not* overridden (identical consonants, plain vowels) for free.

Both live in `scripts/gen_phoneme_map.py`, which bakes them into the frozen
lookup table `src/phonemes/maps.generated.ts` at build time (no Python or model
runs in the browser).

> **Dialect note.** The French module is **Swiss French (`fr-ch`)**: the tool's
> designer is from **Geneva**, so the map keeps their own dialect and
> preferences — *patte*≠*pâte* is preserved (Genevan keeps `/a/`–`/ɑ/`), while
> *brun*=*brin* is merged (the designer's own usage). A metropolitan `fr` could
> be added later with different overrides; `de` targets a Standard-German reader.
> See [`PHONEME-REFRAME-REPORT.md`](../../PHONEME-REFRAME-REPORT.md) for the
> per-phoneme evidence behind the current maps.

> **Variant — a native runic alphabet (`ch-fr-override`).** A second kind of
> module *reassigns* runes instead of approximating them: runes whose English
> sound never occurs in the language (`θ`/"th", the unused diphthongs) are
> redefined to stand for sounds that have no good rune (French `/y/`, the nasals,
> `/ø/`, `/ɲ/`). The reader **learns** the glyph as its native sound rather than
> sounding out the English one. See
> [Reassigning runes](#reassigning-runes--a-native-alphabet) below.

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

### 3. Add overrides (recommended)

Add an `OVERRIDES` entry for any sound where the automated fallback would not
round-trip for a native reader, and to preserve the native speaker's contrasts.
The universal `COMMON` normalizations (`ɾ→ɹ`, dark-`l`, …) apply to every
language automatically; English-only reductions live in `COMMON_EN` — don't
repeat either. A value may be a sequence (`nj`, `ɑn`) or `""` to drop a phoneme.
Flag any genuinely contested choice with a `CONTESTED` comment.

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

If the eSpeak voice id contains a hyphen (e.g. `fr-ch`), use **bracket access** —
`phonemeMap: PHONEME_MAPS["fr-ch"]` — because `PHONEME_MAPS.fr-ch` is invalid JS.
The generator quotes language keys for the same reason.

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

## Finding overrides (native-reader, decode direction)

An override answers one question: **when this language's speaker sounds out a
GenAm rune, which of their OWN phonemes do they produce?** We want the rune whose
native reading lands back on the source phoneme, and that stays distinct from the
speaker's other phonemes. That is the *decode* direction — the mirror image of
the old English-listener question. The cautionary example: English ears file
French `/y/` (*tu*) under `/u/`, but a French reader sounding out the `u` rune
produces French `/u/` (*tout*), so `y→u` would destroy *tu*/*tout*. Always ask
"what does the **native** reader recover?" — and "which of their contrasts must
survive?".

### Where the data lives

- **Cross-language / L2 perception studies — the gold standard**, in the
  **native-listener** direction: how do speakers of *this language* assimilate
  English/GenAm sounds into their own categories?
  - Frameworks: **Perceptual Assimilation Model** (PAM / PAM-L2 — Best) and the
    **Speech Learning Model** (SLM / SLM-r — Flege & Bohn).
  - Productive authors: **Catherine Best, James Flege, Ocke-Schwen Bohn,
    Winifred Strange** — plus Rochet (1995), whose /i–y–u/ result shows *which*
    native category a vowel assimilates to depends on the listener's L1 (exactly
    our decode question).
  - Search Google Scholar / *JASA* / *Journal of Phonetics* for queries like:
    - `<language> listeners perception of English vowels`
    - `L2 English perception assimilation <language> speakers`
    - `cross-language speech perception English by <language> listeners`
- **Loanword / nativization phonology — INTO the native language.** How the
  language borrows *English* words shows the habitual GenAm→native substitutions
  (the decode map, ready to invert). Search `anglicism adaptation <language>`,
  `English loanword phonology in <language>`.
- **"&lt;Language&gt; phonology" on Wikipedia** + the IPA help pages — fastest
  first pass; note the *native* realisations and the speaker's own contrasts.
- **Pronunciation / teaching guides** describing how natives pronounce English —
  informal, but fine for obvious cases.

Prefer native-listener perception data; fall back to anglicism/loanword patterns,
then teaching guides, then (last resort) reasoned acoustic analogy. Native-listener
data is thinner than English-listener data, so expect more `CONTESTED` calls —
confirm with a native speaker (below).

### Asking an LLM

An LLM is good for a first draft and for surfacing the relevant studies — but
only if you force it to **actually research and cite**. Use a model with web
search / browsing or a "deep research" mode enabled; a model answering from
memory alone **will invent plausible-looking citations**. Give it the *fixed
target inventory*, force the *native-reader round-trip* criterion, and make
verifiable citations a hard requirement:

> Goal: a NATIVE **&lt;LANGUAGE&gt;** speaker writes their language in a phonetic
> script whose only symbols are this FIXED General-American inventory, then READS
> IT BACK. For each &lt;LANGUAGE&gt; phoneme, pick the symbol(s) a native speaker,
> sounding them out, will most reliably re-read as that phoneme, AND that keep the
> speaker's own minimal pairs distinct.
> Inventory: `æ ɑ ɔ eɪ ɛ i ə ɪ aɪ ɝ oʊ ɔɪ u ʊ aʊ  b tʃ d f ɡ h dʒ k l m n ŋ p ɹ s ʃ t θ ð v w j z ʒ`
>
> **Search the current literature before answering — do not rely on memory.**
> Use the **native-listener** direction: how &lt;LANGUAGE&gt; speakers
> perceive/assimilate English sounds (PAM-L2 / SLM; Best, Flege, Bohn) and how
> the language adapts English loanwords.
>
> Return one row per &lt;LANGUAGE&gt; phoneme:
> 1. target symbol(s) the native reader recovers it as (use a two-rune sequence
>    where better — nasal vowel → vowel + nasal consonant; affricate → stop +
>    fricative; `""` to drop);
> 2. which native minimal pairs survive / collapse under that choice;
> 3. confidence (high / medium / low);
> 4. a **real, openable citation** — author(s), year, title, venue, DOI/URL.
>
> Rules: cite only sources you have actually found and can link; if you cannot
> find one, write "no source — reasoned" instead of inventing it; flag any
> phoneme whose native-reader recovery is uncertain as CONTESTED.

Then **open every cited link yourself** to confirm it exists and says what's
claimed, keep only the mappings you can corroborate, and mark the rest
`CONTESTED` in a code comment (as the `fr-ch`/`de` tables do).

### Validate

- Run `npm run dev`, type words that exercise each tricky sound (especially
  minimal pairs), and check the **Native IPA** → **Rune IPA** readouts: would a
  native reader sounding out the runes *recover the word* — and keep it distinct
  from its minimal-pair partner?
- The strongest check: have a native speaker **read the runes (or the per-language
  read-back hints) aloud** and confirm they recover the original word.

---

## Reassigning runes — a native alphabet

The default modules pick the *closest existing* rune, so the reader sounds out an
English value. A **reassigning** module (e.g. `ch-fr-override`, Swiss-French
runic) instead hands idle runes new meanings: the user **learns** that a glyph
stands for one of their own sounds. This frees the language from English
phonology — `/y/`, the nasals and `/ɲ/` get glyphs of their own — at the cost of
not being self-evident (the chart teaches it).

It needs no renderer change, but there is **one hard constraint** and a small
display layer.

### The class constraint (read this first)

A glyph's *shape is its class*: the renderer fuses exactly **one vowel + one
consonant** per rune and refuses to merge two of the same class
(`src/components/RuneSVG/tokenizer.ts`). So you must reassign **vowel→vowel
glyph** and **consonant→consonant glyph**. Putting a vowel (`/y/`) on a consonant
glyph (`θ`) would stop `tu` fusing into one rune. The natural home for French
`/ɲ/` is therefore the freed *consonant* `θ`; `/y/` takes a freed *vowel* glyph.

### Choosing donor glyphs

A glyph is a free donor if it is **not** in the base module's `REACHABLE_RUNES`
**and** its bitmask is unique. Some glyphs share a mask and would render
identically (e.g. `ɔ` has `ɑ`'s mask) — check `src/runeDataset.ts` and skip
those. Among the valid donors, pick the **closest phonetic fit** (Swiss-French
chose `ɔ̃→ɔɪ`, `ɑ̃→aʊ`, `ɛ̃→aɪ`, `y→ʊ`, `ø→ɪ`, `ɲ→θ`).

### The three edits

1. **`scripts/gen_phoneme_map.py`** — add an `INVENTORY`/`OVERRIDES` entry. You
   can derive from a base module: `ch-fr-override` reuses `fr-ch`'s inventory and
   spreads its overrides, then reassigns the handful of keys to donor glyphs
   (`"ɔ̃": "ɔɪ"`, `"ɲ": "θ"`, …). Regenerate; the donors now appear in
   `REACHABLE_RUNES`, so their cards light up automatically.
2. **`src/i18n/runeDisplay.ts`** — add a `RUNE_DISPLAY[lang]` entry mapping each
   rune-IPA symbol to the symbol you want *shown* (e.g. `ʊ→"y"`, `θ→"ɲ"`). This
   relabels both the reference chart and the live **Rune IPA** box; the drawn
   glyph and the underlying rune-IPA are unchanged.
3. **`src/i18n/examples.ts` + `strings.ts`** — as for any language, but the
   example words must be ones eSpeak **actually emits the source symbol for**.
   eSpeak is inconsistent: French `/ɲ/` surfaces for `-gne` words (*montagne*,
   *ligne*) but comes out as `nj` for *agneau*/*oignon*. Probe with the app's
   **Native IPA** box before listing a word.

### Why loanwords stay safe

A donor glyph is **output-only** — produced solely by its assigned native key
(`ɔ̃→ɔɪ`), and the map has no `ɔɪ` *key*. So an English loanword ("Toy Story",
which eSpeak even voices in English as `tɔɪ …`) cannot land on the "on" rune: the
`ɔɪ` has no key, `ɔ→ɑ` and the `ɪ` drops. The alphabet stays unambiguous on
read-back.
