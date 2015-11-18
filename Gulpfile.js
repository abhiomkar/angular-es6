var gulp	 		= require('gulp'),
		webpack		= require('webpack-stream'),
		path		= require('path'),
		sync		= require('run-sequence'),
		browserSync		= require('browser-sync'),
		rename		= require('gulp-rename'),
		template	= require('gulp-template'),
		fs			= require('fs'),
		yargs		= require('yargs').argv,
		lodash 		= require('lodash'),
		nodemon = require('gulp-nodemon'),
		del = require('del'),
		reload		= function () { return browserSync.reload() };

// helper method to resolveToApp paths
var resolveToApp = function(glob){
	glob = glob || '';
	return path.join(frontendRoot, 'app', glob); // app/{glob}
};

var resolveToComponents = function(glob){
	glob = glob || '';
	return path.join(frontendRoot, 'app/components', glob); // app/components/{glob}
};

var frontendRoot = 'frontend';
var serverRoot = 'server';

// map of all our paths
var paths = {
	js: resolveToComponents('**/*!(.spec.js).js'), // don't include spec files
	css: resolveToApp('**/*.css'), // css files
	images: resolveToApp('images/**/*.*'), // image files
	html: [
		resolveToApp('**/*.html'),
		path.join(frontendRoot, 'index.html')
	],

	entry: path.join(frontendRoot, 'app/main.js'),
	output: path.join(frontendRoot, '../public/dist'),
	blankTemplates: path.join(__dirname, 'generator', 'component/**/*.**')
};

// use our webpack.config.js to
// build our modules
var webbackConfig = require('./webpack.config');

gulp.task('webpack:frontend', function(){
	return gulp.src(paths.entry)
		.pipe(webpack(webbackConfig.frontend))
		.pipe(gulp.dest(paths.output));
});

gulp.task('webpack:server', function(){
	return gulp.src('./server/src/index.js')
		.pipe(webpack(webbackConfig.server))
		.pipe(gulp.dest('./server/dist/'));
});

gulp.task('browser-sync', ['nodemon-debug'], function() {
	browserSync.init({
		proxy: 'localhost:5000',
		open: false,
		port: 3003
	});
});

gulp.task('watch:frontend', function(){
	console.log('paths.images: ', paths.images);
	var allPaths = [].concat(
		[paths.js],
		paths.html,
		[paths.css],
		[paths.images]
	);

	gulp.watch(allPaths, ['webpack:frontend', reload]);
});

gulp.task('watch:server', function(){
	console.log('watching:server', path.join(__dirname, 'server/src/**/*.js'));
	gulp.watch(['./server/src/**/*.js', './server/views/**/*.html', './server/src/**/*.json'], ['webpack:server', reload]);
});

gulp.task('component', function(){
	var cap = function(val){
		return val.charAt(0).toUpperCase() + val.slice(1);
	};

	var name = yargs.name;
	var parentPath = yargs.parent || '';
	var destPath = path.join(resolveToComponents(), parentPath, name);

	return gulp.src(paths.blankTemplates)
		.pipe(template({
			name: name,
			upCaseName: cap(name)
		}))
		.pipe(rename(function(path){
			path.basename = path.basename.replace('temp', name);
		}))
		.pipe(gulp.dest(destPath));
});

gulp.task('nodemon', function(cb) {
	var called = false;
	nodemon({
		script: './server/dist/app.js',
		watch: ['server/dist/app.js']
	})
	.on('start', function() {
		// ensure start only got called once
	 if (!called) { cb(); }
	 called = true;
	})
	.on('restart', reload);
});

gulp.task('nodemon-debug', function(cb) {
	var called = false;
	nodemon({
		execMap: {
			js: 'node --debug'
		},
		ext: 'js',
		ignore: ['.idea/*', 'node_modules/*'],
		script: './server/dist/app.js',
		verbose: true,
		watch: ['server/dist/app.js']
	})
	.on('start', function() {
		// ensure start only got called once
	 if (!called) { cb(); }
	 called = true;
	})
	.on('restart', reload);
});

gulp.task('clean', function(){
  return del([
    'pubic/dist/**/*',
    'server/dist/**/*'
  ]);
});

gulp.task('watch', function(done){
	sync('watch:frontend', 'watch:server', done);
});

gulp.task('build', function(done) {
	sync('webpack:frontend', 'webpack:server', done);
});

gulp.task('default', function(done){
	sync('clean', 'webpack:server', 'webpack:frontend', 'watch', 'browser-sync', done);
});
