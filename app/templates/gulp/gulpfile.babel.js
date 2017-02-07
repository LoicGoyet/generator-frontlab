'use strict';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import fs from 'fs-extra';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import polyfillObjectFit from 'postcss-object-fit-images';
import webpack from 'webpack';

import webpackConfig from './webpack.config.babel';
import { styleguide, config } from './frontlab';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const reportError = function(err) {
  $.notify({
    title: 'An error occured with a gulp task',
  }).write(err);

  console.log(err.toString());
  this.emit('end');
}

gulp.task('styles', () => {
  return gulp.src('<%= config.style.src %>/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sassGlob())
    .pipe($.sass({
        precision: 6,
        outputStyle: 'expanded',
        sourceComments: true,
        indentWidth: 4,
    }))
    .on('error', reportError)
    .pipe($.postcss([
        polyfillObjectFit
    ]))
    .pipe($.autoprefixer({
        browsers: config.supportedBrowsers
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('<%= config.style.dest %>'))
    .pipe($.size({title: 'styles'}));
});

gulp.task('scripts', function(callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ];

    // run webpack
    webpack(myConfig, function(err, stats) {
        if (err) throw new $.util.PluginError('webpack', err);
        $.util.log('[webpack]', stats.toString({
            colors: true,
            progress: true
        }));
        callback();
    });
});

gulp.task('copy-public', () => {
    return gulp.src('<%= config.public.src %>/public/**/*', { dot: true })
        .pipe(gulp.dest('<%= config.public.dest %>/public'))
        .pipe($.size({ title: 'public' }));
});

gulp.task('templates', () => {
    return gulp.src('<%= config.twig.src %>/*.html.twig')
        .pipe($.twig({
            namespaces: {
                'styleguideUI': './<%= config.twig.src %>/styleguide',
                'styleguidePartial': './<%= config.twig.src %>/partials',
                'bricks': './<%= config.twig.src %>/bricks',
            },
            data: {
                'components': styleguide.partials,
                'colors': styleguide.colors,
            },
            filters: [{
                name: 'slugify',
                func: function (str) {
                    return str.toLowerCase().replace(' ', '-');
                }
            }]
        }))
        .pipe($.extReplace('.html', '.html.html'))
        .pipe($.prettify({ indent_size: 2 }))
        .pipe(gulp.dest('<%= config.twig.dest %>'))
        .pipe($.size({title: 'twig'}));
});

gulp.task('watch', () => {
    browserSync({
        notify: false,
        logPrefix: 'FrontLab',
        server: ['<%= config.twig.dest %>']
    });

    gulp.watch('<%= config.style.src %>/**/*.{scss, css}', ['styles', reload]);
    gulp.watch('<%= config.twig.src %>/**/*.{html.twig, twig}', ['templates', reload]);
    gulp.watch('<%= config.public.src %>/public/**/*', ['copy-public', reload]);
    gulp.watch('<%= config.javascript.src %>/**/*', ['scripts', reload]);
});

gulp.task('default', (cb) => {
    runSequence(
        ['styles', 'templates', 'scripts'],
        ['copy-public'],
        cb
    );
});
