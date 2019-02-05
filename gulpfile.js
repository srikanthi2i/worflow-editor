var gulp = require('gulp');
var browserSync = require('browser-sync');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('default', function () {
   var files = [
      'index.html',
      'styles.css',
      'index.js'
   ];

   browserSync.init(files, {
      server: './dist',
      ui: {
        port: 8080
      }
   });
});

// Gulp task to minify CSS files
gulp.task('styles', function () {
   return gulp.src('./src/**/*.css')
     .pipe(csso())
     .pipe(gulp.dest('./dist'))
 });

 // Gulp task to minify JavaScript files
 gulp.task('scripts', function() {
   gulp.src('./src/**/*.js')
     .pipe(concat('all.js'))
     .pipe(uglify())
     .pipe(gulp.dest('./dist/'))
 });

gulp.task('build', gulp.series('scripts', 'styles', function (done) {
   done();
}));



