let gulp = require('gulp');
let clean = require('gulp-clean');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
let rollup = require('rollup-stream');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');

let ROLLUP_CONFIG = {
    entry: './src/index.js',
    sourceMap: true,
    format: 'umd',
    moduleName: 'reduxOptimisticThunk',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let ROLLUP_CONFIG_MODULE = {
    entry: './src/index.js',
    format: 'es',
    useStrict: false,
    plugins: [
        require('rollup-plugin-babel')()
    ]
};

let UGLIFY_OPTIONS = {
    mangle: true
};

gulp.task(
    'clean',
    () => gulp.src(['dist'], {read: false}).pipe(clean())
);

gulp.task(
    'development',
    ['clean'],
    () => {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('./dist'));
    }
);

gulp.task(
    'production',
    ['development'],
    () => {
        process.env.NODE_ENV = 'production';

        return rollup(ROLLUP_CONFIG)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify(UGLIFY_OPTIONS))
            .pipe(rename({suffix: '.min'}))
            .pipe(sourcemaps.write('./map'))
            .pipe(gulp.dest('./dist'));
    }
);

gulp.task(
    'module',
    ['clean'],
    () => {
        process.env.NODE_ENV = 'development';

        return rollup(ROLLUP_CONFIG_MODULE)
            .pipe(source('index.js', './src/*'))
            .pipe(buffer())
            .pipe(rename({suffix: '.es'}))
            .pipe(gulp.dest('./dist'));
    }
);

gulp.task('default', ['production', 'module']);
