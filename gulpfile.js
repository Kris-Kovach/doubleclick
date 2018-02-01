'use strict';

var pjson = require('./package.json');
var dirs = pjson.config.directories;
var gulp = require('gulp');
var less = require('gulp-less');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var mqpacker = require('css-mqpacker');
var replace = require('gulp-replace');
var fileinclude = require('gulp-file-include');
var del = require('del');
var browserSync = require('browser-sync').create();
var ghPages = require('gulp-gh-pages');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cheerio = require('gulp-cheerio');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var base64 = require('gulp-base64');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var cleanCSS = require('gulp-cleancss');
var pug = require('gulp-pug');
var spritesmith = require('gulp.spritesmith');
var buffer = require('vinyl-buffer');
var merge = require('merge-stream');

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
  return gulp.src(dirs.source + '/*.pug')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(dirs.build));
});

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

gulp.task('img:opt', function () {
  return gulp.src([
      dirs.source + '/img/*.{gif,png,jpg,jpeg,svg}',
      '!' + dirs.source + '/img/sprite-svg.svg',
    ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dirs.source + '/img'));
});


gulp.task('svgstore', function (callback) {
  var spritePath = dirs.source + '/img/svg-sprite';
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

gulp.task('png:sprite', function () {
  var fileName = 'sprite-' + Math.random().toString().replace(/[^0-9]/g, '') + '.png';
  var spriteData = gulp.src('src/img/png-sprite/*.png')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(spritesmith({
      imgName: fileName,
      cssName: 'sprite.less',
      cssFormat: 'less',
      padding: 4,
      imgPath: '../img/' + fileName
    }));
  var imgStream = spriteData.img
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'));
  var cssStream = spriteData.css
    .pipe(gulp.dest(dirs.source + '/less/'));
  return merge(imgStream, cssStream);
});

gulp.task('clean', function () {
  return del([
    dirs.build + '/**/*',
    '!' + dirs.build + '/readme.md'
  ]);
});

gulp.task('js', function () {
  return gulp.src([
      dirs.source + '/js/jquery.min.js',
      dirs.source + '/js/bootstrap.min.js',
      dirs.source + '/js/inputmask.min.js',
      dirs.source + '/js/ion.rangeSlider.min.js',
      dirs.source + '/js/jquery.inputmask.js',
      dirs.source + '/js/jquery.responsiveTabs.js',
      dirs.source + '/js/ofi.min.js',
      dirs.source + '/js/simple-lightbox.min.js',
      dirs.source + '/js/slick.min.js',
      dirs.source + '/js/jquery.fancybox.min.js'
    ])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dirs.build + '/js'));
});


gulp.task('css:fonts:woff', function (callback) {
  var fontCssPath = dirs.source + '/fonts/font_opensans_woff.css';
  if(fileExist(fontCssPath) !== false) {
    return gulp.src(fontCssPath)
      .pipe(plumber({ errorHandler: onError }))
      .pipe(base64({
        // baseDir: '/',
        extensions: ['woff'],
        maxImageSize: 1024*1024,
        devareAfterEncoding: false,
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

gulp.task('css:fonts:woff2', function (callback) {
  var fontCssPath = dirs.source + '/fonts/font_opensans_woff2.css';
  if(fileExist(fontCssPath) !== false) {
    return gulp.src(fontCssPath)
      .pipe(plumber({ errorHandler: onError }))
      .pipe(base64({
        // baseDir: '/',
        extensions: ['woff2'],
        maxImageSize: 1024*1024,
        devareAfterEncoding: false,
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

gulp.task('build', gulp.series(
  'clean',
  'svgstore',
  'png:sprite',
  gulp.parallel('less', 'img', 'js', 'css:fonts:woff', 'css:fonts:woff2'),
  'pug',
  'html'
));

gulp.task('serve', gulp.series('build', function() {

  browserSync.init({
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
      gulp.series('html', reloader)
    ]
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

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

gulp.task('default',
  gulp.series('serve')
);

function reloader(done) {
  browserSync.reload();
  done();
}

function fileExist(path) {
  var fs = require('fs');
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
