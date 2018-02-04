'use strict';

const pjson = require('./package.json');
const dirs = pjson.config.directories;

const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const replace = require('gulp-replace');
const fileinclude = require('gulp-file-include');
const del = require('del');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const cheerio = require('gulp-cheerio');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const base64 = require('gulp-base64');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const pug = require('gulp-pug');
const spritesmith = require('gulp.spritesmith');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

// Компиляция препроцессора
gulp.task('less', function(){
  return gulp.src(dirs.source + '/less/style.less')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer({ browsers: ['last 2 version'] }),
      mqpacker({ sort: true }),
    ]))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(dirs.build + '/css/'))
    .pipe(browserSync.stream())
    .pipe(rename('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(dirs.build + '/css/'));
});

// Сборка HTML
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
    }))
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest(dirs.build));
});

gulp.task('pug', function() {
  return gulp.src(dirs.source + '/**/*.pug')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(pug())
    .pipe(gulp.dest(dirs.build));
});

// ЗАДАЧА: Копирование изображений
gulp.task('img', function () {
  return gulp.src([
      dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',
    ],
    {since: gulp.lastRun('img')}
  )
    .pipe(plumber({ errorHandler: onError }))
    .pipe(newer(dirs.build + '/img'))
    .pipe(gulp.dest(dirs.build + '/img'));
});

// Оптимизация изображений (ВРУЧНУЮ)
gulp.task('img:opt', function () {
  return gulp.src([
    dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',
    '!' + dirs.source + '/img/sprite-svg.svg',
  ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 7}),
      imagemin.svgo({plugins: [{removeViewBox: false}]})
    ]))
    .pipe(gulp.dest(dirs.source + '/img'));
});

// ЗАДАЧА: Сборка SVG-спрайта
gulp.task('svgstore', function (callback) {
  let spritePath = dirs.source + '/img/svg-sprite';
  if(fileExist(spritePath) !== false) {
    return gulp.src(spritePath + '/*.svg')
    // .pipe(plumber({ errorHandler: onError }))
      .pipe(svgmin(function (file) {
        return {
          plugins: [{
            cleanupIDs: {
              minify: true
            }
          }]
        }
      }))
      .pipe(svgstore({ inlineSvg: true }))
      .pipe(cheerio(function ($) {
        $('svg').attr('style',  'display:none');
      }))
      .pipe(rename('sprite-svg.svg'))
      .pipe(gulp.dest(dirs.source + '/img'));
  }
  else {
    console.log('Нет файлов для сборки SVG-спрайта');
    callback();
  }
});

// Cшивка PNG-спрайта
gulp.task('png:sprite', function () {
  let fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png';
  let spriteData = gulp.src('src/img/png-sprite/*.png')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(spritesmith({
      imgName: fileName,
      cssName: 'sprite.less',
      cssFormat: 'less',
      padding: 4,
      imgPath: '../img/' + fileName
    }));
  let imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'));
  let cssStream = spriteData.css
    .pipe(gulp.dest(dirs.source + '/less/'));
  return merge(imgStream, cssStream);
});

// Очистка папки сборки
gulp.task('clean', function () {
  return del([
    dirs.build + '/**/*',
    '!' + dirs.build + '/readme.md'
  ]);
});

// Конкатенация и углификация Javascript
gulp.task('js', function () {
  return gulp.src([
    dirs.source + '/js/vendor/jquery-3.3.1.min.js',
    dirs.source + '/js/vendor/jquery-migrate-3.0.0.min.js',
    dirs.source + '/js/vendor/*.js',
    dirs.source + '/js/assets/*.js'
  ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dirs.build + '/js'));
});

//Копирование шрифтов

gulp.task('fonts', function () {
  return gulp.src([
    dirs.source + '/fonts/*.woff',
    dirs.source + '/fonts/*.woff2'
  ])
    .pipe(gulp.dest(dirs.build + '/fonts'));
});


// Кодирование в base64 шрифта в формате WOFF
gulp.task('css:fonts:woff', function (callback) {
  let fontCssPath = dirs.source + '/fonts/font_opensans_woff.css';
  if(fileExist(fontCssPath) !== false) {
    return gulp.src(fontCssPath)
      .pipe(plumber({ errorHandler: onError }))
      .pipe(base64({
        // baseDir: '/',
        extensions: ['woff'],
        maxImageSize: 1024*1024,
        deleteAfterEncoding: false,
        // debug: true
      }))
      .pipe(gulp.dest(dirs.build + '/css'));
  }
  else {
    console.log('Файла WOFF, из которого генерируется CSS с base64-кодированным шрифтом, нет');
    console.log('Отсутствующий файл: ' + fontCssPath);
    callback();
  }
});

// Кодирование в base64 шрифта в формате WOFF2
gulp.task('css:fonts:woff2', function (callback) {
  let fontCssPath = dirs.source + '/fonts/font_opensans_woff2.css';
  if(fileExist(fontCssPath) !== false) {
    return gulp.src(fontCssPath)
      .pipe(plumber({ errorHandler: onError }))
      .pipe(base64({
        // baseDir: '/',
        extensions: ['woff2'],
        maxImageSize: 1024*1024,
        deleteAfterEncoding: false,
        // debug: true
      }))
      .pipe(replace('application/octet-stream;', 'application/font-woff2;'))
      .pipe(gulp.dest(dirs.build + '/css'));
  }
  else {
    console.log('Файла WOFF2, из которого генерируется CSS с base64-кодированным шрифтом, нет');
    console.log('Отсутствующий файл: ' + fontCssPath);
    callback();
  }
});

// Сборка
gulp.task('build', gulp.series(
  'clean',
  'svgstore',
  'png:sprite',
  gulp.parallel('less', 'img', 'js', 'fonts'),
  'pug',
  'html'
));

// Локальный сервер, слежение
gulp.task('serve', gulp.series('build', function() {

  browserSync.init({
    //server: dirs.build,
    server: {
      baseDir: "./build/"
    },
    port: 3000,
    startPath: '/index.html',
    // open: false
  });

  gulp.watch(
    [
      dirs.source + '/*.html',
      dirs.source + '/_include/*.html',
    ],
    gulp.series('html', reloader)
  );

  gulp.watch(
    dirs.source + '/pug/**/*.pug',
    gulp.series('pug', reloader)
  );

  gulp.watch(
    dirs.source + '/less/**/*.less',
    gulp.series('less')
  );

  gulp.watch(
    dirs.source + '/img/svg-sprite/*.svg',
    gulp.series('svgstore', 'html', 'pug', reloader)
  );

  gulp.watch(
    dirs.source + '/img/png-sprite/*.png',
    gulp.series('png:sprite', 'less')
  );

  gulp.watch(
    dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',
    gulp.series('img', reloader)
  );

  gulp.watch(
    dirs.source + '/js/*.js',
    gulp.series('js', reloader)
  );

}));

// Задача по умолчанию
gulp.task('default',
  gulp.series('serve')
);

// Дополнительная функция для перезагрузки в браузере
function reloader(done) {
  browserSync.reload();
  done();
}

// Проверка существования файла/папки
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}

var onError = function(err) {
  notify.onError({
    title: "Error in " + err.plugin,
  })(err);
  this.emit('end');
};
