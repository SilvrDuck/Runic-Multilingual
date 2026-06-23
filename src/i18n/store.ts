import {
    LANGUAGES,
    DEFAULT_LANGUAGE,
    getLanguage,
    LanguageModule,
} from "../languages";

/**
 * Global current-language state, shared across the separate Preact islands
 * (the header language selector, the translator editor, the rune tables).
 * A single dropdown drives both the translation source language AND the UI
 * language. Components subscribe and re-render on change — no page reload.
 */

const STORAGE_KEY = "runic-language";

type Listener = (langId: string) => void;

function readStored(): string {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && LANGUAGES.some((l) => l.id === stored)) return stored;
    } catch {
        // localStorage unavailable — fall through to default.
    }
    return DEFAULT_LANGUAGE.id;
}

let currentId = readStored();
const listeners = new Set<Listener>();

export const languageStore = {
    get(): string {
        return currentId;
    },
    getLanguage(): LanguageModule {
        return getLanguage(currentId);
    },
    set(id: string): void {
        if (id === currentId) return;
        currentId = id;
        try {
            localStorage.setItem(STORAGE_KEY, id);
        } catch {
            // ignore
        }
        listeners.forEach((fn) => fn(id));
    },
    subscribe(fn: Listener): () => void {
        listeners.add(fn);
        return () => {
            listeners.delete(fn);
        };
    },
};
