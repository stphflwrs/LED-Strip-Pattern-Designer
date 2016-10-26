const gulp = require('gulp'),
      browserSync = require('browser-sync'),
      fs = require('fs'),
      nodemon = require('gulp-nodemon');

gulp.task('default', ['browser-sync'], () => {});

gulp.task('browser-sync', ['nodemon'], () => {
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
