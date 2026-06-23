import "./index.css";

import { h, Component } from "preact";
import { LANGUAGES } from "src/languages";
import { languageStore, t } from "src/i18n";

interface Props {}
interface State {}

/**
 * The single, global language control. Drives both the translation source
 * language and the UI language via languageStore — every island re-renders
 * when it changes (no page reload).
 */
export class LanguageSelector extends Component<Props, State> {
    private unsubscribe?: () => void;

    componentDidMount() {
        // Re-render the label if the language changes from elsewhere.
        this.unsubscribe = languageStore.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe?.();
    }

    onChange = (event: Event) => {
        languageStore.set((event.currentTarget as HTMLSelectElement).value);
    };

    render() {
        return (
            <div className="language-selector">
                <label
                    className="language-selector__label"
                    htmlFor="global-language-select"
                    title={t("language")}
                    aria-label={t("language")}
                >
                    🌐
                </label>
                <select
                    id="global-language-select"
                    className="language-selector__select"
                    value={languageStore.get()}
                    onChange={this.onChange}
                >
                    {LANGUAGES.map((lang) => (
                        <option value={lang.id}>{lang.label}</option>
                    ))}
                </select>
            </div>
        );
    }
}
