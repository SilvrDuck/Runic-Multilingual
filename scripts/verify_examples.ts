/**
 * Build-time test: every reference-table example word, for every language,
 * must actually map to the rune phoneme it is listed under. Runs the real
 * pipeline (eSpeak-ng in Node → normalize → phoneme map) — no browser.
 *
 * Run: npm test
 */

import ESpeakNg from "espeak-ng";
import { normalizeNativeIPA } from "../src/phonemes/normalize";
import { mapToRuneIPA } from "../src/phonemes/map";
import { LANGUAGES } from "../src/languages";
import { TABLE_EXAMPLES } from "../src/i18n/examples";
import { REACHABLE_RUNES } from "../src/phonemes/maps.generated";

async function phonemize(text: string, voice: string): Promise<string> {
    const Module: any = {
        arguments: [
            "--phonout", "/out",
            "--sep=", "-q", "--ipa=3",
            "-v", voice,
            "-f", "/in.txt",
        ],
        print() {},
        printErr() {},
    };
    Module.preRun = [
        () => Module.FS.writeFile("/in.txt", new TextEncoder().encode(text)),
    ];
    const espeak = await ESpeakNg(Module);
    return (espeak.FS.readFile("/out", { encoding: "utf8" }) as string).trim();
}

let checks = 0;
const failures: string[] = [];

for (const lang of LANGUAGES) {
    // English examples come from runeDataset.ts (upstream); we validate the
    // examples we author for the other languages.
    if (lang.id === "en") continue;

    const examples = TABLE_EXAMPLES[lang.id] ?? {};
    for (const [rune, override] of Object.entries(examples)) {
        if (!override.examples) continue;
        const words = override.examples
            .split(",")
            .map((w) => w.trim())
            .filter(Boolean);
        for (const word of words) {
            checks++;
            const native = normalizeNativeIPA(
                await phonemize(word, lang.espeakVoice),
            );
            const runeIPA = mapToRuneIPA(native, lang.phonemeMap);
            if (!runeIPA.includes(rune)) {
                failures.push(
                    `[${lang.id}] "${word}" → /${native}/ → rune "${runeIPA}" — expected to contain "${rune}"`,
                );
            }
        }
    }
}

// Coverage: every rune a language can actually produce must have a native
// example (no gaps). Runes a language can't produce are greyed out in the
// table with an English example, so they need none.
let coverageChecks = 0;
for (const lang of LANGUAGES) {
    if (lang.id === "en") continue;
    const examples = TABLE_EXAMPLES[lang.id] ?? {};
    for (const rune of REACHABLE_RUNES[lang.id] ?? []) {
        const entry = examples[rune];
        coverageChecks++;
        if (!entry?.examples) {
            failures.push(
                `[${lang.id}] reachable rune "${rune}" has no native example (coverage gap)`,
            );
        }
        coverageChecks++;
        if (!entry?.pronunciation) {
            failures.push(
                `[${lang.id}] reachable rune "${rune}" has no localized pronunciation hint (coverage gap)`,
            );
        }
    }
}

const total = checks + coverageChecks;
if (failures.length) {
    console.error(`\n✗ ${failures.length} of ${total} checks FAILED:\n`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
} else {
    console.log(
        `\n✓ all ${total} checks passed — ${checks} examples map correctly, ` +
            `${coverageChecks} reachable runes covered.`,
    );
}
