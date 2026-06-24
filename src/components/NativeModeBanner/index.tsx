import "./index.css";

import { h, Component } from "preact";
import { languageStore, t } from "src/i18n";

interface Props {}
interface State {}

/**
 * Top-of-page warning shown only for "native" language modules that REASSIGN
 * runes to their own sounds (LanguageModule.overridesPhonetics) — so the user
 * knows the runes no longer encode Tunic's default phonetics. Hidden for every
 * normal module. Re-renders live on language change via languageStore.
 */
export class NativeModeBanner extends Component<Props, State> {
    private unsubscribe?: () => void;

    componentDidMount() {
        this.unsubscribe = languageStore.subscribe(() => this.forceUpdate());
    }

    componentWillUnmount() {
        this.unsubscribe?.();
    }

    render() {
        if (!languageStore.getLanguage().overridesPhonetics) return null;
        return (
            <div className="native-mode-banner" role="status">
                <span className="native-mode-banner__icon" aria-hidden="true">
                    ⚠
                </span>
                <p className="native-mode-banner__text">
                    {t("nativeModeBanner")}
                </p>
            </div>
        );
    }
}
