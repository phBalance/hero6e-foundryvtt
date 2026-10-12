import gulp from "gulp";
import gulpAutoPrefix from "gulp-autoprefixer";
import gulpPrettier from "gulp-prettier";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import gulpStylelint from "gulp-stylelint-esm";
import gulpPlumber from "gulp-plumber";
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

// oxlint is a native CLI rather than a gulp plugin, so it is spawned as a child
// process instead of being piped into. It is invoked through Node (rather than the
// node_modules/.bin shim) so that it works regardless of whether the working tree
// sits on a UNC/mapped path, which cmd.exe refuses to use as a working directory.
const oxlintBin = path.join(path.dirname(require.resolve("oxlint/package.json")), "bin", "oxlint");

function runOxlint(args) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [oxlintBin, ...args], { stdio: "inherit" });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`oxlint exited with code ${code}`));
            }
        });
    });
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

function validateFilesByPrettier() {
    return gulp
        .src([...JAVASCRIPT_FILES, ...SASS_FILES, ...MARKDOWN_FILES])
        .pipe(gulpPlumber()) // stop plugin throwing from ending things in watch mode
        .pipe(gulpPrettier.check());
}
const prettier = gulp.series(validateFilesByPrettier);

function autoFixFilesByPrettier() {
    return gulp
        .src([...JAVASCRIPT_FILES, ...SASS_FILES, ...MARKDOWN_FILES])
        .pipe(gulpPrettier())
        .pipe(gulp.dest((file) => file.base));
}
const prettierAutoFix = gulp.series(autoFixFilesByPrettier);

const validate = gulp.parallel(validateJavaScriptFilesByLint, validateScssFilesByLint, validateFilesByPrettier);
const autoFix = gulp.series(autoFixJavaScriptFilesByLint, autoFixScssFilesByLint, autoFixFilesByPrettier);

/* ----------------------------------------- */
/*  Advisory (non-fatal) checks for build and watch
/* ----------------------------------------- */

// Report oxlint findings and return the exit code instead of rejecting.
function reportJavaScriptByLint() {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [oxlintBin, "."], { stdio: "inherit" });
        child.on("error", reject);
        child.on("close", (code) => resolve(code ?? 1));
    });
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

// Report prettier findings and return whether any file needs formatting.
// A failed check emits "error" then "close" on the last stream, and never "end".
// The data listener matters too: "end" alone does not resume the stream, and Node
// then exits with the promise unsettled.
function reportFilesByPrettier() {
    return new Promise((resolve) => {
        let settled = false;
        let reported = false;
        let needsFormatting = false;
        const finish = () => {
            if (settled) {
                return;
            }
            settled = true;
            resolve(needsFormatting);
        };
        const record = (err) => {
            needsFormatting = true;
            if (!reported) {
                reported = true;
                console.error(err.toString());
            }
            finish();
        };
        const stream = gulp
            .src([...JAVASCRIPT_FILES, ...SASS_FILES, ...MARKDOWN_FILES])
            .pipe(gulpPlumber({ errorHandler: record }))
            .pipe(gulpPrettier.check());
        stream.on("data", () => {});
        stream.on("error", record);
        stream.on("end", finish);
        stream.on("close", finish);
    });
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
    let prettierNeedsWork = true;
    try {
        [jsExitCode, scssErrored, prettierNeedsWork] = await Promise.all([
            reportJavaScriptByLint(),
            reportScssFilesByLint(),
            reportFilesByPrettier(),
        ]);
    } catch (err) {
        console.error(`Validation could not run: ${err?.message ?? err}`);
    }
    if (jsExitCode === 0 && !scssErrored && !prettierNeedsWork) {
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
    prettier,
    validate,
    autoFix,
    lintAutoFix,
    prettierAutoFix,
    lintWithoutFailing,
    validateWithoutFailing,
};
