var gulp = require ('gulp'),
    concat = require ('gulp-concat'),
    rename = require ('gulp-rename'),
    uglify = require ('gulp-uglify'),
    babel = require ('gulp-babel');;

var sourceFiles = 'public/javascripts/angular/**/*.js',
    destinationFiles = 'public/javascripts/dist';

gulp.task ('scripts', function () {
    return gulp.src (sourceFiles)
        .pipe (concat ('upgraded-chainsaw.js'))
        .pipe (gulp.dest (destinationFiles))
        .pipe (rename ('upgraded-chainsaw.min.js'))
        .pipe (babel ({presets: ['es2015']}))
        .pipe (uglify({mangle: false}))
        .pipe (gulp.dest (destinationFiles));
});