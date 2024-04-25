const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const fs = require('fs');
const merge = require('merge-stream');

function compileSass() {
    // Compila todos os arquivos .scss na pasta src/sass, incluindo a pasta pages
    const sassStreams = gulp.src('src/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('producao/css')); // Define a pasta de saída para os arquivos CSS compilados

    // Compila cada arquivo .scss na pasta src/sass/pages e subpastas separadamente
    const pagesSassStreams = fs.readdirSync('src/sass/pages', { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => {
            const folder = entry.name;
            return gulp.src(`src/sass/pages/${folder}/*.scss`)
                .pipe(sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(cleanCSS())
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(`producao/css/pages/${folder}`));
        });

    return merge(sassStreams, ...pagesSassStreams); // Retorna a união das tarefas Sass
}

function compileJS() {
    // Compila todos os arquivos .js na pasta src/js e subpastas
    const jsStreams = gulp.src('src/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(terser())
        .pipe(gulp.dest('producao/js')); // Define a pasta de saída para os arquivos JavaScript compilados

    // Compila cada arquivo .js na pasta src/js/pages e subpastas separadamente
    const pagesJsStreams = fs.readdirSync('src/js/pages', { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => {
            const folder = entry.name;
            return gulp.src(`src/js/pages/${folder}/*.js`)
                .pipe(babel({
                    presets: ['@babel/preset-env']
                }))
                .pipe(terser())
                .pipe(gulp.dest(`producao/js/pages/${folder}`));
        });

    return merge(jsStreams, ...pagesJsStreams); // Retorna a união das tarefas JavaScript
}

function watch() {
    // Observa alterações nos arquivos .scss na pasta src/sass e subpastas
    gulp.watch('src/sass/**/*.scss', compileSass);
    // Observa alterações nos arquivos .js na pasta src/js e subpastas
    gulp.watch('src/js/**/*.js', compileJS);
}

// Tarefa padrão que compila Sass, JavaScript e inicia o modo de observação
gulp.task('default', gulp.series(gulp.parallel(compileSass, compileJS), watch));
