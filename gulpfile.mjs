import gulp from "gulp";
import gulpAutoPrefix from "gulp-autoprefixer";
import gulpEslintNew from "gulp-eslint-new";
import gulpPrettier from "gulp-prettier";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import gulpStylelint from "gulp-stylelint-esm";
import gulpPlumber from "gulp-plumber";

const sass = gulpSass(dartSass);

const SASS_FILES = ["scss/**/*.scss"];
const JAVASCRIPT_FILES = ["**/*.js", "**/*.mjs", "!node_modules/**"];
const MARKDOWN_FILES = ["**/*.md", "!node_modules/**"];

/* ----------------------------------------- */
/*  Source Code Standard Validation
/* ----------------------------------------- */

const eslintDefaultConfig = { overrideConfigFile: "eslint.config.mjs" };
const eslintFixConfig = { fix: true };

function validateJavaScriptFilesByLint() {
    return gulp
        .src(JAVASCRIPT_FILES)
        .pipe(gulpEslintNew(eslintDefaultConfig))
        .pipe(gulpEslintNew.formatEach("compact", process.stderr))
        .pipe(gulpEslintNew.failAfterError());
}

function validateScssFilesByLint() {
    return gulp.src(SASS_FILES).pipe(
        gulpStylelint({
            failAfterError: true,
            reporters: [{ formatter: "string", console: true }],
        }),
    );
}
const lint = gulp.parallel(validateJavaScriptFilesByLint, validateScssFilesByLint);

function autoFixJavaScriptFilesByLint() {
    return gulp
        .src(JAVASCRIPT_FILES)
        .pipe(gulpEslintNew({ ...eslintDefaultConfig, ...eslintFixConfig }))
        .pipe(gulpEslintNew.fix())
        .pipe(gulpEslintNew.formatEach("compact", process.stderr))
        .pipe(gulpEslintNew.failAfterError());
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
        .src(SASS_FILES)
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
