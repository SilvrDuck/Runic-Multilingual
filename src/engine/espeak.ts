import ESpeakNg from "espeak-ng";

/**
 * In-browser grapheme-to-phoneme using eSpeak-ng (WASM).
 *
 * The prebuilt package does not export `callMain`, so each phonemize call
 * re-instantiates the module (cheap once the wasm bytes are cached). Input
 * text MUST be written to the FS as UTF-8 bytes — passing it through argv,
 * or as a JS string, corrupts accented characters (they get read as Latin-1).
 */

const WASM_URL = new URL("espeak-ng.wasm", document.baseURI).toString();

// Fetch the 18 MB wasm exactly once, then reuse the bytes for every call so
// we never re-download or hit the network again (service worker also caches).
let wasmBinaryPromise: Promise<ArrayBuffer> | null = null;
function getWasmBinary(): Promise<ArrayBuffer> {
    if (wasmBinaryPromise === null) {
        wasmBinaryPromise = fetch(WASM_URL).then((r) => {
            if (!r.ok) throw new Error(`Failed to load espeak-ng.wasm (${r.status})`);
            return r.arrayBuffer();
        });
    }
    return wasmBinaryPromise;
}

/** Pre-fetch the engine so the first translation isn't slowed by the download. */
export function warmUp(): void {
    void getWasmBinary();
}

/**
 * Convert text to its NATIVE IPA (raw eSpeak output, including stress/length
 * marks and ties — call `normalizeNativeIPA` before mapping).
 */
export async function phonemizeRaw(text: string, voice: string): Promise<string> {
    if (!text.trim()) return "";

    const wasmBinary = await getWasmBinary();

    const Module: Record<string, unknown> = {
        // Boot args: read UTF-8 input from /in.txt, write IPA to /out.
        arguments: [
            "--phonout", "/out",
            "--sep=",
            "-q",
            "--ipa=3",
            "-v", voice,
            "-f", "/in.txt",
        ],
        wasmBinary,
        locateFile: (path: string) => (path.endsWith(".wasm") ? WASM_URL : path),
        print: () => {},
        printErr: () => {},
    };
    Module.preRun = [
        () =>
            (Module as any).FS.writeFile(
                "/in.txt",
                new TextEncoder().encode(text),
            ),
    ];

    const espeak = await ESpeakNg(Module);
    try {
        return (espeak.FS.readFile("/out", { encoding: "utf8" }) as string).trim();
    } catch {
        return "";
    }
}
