var gulp = require('gulp');
var del = require('del');
var clip = require('gulp-clip-empty-files');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var changed = require('gulp-changed');
var gulpif = require('gulp-if');
var connect = require('gulp-connect');

var paths = {
    target: './build',
    coverage: './coverage',
    client: {
        base: './src/main',
        js: [
            './bower_components/lodash/lodash.js',
            './bower_components/angular/angular.js',
            './bower_components/angular-local-storage/dist/angular-local-storage.js',
            './bower_components/angular-recursion/angular-recursion.js',
            './bower_components/angular-sanitize/angular-sanitize.js',
            './src/main/app.js',
            './src/main/**/*.js'
        ],
        css: './src/main/**/*.css',
        html: [
            './src/main/**/*.html',
            '!./src/main/index.html'
        ],
        static_content: [
            './src/main/index.html',
            './src/main/images/**'
        ]
    }
};

//clean up old build
gulp.task('clean', function clean(callback) {
    del([paths.target, paths.coverage], callback);
});

//copy over html
gulp.task('build-html', function() {
    gulp.src(paths.client.html)
        .pipe(clip())
        .pipe(templateCache({ module: 'chatty'}))
        .pipe(changed(paths.target, {hasChanged: changed.compareSha1Digest}))
        .pipe(gulp.dest(paths.target));
});

//copy over html
gulp.task('build-static', function() {
    gulp.src(paths.client.static_content, { base: paths.client.base })
        .pipe(clip())
        .pipe(changed(paths.target, {hasChanged: changed.compareSha1Digest}))
        .pipe(gulp.dest(paths.target));
});

//minify and concat all js
gulp.task('build-js', buildJs(false));
gulp.task('build-js-debug', buildJs(true));
function buildJs(debug) {
    return function() {
        var jspaths = paths.client.js;
        if (debug) jspaths.push('./bower_components/ng-stats/dist/ng-stats.js');
        gulp.src(jspaths)
            .pipe(clip())
            .pipe(gulpif(!debug, sourcemaps.init()))
            .pipe(ngAnnotate())
            .pipe(gulpif(!debug, uglify()))
            .pipe(concat('bundle.js'))
            .pipe(changed(paths.target, {hasChanged: changed.compareSha1Digest}))
            .pipe(gulpif(!debug,sourcemaps.write('.')))
            .pipe(gulp.dest(paths.target));
    }
}

//minify and concat all css
gulp.task('build-css', function() {
    gulp.src(paths.client.css)
        .pipe(clip())
        .pipe(minifyCSS())
        .pipe(concat('bundle.css'))
        .pipe(changed(paths.target, {hasChanged: changed.compareSha1Digest}))
        .pipe(gulp.dest(paths.target));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.client.static_content, ['build-static']);
    gulp.watch(paths.client.html, ['build-html']);
    gulp.watch(paths.client.js, ['build-js-debug']);
    gulp.watch(paths.client.css, ['build-css']);

    //live reload
    gulp.watch(paths.target + '/**').on('change', function(file) {
        gulp.src(file.path, {read: false})
            .pipe(connect.reload());
    });
});

gulp.task('server', function() {
    connect.server({
        root: 'build',
        port: process.env.PORT || 3000,
        livereload: true
    });
});

gulp.task('default', ['server', 'watch', 'build-html', 'build-js-debug', 'build-css', 'build-static']);
gulp.task('build', ['build-html', 'build-js', 'build-css', 'build-static']);