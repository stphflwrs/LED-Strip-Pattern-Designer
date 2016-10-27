const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      fs = require('fs'),
      nodemon = require('gulp-nodemon'),
      inject = require('gulp-inject'),
      clean = require('gulp-clean'),
      bowerFiles = require('main-bower-files');

var sources = gulp.src(['public/scripts/**/*.js', 'public/styles/**/*.css'], {read: false});

gulp.task('default', ['inject', 'browser-sync', 'nodemon'], () => {});

gulp.task('inject', () => {
  gulp.src('public/index.html')
    .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
    .pipe(gulp.dest('./public'));

  gulp.src('public/index.html')
    .pipe(inject(sources, {name: 'sources', ignorePath: 'public/'}))
    .pipe(gulp.dest('./public'));
});

gulp.task('browser-sync', () => {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    middleware: [{
      route: '/bower_components',
      handle: serveStaticBowerComponents,
    }],
    files: ['app/**/*.*'],
    port: '9000',
  });
});

gulp.task('nodemon', (cb) => {
  var started = false;
  return nodemon({
    script: 'app/server.js',
  }).on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('build', () => {
  gulp.src('public/index.html')
    .pipe(inject(gulp.src(bowerFiles(), {read: false})))
    .pipe(gulp.dest('./dist'));
});

function serveStaticBowerComponents(req, res, next) {
  const filePath = `./bower_components/${req.url}`;

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(err);
      res.end('Error...');
    } else {
      res.end(content, 'utf-8');
    }
  });
}
