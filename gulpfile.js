require('babel/register')({
  only: /\.jsx$/,
  modules: 'common',
  optional: [
    'es7.classProperties',
    'es7.decorators',
    'es7.objectRestSpread',
    'runtime',
  ],
});

var _ = require('lodash');
var should = require('should');
var Promise = (global || window).Promise = require('bluebird');
var __DEV__ = (process.env.NODE_ENV !== 'production');
var __PROD__ = !__DEV__;
var __BROWSER__ = (typeof window === 'object');
var __NODE__ = !__BROWSER__;
if(__DEV__) {
  Promise.longStackTraces();
}

var del = require('del');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var fs = Promise.promisifyAll(require('fs'));
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var plumber = require('gulp-plumber');
var prepend = require('gulp-insert').prepend;
var sourcemaps = require('gulp-sourcemaps');

var readPrelude = fs.readFileAsync('./__prelude.js');

function lint() {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
  .pipe(plumber())
  .pipe(eslint())
  .pipe(eslint.format());
}

function test() {
  return gulp.src('src/**/__tests__/**/*.jsx')
    .pipe(mocha())
    .once('error', process.exit.bind(process, 1))
    .once('end', process.exit.bind(process));
}

function clean() {
  del(['dist']);
}

gulp.task('lint', lint);
gulp.task('clean', clean);
//gulp.task('build', ['lint', 'clean'], build);
//gulp.task('test', ['build'], test);
gulp.task('default', ['lint']);
