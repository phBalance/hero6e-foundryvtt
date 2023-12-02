// const gulp = require("gulp")
// const prefix = require("gulp-autoprefixer")
// const sass = require("gulp-sass")(require("sass"))
// const gulpEslintNew = require("gulp-eslint-new")

import gulp from "gulp"
import prefix from "gulp-autoprefixer"
import gulpSass from "gulp-sass"
import * as dartSass from "sass"
import gulpEslintNew from "gulp-eslint-new"
const sass = gulpSass(dartSass)

/* ----------------------------------------- */
/*  Lint
/* ----------------------------------------- */

function validateFilesForLint() {
  return gulp.src(["**/*.js","!node_modules/**"])
    .pipe(gulpEslintNew({ overrideConfigFile: "./.eslintrc.json" }))
    .pipe(gulpEslintNew.formatEach("compact", process.stderr))
    .pipe(gulpEslintNew.failAfterError())
}

const lint = gulp.series(validateFilesForLint)

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.error(err.toString())
  this.emit("end")
}

const SYSTEM_SCSS = ["scss/**/*.scss"]
function compileScss() {
  // Configure options for sass output. For example, "expanded" or "nested"
  let options = {
    outputStyle: "expanded"
  }
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass
        .sync(options)
        .on("error", handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileScss)

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css)
}

/* ----------------------------------------- */
/*  Default Task
/* ----------------------------------------- */

const defaultGulpTask = gulp.series(
  gulp.parallel(compileScss),
  watchUpdates
)

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

export {
  defaultGulpTask as default,
  css,
  lint,
}
