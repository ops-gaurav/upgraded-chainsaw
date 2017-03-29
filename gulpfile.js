var gulp = require ('gulp'),
	nodemon = require ('gulp-nodemon'),
	livereload = require ('gulp-livereload');
/**
* Real time server with auto update and reloading
*/
gulp.task ('server', () => {
	gulp.task ('server', () => {
		// the gulp will watch over all the js files and realod 
		// the app as soon as the changes are detected in the system
		livereload.listen ();
		nodemon ({
			script: './bin/start',
			ext: 'js'
		}).on ('restart', () => {
			gulp.src ('.`/src/server.js')
				.pipe (livereload());
		});
	});
});