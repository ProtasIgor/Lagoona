'use strict';

const { src, dest, watch, series, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

const clean = require('gulp-clean');
const include = require('gulp-include');

const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');

const svgsprite = require('gulp-svg-sprite');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();

const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');

function Images() {
    return src(['app/images/src/*', '!app/images/src/*.svg'])
        .pipe(newer('app/images'))
        .pipe(avif({ quality: 50 }))

        .pipe(src('app/images/src/*'))
        .pipe(newer('app/images'))
        .pipe(webp())

        .pipe(src('app/images/src/*'))
        .pipe(newer('app/images'))
        .pipe(imagemin())

        .pipe(dest('app/images'))
        .pipe(browserSync.stream())
}

function Styles() {
    return src('app/scss/main.scss')
        .pipe(concat('style.min.css'))
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function Scripts() {
    return src('app/js/src/*.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function Sprite() {
    return src(['app/images/*.svg', '!app/images/sprite.svg'])
        .pipe(svgsprite({
            mode: {
                stack: {
                    dest: 'info-svg',
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images'))
}

function Font() {
    return src('app/fonts/src/*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'));
}

function IncludePages() {
    return src('app/index.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function Watching() {
    watch('app/scss/*.scss', Styles)
    watch('app/js/src/*.js', Scripts)
    watch('app/images/src/*', Images)
    watch('app/components/*', IncludePages)
    watch('app/index.html').on('change', browserSync.reload);
}

function BrowserSync() {
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    });
}

function Clean() {
    return src(['dist/*', '!dist'])
        .pipe(clean())
}

function Build() {
    return src([
        'app/css/*',
        'app/js/main.min.js',
        'app/images/*',
        '!app/images/info-svg',
        '!app/images/*.svg',
        'app/images/sprite.svg',
        'app/fonts/*',
        'app/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'))
}

exports.style = Styles;
exports.script = Scripts;
exports.image = Images;
exports.font = Font;
exports.sprite = Sprite;
exports.include = IncludePages;
exports.clear = Clean;
exports.watching = Watching;
exports.test = parallel(Watching, BrowserSync);
exports.build = series(Clean, Build);
exports.default = series(Clean, Build, Watching, BrowserSync);