import "./index.css";

import { RuneSVG } from "components/RuneSVG";
import { h, Component, VNode } from "preact";
import { SymbolData } from "src/runeDataset";
import {
    languageStore,
    exampleOverride,
    isRuneReachable,
    isReassignedRune,
    runeDisplaySymbol,
    t,
} from "src/i18n";

interface Props {
    table: SymbolData[];
}

interface State {}

function copySymbol(symbol: SymbolData) {
    navigator.clipboard.writeText(symbol.ipaSymbol);
}

function runeReferenceGridItem(symbol: SymbolData): VNode<any> {
    // A rune the current language can produce shows that language's native
    // example (verified by the build-time test). A rune it can't produce is
    // greyed out and shows the English example as a "roughly sounds like"
    // reference. English shows its own defaults for everything.
    const reachable = isRuneReachable(symbol.ipaSymbol);
    const override = reachable ? exampleOverride(symbol.ipaSymbol) : undefined;
    // Localized hints are prefixed with "~" to flag them as an in-language
    // approximation of the (English) rune sound. English / greyed cards keep
    // the canonical English hint, unprefixed.
    const pronunciation = override?.pronunciation
        ? `~${override.pronunciation}`
        : symbol.pronunciation;
    const examples = override?.examples ?? symbol.examples;
    const muted = languageStore.get() !== "en" && !reachable;
    // Native modes reassign some runes to a new sound; flag the originals with
    // the default symbol + its first English example word.
    const reassigned = isReassignedRune(symbol.ipaSymbol, languageStore.get());
    const originalExample = symbol.examples.split(",")[0]?.trim() ?? "";

    return (
        <div className="rune-reference-grid-item">
            <div
                className={"rune-card" + (muted ? " rune-card--muted" : "")}
                onClick={() => copySymbol(symbol)}
                title={`Click to copy '${symbol.ipaSymbol}'`}
            >
                <div className="svg-container">
                    <RuneSVG
                        displayPhonemes={false}
                        interactive={false}
                        phoneticText={symbol.ipaSymbol}
                        runeThickness={0.3}
                        runeColor=""
                        runeGuideColor=""
                    ></RuneSVG>
                </div>
                <div className="rune-info">
                    <span class="rune-info__symbol">
                        {runeDisplaySymbol(symbol.ipaSymbol, languageStore.get())}
                    </span>
                    <span class="rune-info__english">
                        {pronunciation}
                        <br />
                        {examples}
                    </span>
                </div>
                {reassigned && (
                    <span class="rune-card__replaces">
                        {t("replacesRune")} {symbol.ipaSymbol} ({originalExample})
                    </span>
                )}
            </div>
        </div>
    );
}

export class RuneReferenceTable extends Component<Props, State> {
    private unsubscribe?: () => void;

    componentDidMount() {
        // Re-render localized examples when the global language changes.
        this.unsubscribe = languageStore.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe?.();
    }

    render(props: Props) {
        // Hide greyed-out cards whose rune shape is already covered by a
        // reachable card with the same mask — avoids showing two identical-
        // looking runes where one is lit and one is grey.
        const reachableMasks = new Set(
            props.table
                .filter((s) => isRuneReachable(s.ipaSymbol))
                .map((s) => s.mask),
        );
        const visible = props.table.filter(
            (s) => isRuneReachable(s.ipaSymbol) || !reachableMasks.has(s.mask),
        );

        return (
            <>
                {languageStore.get() !== "en" && (
                    <p class="rune-reference-notice">{t("approxNotice")}</p>
                )}
                <div class="rune-reference-grid">
                    {...visible.map(runeReferenceGridItem)}
                </div>
            </>
        );
    }
}
