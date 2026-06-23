const { copy: esbuildPluginCopy } = require("esbuild-plugin-copy");
const esbuild = require("esbuild");
const {
    esbuildProblemMatcherPlugin,
} = require("./plugins/esbuildProblemMatchersPlugin");
const { injectionPlugin } = require("./plugins/injection-plugin");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

const commonBuildOptions = {
    bundle: true,
    format: "esm",
    target: "es2015",
    minify: production,
    sourcesContent: false,
    logLevel: "silent",
    alias: {
        react: "preact/compat",
    },
    // Node built-ins referenced inside espeak-ng's Emscripten glue (only in its
    // dead Node branch). Mark them external so the browser bundle builds; the
    // guarded dynamic imports never execute in the browser.
    external: ["module", "fs", "path", "url", "crypto"],
    allowOverwrite: true,
};

async function main() {
    const contexts = [];
    // Build the visualization webview code
    contexts.push(
        await esbuild.context({
            ...commonBuildOptions,
            entryPoints: ["src/index.tsx"],
            outfile: "./dist/bundle/index.js",
            plugins: [
                esbuildPluginCopy({
                    // Resolve relative to the current working directory
                    resolveFrom: "cwd",
                    assets: [
                        {
                            from: ["./public/**/*"],
                            to: ["./dist"],
                            watch: watch,
                        },
                        {
                            // The eSpeak-ng engine ships in its npm package; copy
                            // it into dist rather than committing an 18 MB binary.
                            from: [
                                "./node_modules/espeak-ng/dist/espeak-ng.wasm",
                            ],
                            to: ["./dist"],
                            watch: false,
                        },
                    ],
                }),
                /* add to the end of plugins array */
                esbuildProblemMatcherPlugin,
            ],
        }),
    );
    // Build the initial resources (JS and CSS)
    contexts.push(
        await esbuild.context({
            ...commonBuildOptions,
            entryPoints: ["src/initial-resources/index.ts"],
            outfile: "./dist/bundle/initial.js",
            plugins: [
                injectionPlugin({
                    inFile: "src/index.ejs",
                    outFile: "dist/index.html",
                }),
                /* add to the end of plugins array */
                esbuildProblemMatcherPlugin,
            ],
        }),
    );
    // Build the service worker
    contexts.push(
        await esbuild.context({
            ...commonBuildOptions,
            format: "iife",
            entryPoints: ["src/service-worker.ts"],
            outdir: "./dist",
            platform: "browser",
            plugins: [
                /* add to the end of plugins array */
                esbuildProblemMatcherPlugin,
            ],
        }),
    );

    if (watch) {
        await Promise.allSettled(contexts.map((context) => context.watch()));
        // Serve the built `dist` directory so it's viewable on localhost.
        const { port } = await contexts[0].serve({ servedir: "dist" });
        console.log(`\n  Dev server running at http://localhost:${port}\n`);
    } else {
        await Promise.allSettled(
            contexts.map((context) => context.rebuild().then(context.dispose)),
        );
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
