const gulp = require('gulp')
const prefix = require('gulp-autoprefixer')
const sass = require('gulp-sass')(require('sass'))
const gulpEslintNew = require('gulp-eslint-new')

/* ----------------------------------------- */
/*  Lint
/* ----------------------------------------- */

function validateFilesForLint() {
  return gulp.src(['**/*.js','!node_modules/**'])
    .pipe(gulpEslintNew({ configFile: './.eslintrc.json' }))
    .pipe(gulpEslintNew.formatEach('compact', process.stderr))
    .pipe(gulpEslintNew.failAfterError())
}

const lint = gulp.series(validateFilesForLint)

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString())
  this.emit('end')
}

const SYSTEM_SCSS = ["scss/**/*.scss"]
function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: 'expanded'
  }
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass(options)
        .on('error', handleError)
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
  gulp.watch(SYSTEM_SCSS, css, validateFilesForLint)
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  compileScss,
  validateFilesForLint,
  watchUpdates
)
exports.css = css
exports.lint = lint
