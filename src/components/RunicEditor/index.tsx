import "./index.css";

import { h, Component, VNode } from "preact";
import { RuneSVG } from "components/RuneSVG";
import { translate, warmUp } from "src/ipa";
import { t, languageStore, relabelRuneIPA } from "src/i18n";
import { RangeInput } from "components/RangeInput";
import {
    downloadURI,
    drawSVGToCanvas,
    svgToImageBlob,
    svgToUri,
} from "./utils";
import {
    CenterAlignIcon,
    CopyIcon,
    DownloadIcon,
    LeftAlignIcon,
    RightAlignIcon,
    ShareIcon,
} from "components/icons";
import { ChipSelect } from "components/ChipSelect";
import { ColorInput } from "components/ColorInput";
import { TOKEN_WIDTH } from "components/RuneSVG/rune";
import { TextInput } from "components/TextInput";

interface Props {}

interface State {
    loading: boolean;
}

/**
 * Get all interactive settings for the Runic Editor.
 */
function getSettings(obj: RunicEditor): VNode {
    const AlignmentSelect = (
        <ChipSelect
            chipData={[
                {
                    value: "left",
                    label: <LeftAlignIcon width="1.25em" height="1.25em" />,
                },
                {
                    value: "center",
                    label: <CenterAlignIcon width="1.25em" height="1.25em" />,
                },
                {
                    value: "right",
                    label: <RightAlignIcon width="1.25em" height="1.25em" />,
                },
            ]}
            onChange={obj.onAlignmentChange}
        />
    );
    const PhonemeSelect = (
        <ChipSelect
            chipData={[
                { value: "false", label: t("hidePhonemes") },
                { value: "true", label: t("showPhonemes") },
            ]}
            onChange={obj.onPhonemeDisplayChange}
        />
    );
    const TransparencySelect = (
        <ChipSelect
            chipData={[
                { value: "true", label: t("transparentBg") },
                { value: "false", label: t("opaqueBg") },
            ]}
            onChange={obj.onTransparentBackgroundSelect}
        />
    );
    return (
        <div className="runic-editor__settings-container">
            <RangeInput
                label={t("thickness")}
                min={0.05}
                max={0.5}
                step={0.01}
                default={0.25}
                bindInput={obj.onThicknessChange}
            ></RangeInput>
            <RangeInput
                label={t("glow")}
                min={0}
                max={20}
                step={0.5}
                default={0}
                bindInput={obj.onSpreadChange}
            ></RangeInput>
            <RangeInput
                label={t("lineHeight")}
                min={-TOKEN_WIDTH}
                max={TOKEN_WIDTH}
                step={0.5}
                default={TOKEN_WIDTH / 2}
                bindInput={obj.onLineSpacingChange}
            ></RangeInput>
            {AlignmentSelect}
            {PhonemeSelect}
            <ColorInput
                defaultColor="crimson"
                bindInput={obj.onRuneColorChange}
                label={t("runeColor")}
            />
            <ColorInput
                defaultColor="black"
                bindInput={obj.onBackgroundChange}
                label={t("background")}
            />
            {TransparencySelect}
            <div className="runic-editor__download-group">
                <button
                    className="runic-editor__download-button"
                    onClick={() => obj.download("svg")}
                >
                    <DownloadIcon /> SVG
                </button>
                <button
                    className="runic-editor__download-button"
                    onClick={() => obj.download("png")}
                >
                    <DownloadIcon /> PNG
                </button>
                <button
                    className="runic-editor__download-button"
                    onClick={() => obj.download("jpeg")}
                >
                    <DownloadIcon /> JPEG
                </button>
            </div>
            <div className="runic-editor__download-group">
                <button
                    className="runic-editor__download-button"
                    onClick={() => obj.copyAsPNG()}
                >
                    <CopyIcon /> {t("copy")}
                </button>
                <button
                    className="runic-editor__download-button"
                    onClick={() => obj.sharePNG()}
                >
                    <ShareIcon /> {t("share")}
                </button>
            </div>
        </div>
    );
}

const TRANSLATE_DEBOUNCE_MS = 250;

// Initial language comes from the shared store (which reads localStorage).
const INITIAL_LANG_ID = languageStore.get();
const initialSourceText = languageStore.getLanguage().sampleText;
// For English we can show the readouts WITHOUT booting the engine (instant
// first paint). For a remembered non-English choice we leave them blank and
// translate on mount.
const initialNativeIPA =
    INITIAL_LANG_ID === "en" ? "tunɪk\nsikɹət lɛdʒənd!" : "";
const initialRuneIPA = INITIAL_LANG_ID === "en" ? "tunɪk\nsikɹət ɫɛdʒənd!" : "";

export class RunicEditor extends Component<Props, State> {
    runeSVGElement?: RuneSVG;
    svgContainer?: HTMLElement;
    sourceInput?: TextInput;
    nativeInput?: TextInput;
    runeInput?: TextInput;

    state: State = {
        loading: false,
    };

    private debounceTimer?: number;
    // Guards against out-of-order async results clobbering newer ones.
    private requestToken = 0;
    private unsubscribe?: () => void;

    componentDidMount(): void {
        // React to the global language selector: re-render localized labels and
        // re-translate the current source text in the newly-selected language.
        this.unsubscribe = languageStore.subscribe(() => {
            this.forceUpdate();
            this.scheduleTranslate();
        });
        // If a non-English language was remembered, the readouts are blank —
        // translate the sample text now (this is what boots the engine).
        if (languageStore.get() !== "en") {
            this.scheduleTranslate();
        }
    }

    componentWillUnmount(): void {
        this.unsubscribe?.();
    }

    // --- Translation pipeline

    private scheduleTranslate = () => {
        if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
        this.debounceTimer = window.setTimeout(
            this.runTranslate,
            TRANSLATE_DEBOUNCE_MS,
        );
    };

    private runTranslate = async () => {
        const text = this.sourceInput?.textareaElement?.value ?? "";
        const language = languageStore.getLanguage();
        const token = ++this.requestToken;

        this.setState({ loading: true });
        try {
            const { nativeIPA, runeIPA } = await translate(text, language);
            // Ignore stale results from an earlier keystroke / language.
            if (token !== this.requestToken) return;
            this.nativeInput?.setText(nativeIPA);
            // The box shows the language's own symbols (e.g. ɲ, ɛ̃) for modules
            // that reassign runes; the renderer always gets the real rune-IPA.
            this.runeInput?.setText(relabelRuneIPA(runeIPA, language.id));
            this.runeSVGElement?.setPhoneticText(runeIPA);
        } catch (e) {
            console.error("Translation failed:", e);
        } finally {
            if (token === this.requestToken) this.setState({ loading: false });
        }
    };

    // Listeners

    onSourceChange = (_text: string) => {
        this.scheduleTranslate();
    };

    onSpreadChange = (spread: number) => {
        this.runeSVGElement.setState({ shadowSpread: spread });
    };

    onThicknessChange = (thickness: number) => {
        this.runeSVGElement.setState({ runeThickness: thickness });
    };

    onLineSpacingChange = (lineSpacing: number) => {
        this.runeSVGElement.setState({ lineSpacing: lineSpacing });
    };

    onAlignmentChange = (align: "left" | "center" | "right") => {
        this.runeSVGElement.setState({ align: align });
    };

    onPhonemeDisplayChange = (display: "false" | "true") => {
        this.runeSVGElement.setState({ displayPhonemes: display === "true" });
    };

    onRuneColorChange = (color: string) => {
        this.runeSVGElement.setState({ runeColor: color });
    };

    onBackgroundChange = (color: string) => {
        this.runeSVGElement.setState({ backgroundColor: color });
        this.svgContainer.style.setProperty("background-color", color);
    };

    onTransparentBackgroundSelect = (enableTransparency: string) => {
        const shouldEnable = enableTransparency == "true";
        this.runeSVGElement.setState({ transparentBackground: shouldEnable });
        this.svgContainer.style.setProperty(
            "background-image",
            shouldEnable ? "" : "none",
        );
    };

    copyAsPNG = async () => {
        this.usePreparedSVG(async (svgElement: SVGElement) => {
            const blob = await svgToImageBlob(svgElement);

            await navigator.clipboard.write?.([
                new ClipboardItem({
                    "image/png": blob,
                }),
            ]);
        });
    };

    sharePNG = async () => {
        this.usePreparedSVG(async (svgElement: SVGElement) => {
            const blob = await svgToImageBlob(svgElement);

            const file = new File([blob], "rune.png", {
                lastModified: Date.now(),
                type: "image/png",
            });

            const shareData: ShareData = {
                files: [file],
            };

            if (navigator.canShare?.(shareData)) {
                navigator.share(shareData);
            }
        });
    };

    usePreparedSVG = (callback: (svgElement: SVGElement) => void) => {
        const svgElement = this.runeSVGElement.svgElement;

        // Add background color (only if transparentBackground is disabled)
        if (!this.runeSVGElement.state.transparentBackground) {
            const backgroundColor = this.runeSVGElement.state.backgroundColor;
            svgElement.style.setProperty("background-color", backgroundColor);
        }

        callback(svgElement);

        // Remove background color
        svgElement.style.removeProperty("background-color");
    };

    // Miscellaneous

    download = async (format: "svg" | "png" | "jpeg") => {
        this.usePreparedSVG(async (svgElement: SVGElement) => {
            const filename = "rune";
            if (format === "svg") {
                const uri = svgToUri(svgElement);
                downloadURI(uri, `${filename}.svg`);
            } else {
                // Draw the svg with styles to canvas, then download
                const canvas = await drawSVGToCanvas(svgElement);
                const uri = canvas.toDataURL(`image/${format}`);
                downloadURI(uri, `${filename}.${format}`);
            }
        });
    };

    render() {
        const language = languageStore.getLanguage();
        return (
            <div className="runic-editor">
                {this.state.loading && (
                    <div className="runic-editor__status">
                        {t("translating")}
                    </div>
                )}
                <div className="runic-editor__input-area">
                    <TextInput
                        ref={(e) => (this.sourceInput = e)}
                        label={`${t("input")} (${language.label})`}
                        placeholder={language.sampleText}
                        name="text-input--source"
                        bindInput={this.onSourceChange}
                        onFocus={warmUp}
                        value={initialSourceText}
                    />
                    <span className="runic-editor__input-divider">&nbsp;</span>
                    <TextInput
                        ref={(e) => (this.nativeInput = e)}
                        label={t("nativeIpa")}
                        name="text-input--native"
                        readOnly
                        bindInput={() => {}}
                        value={initialNativeIPA}
                        spellcheck={false}
                    />
                    <span className="runic-editor__input-divider">&nbsp;</span>
                    <TextInput
                        ref={(e) => (this.runeInput = e)}
                        label={t("runeIpa")}
                        name="text-input--rune"
                        readOnly
                        bindInput={() => {}}
                        value={initialRuneIPA}
                        spellcheck={false}
                    />
                </div>
                <div className="runic-editor__preview">
                    <div
                        className="runic-editor__svg-container"
                        ref={(e) => (this.svgContainer = e)}
                    >
                        <RuneSVG
                            ref={(e) => (this.runeSVGElement = e)}
                            interactive={false}
                            displayPhonemes={false}
                            phoneticText={initialRuneIPA}
                        ></RuneSVG>
                    </div>
                    <hr />
                    <details open>
                        <summary>{t("settings")}</summary>
                        {getSettings(this)}
                    </details>
                </div>
            </div>
        );
    }
}
