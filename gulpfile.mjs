import gulp from "gulp";
import gulpAutoPrefix from "gulp-autoprefixer";
import gulpPrettier from "gulp-prettier";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import gulpStylelint from "gulp-stylelint-esm";
import gulpPlumber from "gulp-plumber";
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
    gulp.watch([...JAVASCRIPT_FILES, ...SASS_FILES, ...MARKDOWN_FILES], validate);
}

/* ----------------------------------------- */
/*  Default Task
/* ----------------------------------------- */

const defaultGulpTask = gulp.series(compileSass, watchUpdates);

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

export { defaultGulpTask as default, css, lint, prettier, validate, autoFix, lintAutoFix, prettierAutoFix };
