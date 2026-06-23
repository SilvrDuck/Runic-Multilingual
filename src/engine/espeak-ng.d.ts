declare module "espeak-ng" {
    /**
     * eSpeak-ng compiled to WASM via Emscripten (MODULARIZE + EXPORT_ES6).
     * Calling the factory boots the engine and runs the CLI `main` once with
     * the provided `arguments`. Output is read back from the in-memory FS.
     */
    const ESpeakNg: (moduleOverrides?: Record<string, unknown>) => Promise<any>;
    export default ESpeakNg;
}
