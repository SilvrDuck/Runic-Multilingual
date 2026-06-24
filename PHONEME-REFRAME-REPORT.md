# Phoneme-Mapping Reframe — Comprehensive Change Report (French + German)

**Status:** proposal only — no code changed. Produced from 8 decode-direction phoneme
research passes (web-cited) + 1 architecture pass + direct eSpeak-ng probes.

---

## 0. The reframe in one paragraph

The tool's user is a **native speaker** of the source language who **writes** their
language in Tunic runes and **reads the runes back**. Success is therefore
**round-trip fidelity through a native reader**:

> native word → runes → (a native speaker sounds the runes out) → recovers the word.

Each native phoneme **F** must map to the rune phoneme(s) **G** such that a native
speaker, sounding out **G**, most reliably reproduces **F**, *and* such that **F**
stays **distinct** from the speaker's other phonemes (so minimal pairs remain
recoverable). This is the **decode direction** — how a *French/German* listener
assimilates English/GenAm sounds — which is the **opposite** of the project's
current design premise ("what does an *English* listener hear?", README lines
121-131). This single flip changes the evidence base, inverts the role of the
automated PanPhon base, and re-decides ~20 mappings.

### Two structural consequences
1. **Evidence flips.** Authoritative data is now *native-as-listener* perception
   (L2 perception / PAM-L2 with French/German listeners) and *anglicism adaptation
   into* French/German — not English-listener assimilation.
2. **Contrast-preservation is the prime directive**, because it is literally what
   "read it back" requires: if `tu` and `tout` map to the same runes, the reader
   cannot recover which word was written. When the GenAm inventory *cannot* hold a
   native contrast (no rune for `y ø œ ç x ʁ`, nasal vowels, or length), the rule
   becomes **"pick the merger that loses the fewest real words."**

---

## 1. Evidence base & honesty notes

- Method: one research agent per phoneme cluster, instructed to use the decode
  direction, prioritise (1) native-listener L2 perception, (2) loanword adaptation
  into the native language, (3) acoustic/articulatory closeness, (4) functional
  load — and to cite only **real, retrieved URLs**, marking everything else
  "reasoned — no source".
- **Caveat the README already predicts:** native-as-listener data is *thinner* in
  the literature than English-listener data, so several calls rest on loanword
  evidence + acoustics + reasoning and are flagged **CONTESTED**. The strongest
  transferable result is **Rochet (1995)**: which way a front-rounded/ambiguous
  vowel is categorised is set by the *listener's L1*, so the rune we pick is
  effectively choosing which native boundary to lean on.
- The single most-cited anchor for the German vowels is the Strange et al.
  German-vowel assimilation set (e.g. German /oː/→AE /oʊ/ at 98%; /aː/→/ɑː/ 87%).
- Every recommendation below carries a **confidence** and, where relevant,
  **CONTESTED** with the fallback.

---

## 2. FRENCH — summary table

`a→æ` and the nasal `ɛ̃→æn` are the headline new ideas; `y→ju` is the boldest.
"keep" = no change from current `maps.generated.ts`.

| eSpeak | example | current | **proposed** | conf. | note |
|---|---|---|---|---|---|
| `a` (short) | patte, Paris, chat | `ɑ` | **`æ`** | HIGH | English /æ/↔French /a/ is the standard loanword pair; frees the back rune |
| `aː` (long) | pâte, mâle, âge | *dropped* | **`ɑ`** | MED | needs `ː` kept in normalize; only worth it to keep patte/pâte (Hexagonal-merged → could fold to `æ`) |
| `e` | été, blé, nez | `eɪ` | **`eɪ`** (keep) | HIGH | French monophthongises English /eɪ/→/e/; using `ɛ` would kill les/lait |
| `ɛ` | mère, lait | `ɛ` | **`ɛ`** (keep) | HIGH | anchor that lets é/è survive |
| `o` | eau, beau, mot | `oʊ` | **`oʊ`** (keep) | HIGH | forced: only way to keep saut/sotte (o vs ɔ) given ɑ=ɔ rune |
| `ɔ` | sotte, port | `ɑ` | **`ɑ`** (keep) | MED-HIGH | the ɑ/ɔ rune; contrast carried by o→oʊ |
| `i u ə` | si, ou, le | identity | **keep** | HIGH | round-trip cleanly |
| `y` | tu, rue, lune | `u` | **`ju`** (seq) | MED · CONTESTED | current `y→u` **merges tu/tout** — worst bug; `ju` keeps i/y/u apart; fallback `i` |
| `ø` | peu, deux, ceux | `oʊ` | **`ə`** | MED | `oʊ` **merges ceux/sceau**; ø≈French schwa, low-load merge |
| `œ` | peur, sœur, cœur | `ə` | **`ɝ`** | MED · CONTESTED | NURSE vowel = the "-eur" set; separates œ from schwa; residual-r on jeune |
| `ɛ̃` | vin, pain, brin | `ɛn` | **`æn`** | MED-HIGH | real Paris realisation is [æ̃]; frees the `ɛ` rune |
| `ɑ̃` | blanc, temps, dans | `ɑn` | **`ɑn`** (keep) | HIGH | symbol, acoustics, reader-instinct all agree |
| `ɔ̃` | bon, pont, constitution | `oʊn` | **`oʊn`** (keep) | HIGH | recent change correct; [õ] high-rounded; avoids ɑ/ɔ-glyph clash with banc |
| `œ̃` | un, brun, parfum | `ən` | **`æn`** (merge) | dialect | metropolitan: merge into ɛ̃ (honest to the live merger); Quebec/contrast: keep `ən` |
| nasal C | — | `n` | **`n`** always | HIGH | never `ŋ` (reads as English "-ng"); keep the consonant (it's the nasality cue) |
| `ʁ` onset | rue, Paris | `ɹ` | **`ɹ`** (keep) | HIGH | only rhotic consonant available |
| `ʁ` coda | sœur, part, jour | `ɹ` | **rhotic-vowel runes** (`ɝ`/`ɑɹ`/`ɔɹ`/`ʊɹ`/`ɛɹ`/`ɪɹ`) | MED · CONTESTED | better matches French weak/vocalic coda r; **needs `postMap` hook** |
| `ɲ` | agneau, montagne | `nj` | **`nj`** (keep) | HIGH | matches modern French [nj] realisation |
| `ɾ` | (tap allophone) | `ɹ` | **`ɹ`** (keep) | HIGH | same as ʁ |
| `ð θ h` | (loanword leakage) | mixed | **`ð→z`, `θ→s`, `h→∅`** | MED | defensive guard; French has none of these; eSpeak shouldn't emit them for native words |
| `b d f ɡ k l m n p s t v z ʃ ʒ j w ŋ tʃ dʒ` | — | identity | **keep** | HIGH | native or loanword, all round-trip |

**French contrasts preserved under this scheme:** tu/tout (ju/u), rue/roue,
dis/du (i/ju), ceux/sceau (ə/oʊ), peur/peu (ɝ/ə), les/lait (eɪ/ɛ),
saut/sotte & paume/pomme (oʊ/ɑ), patte/pâte (æ/ɑ, if `ː` kept), vin/vent (æn/ɑn),
bon/banc (oʊn/ɑn). **Deliberately merged (low/zero load):** ø/ə (je/jeu),
brin/brun (already merged in metropolitan speech).

---

## 3. GERMAN — summary table

Contains the one outright **bug** (long-a vowel silently dropped). German front
rounded vowels are *high* functional load (unlike several French ones), so they
fight harder for distinct runes.

| eSpeak | example | current | **proposed** | conf. | note |
|---|---|---|---|---|---|
| `a` (short) | Stadt, Mann, Apfel | `ɑ` | **`æ`** | MED-HIGH · CONTESTED | height match; needed to free `ɑ`. Risk: English-trained reader may read æ as /ɛ/ — **user-test this one** |
| `ɑ` (long) | Staat, Bahn, Tag, Jahr | **DROPPED (bug)** | **`ɑ`** | HIGH | **P0 fix.** Currently Staat→"ʃtt", Bahn→"bn", Tag→"tk" — vowel vanishes |
| `e` | See, Weg, Leben | `eɪ` | **`eɪ`** (keep) | MED-HIGH | /eː/→/eɪ/ 85% + anglicism (Homepage→[…peːtʃ]); preserves Beet/Bett |
| `ɛ` | Bett, denn | `ɛ` | **`ɛ`** (keep) | HIGH | |
| `o` | Boot, Sohn, rot | `oʊ` | **`oʊ`** (keep) | HIGH | /oː/→/oʊ/ 98% — strongest mapping in the data; preserves Ofen/offen |
| `ɔ` | Stock, kommen, offen | `ɑ` | **`ɑ`** (keep) | MED-HIGH | the ɑ/ɔ rune; contrast carried by o→oʊ |
| `i u ʊ ɪ ə` | — | identity | **keep** | HIGH | |
| `y` (long ü) | über, Tür, kühl | `u` | **`ju`** (seq) | MED · CONTESTED | `u` **merges Tür/Tour**; ü is tongue-front; fallback `i` |
| `ʏ` (short ü) | Glück, fünf, Müller | `ʊ` | **`ɪ`** | MED-LOW · CONTESTED | move to front lane (consistent with ü); fallback keep `ʊ` |
| `ø` (long ö) | schön, Öl, böse | `oʊ` | **`ɝ`** | MED-HIGH | `oʊ` **merges schön/schon** — highest-payoff vowel fix; NURSE vowel is the taught anchor |
| `œ` (short ö) | können, Köln, zwölf | `ə` | **`ɝ`** | MED-HIGH | `ə` mislabels a *stressed* vowel; `ɛ` would merge können/kennen |
| `ɜ` (-er) | Vater, Mutter, besser | `ə` | **`ə`** (keep) | HIGH | German -er is non-rhotic [ɐ]. **Do NOT use `ɝ`/rhotic runes** — that injects an American r |
| `ɐ` | (a-schwa) | `ə` | **`ə`** (keep) | HIGH | |
| `ɔø` (eu/äu) | neu, Häuser, Deutsch | `ɔɪ` | **`ɔɪ`** (keep) | HIGH | German [ɔʏ]≈English "oy"; rounding diff sub-phonemic |
| `aɪ aʊ` | mein; Haus | identity | **keep** | HIGH | |
| `ç` (ich-laut) | ich, nicht, Milch, -chen | `ʃ` | **`ʃ`** (keep) | MED · **CONTESTED FORK** | `ʃ` is pronounceable + an attested native variant (Kiezdeutsch), but **merges Kirche/Kirsche**. `h` preserves that pair but yields German-illegal codas. See §5 |
| `x` (ach-laut) | Bach, Buch, Nacht, Loch | `k` | **`h`** | HIGH | `k` changes manner (stop) **and merges Bach/Backe, Loch/Lock**; `h` keeps fricative manner + the contrast |
| `ʁ`/`r` onset | rot, Brot, hören | `ɹ` | **`ɹ`** (keep) | HIGH | only rhotic; German has one /r/ phoneme |
| `pf` | Pferd, Apfel, Kopf | `pf` | **`pf`** (keep) | HIGH | verified: survives as adjacent p+f (ZWJ stripped) |
| `ts` | Zeit, Katze, Salz | `ts` | **`ts`** (keep) | HIGH | verified: survives as adjacent t+s |
| `tʃ` | Deutsch, Tschüss | `tʃ` | **`tʃ`** (keep) | HIGH | |
| `b d f ɡ h j k l m n ŋ p s t v z ʃ` | — | identity | **keep** | HIGH | final devoicing already applied upstream by eSpeak |
| `ʒ dʒ` | Genie; Dschungel | identity | **keep (verify emission)** | MED | marginal loan phonemes; not defined in eSpeak ph_german |

**German contrasts preserved:** Stadt/Staat (æ/ɑ, after bug fix), Beet/Bett (eɪ/ɛ),
Ofen/offen & Sohn/Sonne (oʊ/ɑ), Tür/Tour (ju/u), schön/schon (ɝ/oʊ),
Bach/Backe (h/k), neu/nau (ɔɪ/aʊ). **Irreducible casualties:** Höhle/Hölle
(/øː/–/œ/ both →ɝ, no length feature), Kirche/Kirsche (if ç→ʃ), /aː/–/ɔ/ share the
ɑ/ɔ rune (negligible load).

---

## 4. Cross-cutting linguistic decisions (apply to both languages)

1. **The `ɑ`/`ɔ` rune is one glyph** (`runeDataset.ts:33,39`, identical mask). Any
   scheme must treat them as a single back-vowel target. This is *why* `o→oʊ` and
   `e→eɪ` (diphthongs) are mandatory, not stylistic: they're the only way to keep
   the mid vowels off the merged back rune.
2. **Monophthong→diphthong is fine here.** French/German /e/,/o/ are monophthongs;
   GenAm has only `eɪ`/`oʊ`. Loanword adaptation shows natives *monophthongise*
   these back to /e/,/o/, so the round-trip recovers the right vowel.
3. **`y → ju` (sequence)** is the boldest call, made identically for both languages
   and flagged CONTESTED (no direct decode source; reasoned from acoustics +
   Rochet + the fact that natives keep i/y/u three-way distinct). If you reject
   sequences, the single-rune fallback is **`i`** (trades a /y∼u/ merge for a
   gentler /y∼i/ merge). Do **not** keep `y→u` — it is the highest-load merger in
   either language.
4. **`ɝ` is a real, reachable single rune** (its own mask, not a combo) and is the
   workhorse of the reframe: French `œ`, German `ø`+`œ`. But it must **not** be used
   for German **-er**, which is non-rhotic.
5. **Nasal vowels = oral-vowel + `n`** (French). Keep the `n` (it's the nasality
   cue and matches French spelling instinct); never `ŋ`.
6. **Dialect forks** the user must pick:
   - **patte/pâte** (French `aː`) and **un/brin** (French `œ̃`): preserve
     (Quebec/Belgian/careful) vs merge (metropolitan).
   - These are the only places the French scheme is dialect-dependent.

---

## 5. The one genuine design fork: German `ç`

No inventory choice is clean, because GenAm has `ʃ` but no `ç` and no second
palatal slot:

- **`ç → ʃ` (recommended default):** pronounceable, and `ç`→[ʃ] is a *real,
  intelligible* native German variant (ich→"isch", Kiezdeutsch/Rhenish). **Cost:**
  merges the genuine /ç/–/ʃ/ pair Kirche/Kirsche (low functional load).
- **`ç → h`:** the only option that keeps Kirche≠Kirsche. **Cost:** produces
  [h] in coda (ich→"ih", nicht→"niht"), which is **phonotactically impossible in
  German**, degrading the much larger -ich/-icht/-ilch set.

Recommendation: **`ʃ`** (optimise the common case + pronounceability), but this is
a real values choice — surface it to the user. (`x→h` is *not* contested in the
same way; `k` is clearly wrong for the decode direction.)

---

## 6. Architecture changes

The current architecture (flat `Record<string,string>` per language, global
normalize, English-only read-back hints) supports *some* of the reframe and blocks
the rest. Findings with `file:line`:

### Needed for the reframe
1. **Per-language read-back hints** — *high value, low-med effort.* The "Syllables"
   read-back (`RunicPlayground/index.tsx:66-83`) and `RuneReference`
   (`index.tsx:38`) use the **English** `SymbolData.english`/`pronunciation` fields
   (`runeDataset.ts:1-7`). A French user who writes *château* and reads "sh-a-t-oh"
   gets an English sounding-out of their own word — directly against the reframe.
   **Fix:** new `src/phonemes/readback.ts` = `Record<langId, Partial<Record<ipaSymbol,string>>>`,
   `getReadback(sym, langId)` falling back to `english`; thread a `lang` prop into
   the two components. Keep it *out* of `runeDataset.ts` (geometry stays separate
   from presentation). This is the **most user-visible** part of the reframe.
2. **Language-aware `normalize`** — *high value, low effort.* `normalizeNativeIPA`
   (`normalize.ts:8,10-25`) is global and strips length `ː`. French needs `ː` kept
   (patte/pâte); English doesn't. **Fix:** `normalizeNativeIPA(raw, language)`, move
   the suprasegmental set into the language module. One call site (`ipa.ts:25`).
   *(Per the earlier suprasegmental analysis: `ː` is the only suprasegmental worth
   keeping, and only where quality doesn't already carry the contrast.)*
3. **`LanguageModule` optional fields + a `postMap` hook** — *high value, med
   effort.* The map is **context-free**, so it cannot do onset-vs-coda `ʁ`
   (`maps.generated.ts` `ʁ→ɹ` is unconditional) — needed for the French coda-`ʁ`
   → rhotic-vowel-rune idea, and to normalise eSpeak's inconsistent coda-r
   (`Pferd`→`pfeɾt` emits a tap that `ɾ→ɹ` would make rhotic). **Fix:** add
   optional `postMap?(runeIPA): string` (a small ordered rule list) to
   `LanguageModule`, applied after `mapToRuneIPA`. Keeps "add a language = one
   entry + one generated map" intact.
4. **Re-scope `COMMON` and the PanPhon base** — *med value, med effort.* `COMMON`
   (`gen_phoneme_map.py:68-77`) applies **GenAm-English reductions** (`ʌ→ə`,
   `ᵻ→ɪ`, `ɐ→ə`) to *every* language including the native-reader maps, where
   `ʌ→ə` has no business. And `nearest()`/`TARGETS_SINGLE`
   (`gen_phoneme_map.py:25-40`) excludes all diphthongs, affricates, and the five
   rhotic combos, so the "automated" half only ever finds single monophthongs/
   consonants — every interesting mapping is already hand-coded in `OVERRIDES`.
   Under the reframe, PanPhon's articulatory-distance-to-English objective is the
   *wrong* objective; **demote PanPhon to a fallback, make `COMMON` opt-in per
   language, and treat the per-language override tables as the source of truth.**
5. **Decide the rhotic-vowel runes' fate** — *med value, med-high effort.*
   `ɑɹ ɪɹ ɛɹ ɔɹ ʊɹ` are bespoke vowel-region glyphs (`runeDataset.ts:18,67,81,144,151`)
   that the GenAm-merge philosophy never targets; **`ɔɹ` and `ʊɹ` share an
   identical mask** (last-wins reverse lookup → lossy). They're exactly what
   French/German coda-`ʁ` wants (#3). Either route to them via `postMap`, fix the
   `ɔɹ/ʊɹ` mask collision, or drop them. Note: with `a→æ` the *accidental*
   `-ar→ɑɹ` trigger disappears.

### Optional improvements (surfaced, not required)
6. **Foreign-phoneme guards** (French `ð→z`, `θ→s`, `h→∅`) — cheap defensive layer
   for loanword/proper-noun leakage; eSpeak's `fr_rules` never emits these for
   native words, so impact is small but the guard is free.
7. **Delete `public/ipa_dict.json`** — 3 MB, **zero references** anywhere
   (verified); dead pre-eSpeak asset shipped to users.
8. **CI guard:** regenerate `maps.generated.ts` and `git diff --exit-code` — the
   Python/PanPhon generator is out-of-band; nothing prevents the checked-in
   artifact drifting from the overrides.
9. **Service worker** (`service-worker.ts:17`): bump `CACHE_NAME` when the bundled
   map changes; old caches are never pruned on `activate`.
10. **"English is just a module" is a half-truth** — the UI hardcodes English IPA
    and skips engine boot for `en` (`RunicEditor/index.tsx:182-184`,
    `index.tsx:205`). Generalise (precompute per-language initial readouts) or
    document the special case.

### Already sufficient — don't touch
- **Multi-rune sequence output** already works (`ɲ→nj`, `ɑ̃→ɑn`).
- **The two tokenizers' longest-match** are structurally aligned (different
  alphabets by design); `pf`/`ts` render correctly as two runes.
- **Unquoted-lang-key `maps.generated.ts`** is consumed only via TS import — fine.
- **The `@` English-mode escape** (`tokenizer.ts:49-52`) is an orthogonal editor
  feature; no pipeline conflict.

### README rewrite
`src/languages/README.md` lines 121-196 ("Finding perceptual overrides") are
written around the **English-listener** premise and the LLM research prompt targets
English-listener assimilation. Rewrite the guiding principle to the round-trip /
native-reader criterion, and flip the research prompt to *native-as-listener*
assimilation + loanword-into-native evidence.

---

## 7. Validation plan

1. **Round-trip minimal-pair tests** (scriptable, no native speaker needed for a
   first pass): render the pair lists in §2/§3 and assert each pair yields
   *distinct* rune-IPA. This catches accidental merges mechanically.
2. **Native-speaker check** (README's strongest test): a French and a German
   speaker read the rune IPA / "Syllables" read-back aloud and confirm recovery.
   Priority items to put in front of them: German **short-a→æ** (the one genuinely
   split call), **`y→ju`** (both langs), French **`ɛ̃→æn`**, German **`ç→ʃ`** fork.
3. **Confirm `ʒ`/`dʒ` emission** for German loanwords (Genie, Dschungel) — cosmetic.
4. **Re-run the eSpeak probes** after any normalize change to confirm no regression
   in en/de/fr (the earlier probe showed keeping `ː` is a no-op outside French).

---

## 8. Open decisions for the user

| # | Decision | Options | Default rec |
|---|---|---|---|
| D1 | French dialect | Hexagonal (merge patte/pâte, un/brin) vs Quebec/careful (preserve) | ask; metropolitan is the safer default |
| D2 | `y` representation | `ju` sequence (preserves i/y/u) vs single-rune `i` (gentler merge) vs leave `u` | `ju` |
| D3 | German `ç` | `ʃ` (pronounceable, merges Kirche/Kirsche) vs `h` (preserves pair, bad codas) | `ʃ` |
| D4 | German short-a | `æ` (height) vs `ɑ` (assimilation-to-/ɛ/ risk) — **user-test** | `æ`, then test |
| D5 | Coda-`ʁ` | simple `ʁ→ɹ` everywhere vs `postMap` → rhotic-vowel runes | start simple, add postMap later |
| D6 | Architecture depth | minimal (optional fields + postMap + readback) vs rule-pipeline refactor | minimal first |

---

## 9. Prioritised change list ("the changes to do")

**P0 — bug (do regardless of the reframe)**
- German `ɑ → ɑ` (add the missing key): stops every long-a word losing its vowel.

**P1 — high-confidence reframe wins**
- German `x → h` (was `k`): fixes Bach/Backe, restores fricative manner.
- German `ø → ɝ`, `œ → ɝ` (were `oʊ`/`ə`): fixes schön/schon, stressed readability.
- German `a → æ` (was `ɑ`) — pairs with the P0 fix to give Stadt/Staat.
- French `a → æ` (was `ɑ`) + keep `ː` in normalize → `aː → ɑ` (patte/pâte).
- French `ɛ̃ → æn` (was `ɛn`); confirm `ɔ̃ → oʊn`, `ɑ̃ → ɑn`.
- French `ø → ə`, `œ → ɝ` (were `oʊ`/`ə`).

**P2 — bold / contested (decide via D1-D5, ideally native-tested)**
- French & German `y → ju` (was `u`); German `ʏ → ɪ` (was `ʊ`).
- French `œ̃` and German `ç` per D1/D3.
- French coda-`ʁ` → rhotic-vowel runes via `postMap` (D5).
- Per-language read-back hints (the most visible reframe payoff).

**P3 — architecture & hygiene**
- Language-aware `normalize`; `LanguageModule` optional fields + `postMap`.
- Demote PanPhon to fallback; make `COMMON` opt-in; expand reachable targets.
- French foreign-phoneme guards (`ð→z`, `θ→s`, `h→∅`).
- README guiding-principle rewrite.
- Delete `ipa_dict.json`; CI regen guard; SW cache-name bump; English-UME honesty.

---

## Appendix — leftover temp probe scripts to delete
Created during research (the environment blocked `rm`): `.len_check.mjs`,
`.cov_check.mjs`, `.probe.mjs` (plus pre-existing `.verify-tmp.mjs`,
`_espeak_node_check.mjs`). Safe to remove.
