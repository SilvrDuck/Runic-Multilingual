import { render } from "preact";
import { RunicEditor } from "components/RunicEditor";

import { RuneReferenceTable } from "components/RuneReference";
import { consonantDataTable, vowelDataTable } from "./runeDataset";
import { RunicPlayground } from "components/RunicPlayground";
import { Testimonials } from "components/Testimonials";
import { LanguageSelector } from "components/LanguageSelector";
import { NativeModeBanner } from "components/NativeModeBanner";
import { setupPageLocalization } from "./i18n";
import { addGoldenPathListener } from "./holyCross";

function setup() {
    // Localize the static page copy + keep it in sync with language changes.
    setupPageLocalization();

    // Global language selector (drives translation + UI language)
    render(
        <LanguageSelector />,
        document.querySelector(".language-selector-container"),
    );

    // Override-mode banner (only shows for rune-reassigning "native" modules)
    render(
        <NativeModeBanner />,
        document.querySelector(".native-mode-banner-container"),
    );

    // Runic Translator
    render(
        <RunicEditor></RunicEditor>,
        document.querySelector(".runic-editor-container"),
    );

    // Vowel Table
    render(
        <RuneReferenceTable table={vowelDataTable}></RuneReferenceTable>,
        document.querySelector("#rune-vowel-table"),
    );

    // Consonant Table
    render(
        <RuneReferenceTable table={consonantDataTable}></RuneReferenceTable>,
        document.querySelector("#rune-consonant-table"),
    );

    // Runic Playground
    render(
        <RunicPlayground />,
        document.querySelector(".runic-playground-container"),
    );

    // Testimonials Section
    render(<Testimonials />, document.querySelector(".testimonials-container"));

    addGoldenPathListener();
}
setup();
