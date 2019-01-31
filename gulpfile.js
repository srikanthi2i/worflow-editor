var gulp = require('gulp'),
    browserSync = require('browser-sync');

gulp.task('default', function () {
   var files = [
      'index.html',
      'styles.css',
      'index.js'
   ];

   browserSync.init(files, {
      server: './public',
      ui: {
        port: 8080
      }
   });
});