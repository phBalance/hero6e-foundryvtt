import gulp from "gulp";
import gulpAutoPrefix from "gulp-autoprefixer";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import gulpStylelint from "gulp-stylelint-esm";
import stylelint from "stylelint";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const sass = gulpSass(dartSass);

const SASS_FILES = ["scss/**/*.scss"];
const SASS_ENTRY = "scss/herosystem6e.scss";
const JAVASCRIPT_FILES = ["**/*.js", "**/*.mjs", "!node_modules/**"];
const MARKDOWN_FILES = ["**/*.md", "!node_modules/**"];

/* ----------------------------------------- */
/*  Source Code Standard Validation
/* ----------------------------------------- */

// oxlint and oxfmt are native CLIs rather than gulp plugins, so they are spawned as
// child processes instead of being piped into. They are invoked through Node
// (rather than the node_modules/.bin shim) so that the task works regardless of
// whether the working tree sits on a UNC/mapped path, which cmd.exe refuses to use
// as a working directory.
function resolveBin(pkg, name) {
    return path.join(path.dirname(require.resolve(`${pkg}/package.json`)), "bin", name);
}

const oxlintBin = resolveBin("oxlint", "oxlint");
const oxfmtBin = resolveBin("oxfmt", "oxfmt");

// Run a native CLI, label its timing line, and resolve with the exit code.
// The CLI prints "Finished in ..." with no owner named. The native binding owns that
// string, so rewrite it here. Print a labelled line when the CLI prints none.
function spawnTool(name, binPath, args) {
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [binPath, ...args], { stdio: ["ignore", "pipe", "pipe"] });
        let labelled = false;
        const labelLine = (line) => {
            if (!line.startsWith("Finished in ")) {
                return line;
            }
            labelled = true;
            return line.replace(/^Finished in /, `${name} finished in `);
        };
        const forward = (source, sink) => {
            let rest = "";
            source.setEncoding("utf8");
            source.on("data", (chunk) => {
                rest += chunk;
                const lines = rest.split("\n");
                rest = lines.pop() ?? "";
                for (const line of lines) {
                    sink.write(`${labelLine(line)}\n`);
                }
            });
            source.on("end", () => {
                if (rest !== "") {
                    sink.write(`${labelLine(rest)}\n`);
                    rest = "";
                }
            });
        };
        forward(child.stdout, process.stdout);
        forward(child.stderr, process.stderr);
        child.on("error", reject);
        child.on("close", (code) => {
            if (!labelled) {
                console.log(`${name} finished in ${Date.now() - startedAt}ms.`);
            }
            resolve(code ?? 1);
        });
    });
}

function spawnOxlint(args) {
    return spawnTool("oxlint", oxlintBin, args);
}

function spawnOxfmt(args) {
    return spawnTool("oxfmt", oxfmtBin, args);
}

// Reject with a clean message when a CLI reports a failure.
// `showStack = false` stops gulp-cli from printing a stack trace. The CLI already
// printed every finding, so the trace adds noise. The task still fails with exit 1.
function runTool(name, fixScript, run) {
    return run.then((code) => {
        if (code === 0) {
            return;
        }
        const err = new Error(
            `${name} reported problems (exit code ${code}). Run \`npm run ${fixScript}\` to correct them.`,
        );
        err.showStack = false;
        throw err;
    });
}

function runOxlint(args) {
    return runTool("oxlint", "lint:fix", spawnOxlint(args));
}

function runOxfmt(args) {
    return runTool("oxfmt", "format:fix", spawnOxfmt(args));
}

function validateJavaScriptFilesByLint() {
    return runOxlint(["."]);
}

function validateScssFilesByLint() {
    return gulp.src(SASS_FILES).pipe(
        gulpStylelint({
            failAfterError: true,
            fix: false,
            reporters: [{ formatter: "string", console: true }],
        }),
    );
}
const lint = gulp.parallel(validateJavaScriptFilesByLint, validateScssFilesByLint);

function autoFixJavaScriptFilesByLint() {
    // `--fix-suggestions` is required because some oxlint corrections (for example
    // no-extra-boolean-cast) are published as suggestions rather than fixes.
    return runOxlint([".", "--fix", "--fix-suggestions"]);
}

function autoFixScssFilesByLint() {
    return gulp.src(SASS_FILES).pipe(
        gulpStylelint({
            fix: true,
            failAfterError: true,
            reporters: [{ formatter: "string", console: true }],
        }),
    );
}
const lintAutoFix = gulp.parallel(autoFixJavaScriptFilesByLint, autoFixScssFilesByLint);

// oxfmt picks the files itself. It honours .gitignore and the ignorePatterns in
// .oxfmtrc.json, so this task passes no globs.
// `format` only reports. `formatAutoFix` rewrites the files. This mirrors `lint` and `lintAutoFix`.
function validateFilesByFormat() {
    return runOxfmt([".", "--check"]);
}
const format = gulp.series(validateFilesByFormat);

function autoFixFilesByFormat() {
    return runOxfmt(["."]);
}
const formatAutoFix = gulp.series(autoFixFilesByFormat);

const validate = gulp.parallel(validateJavaScriptFilesByLint, validateScssFilesByLint, validateFilesByFormat);
const autoFix = gulp.series(autoFixJavaScriptFilesByLint, autoFixScssFilesByLint, autoFixFilesByFormat);

/* ----------------------------------------- */
/*  Advisory (non-fatal) checks for build and watch
/* ----------------------------------------- */

// Report oxlint findings and return the exit code instead of rejecting.
function reportJavaScriptByLint() {
    return spawnOxlint(["."]);
}

// Report stylelint findings. The gulp plugin re-throws after it calls done(error).
// That throw becomes an unhandled rejection and kills Node, so call the API direct.
async function reportScssFilesByLint() {
    const result = await stylelint.lint({ files: SASS_FILES, fix: false, formatter: "string" });
    if (result.report) {
        console.warn(result.report);
    }
    return result.errored;
}

// Report formatting findings and return whether any file needs formatting.
function reportFilesByFormat() {
    return spawnOxfmt([".", "--check"]).then((code) => code !== 0);
}

// Print every lint finding, then continue regardless of the result.
async function reportLintChecks() {
    let jsExitCode = 1;
    let scssErrored = true;
    try {
        [jsExitCode, scssErrored] = await Promise.all([reportJavaScriptByLint(), reportScssFilesByLint()]);
    } catch (err) {
        console.error(`Lint could not run: ${err?.message ?? err}`);
    }
    if (jsExitCode === 0 && !scssErrored) {
        console.warn("Lint found no problems.");
        return;
    }
    console.warn("Lint reported problems above. The build continues. Run `npm run lint:fix` to correct them.");
}

// Print every validation finding, then keep the watch loop alive.
async function reportValidationChecks() {
    let jsExitCode = 1;
    let scssErrored = true;
    let formatNeedsWork = true;
    try {
        [jsExitCode, scssErrored, formatNeedsWork] = await Promise.all([
            reportJavaScriptByLint(),
            reportScssFilesByLint(),
            reportFilesByFormat(),
        ]);
    } catch (err) {
        console.error(`Validation could not run: ${err?.message ?? err}`);
    }
    if (jsExitCode === 0 && !scssErrored && !formatNeedsWork) {
        console.warn("Validation found no problems.");
        return;
    }
    console.warn("Validation reported problems above. The watch loop continues.");
}

const lintWithoutFailing = gulp.series(reportLintChecks);
const validateWithoutFailing = gulp.series(reportValidationChecks);

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
    console.error(err.toString());
    this.emit("end");
}

function compileSass() {
    // Configure options for sass output. For example, "expanded" or "nested"
    let options = {
        style: "expanded",
    };
    return gulp
        .src(SASS_ENTRY)
        .pipe(sass.sync(options).on("error", handleError))
        .pipe(
            gulpAutoPrefix({
                cascade: false,
            }),
        )
        .pipe(gulp.dest("./css"));
}
const css = gulp.series(compileSass);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
    gulp.watch(SASS_FILES, css);
    // glob-watcher sets ignoreInitial: true, so to false so the first scan emits events.
    // The longer delay lets the whole scan finish before one batched run starts.
    gulp.watch(
        [...JAVASCRIPT_FILES, ...SASS_FILES, ...MARKDOWN_FILES],
        { ignoreInitial: false, delay: 1000 },
        validateWithoutFailing,
    );
}

/* ----------------------------------------- */
/*  Default Task
/* ----------------------------------------- */

const defaultGulpTask = gulp.series(compileSass, watchUpdates);

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

export {
    defaultGulpTask as default,
    css,
    lint,
    format,
    validate,
    autoFix,
    lintAutoFix,
    formatAutoFix,
    lintWithoutFailing,
    validateWithoutFailing,
};
