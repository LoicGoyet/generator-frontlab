var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs-extra');
var runSequence = require('run-sequence');
<% if (config.serve) { %>var browserSync = require('browser-sync');<% } %>
<% if (config.serve) { %>var reload = browserSync.reload;<% } %>

var getConfig = function() {
    var config_str = fs.readFileSync('frontlab.json');
    return JSON.parse(config_str);
};

gulp.task('styles', function () {
    var config = getConfig();
    return gulp.src(config.sass_src + '/main.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({
        browsers: [
            'ie >= 10',
            'ie_mob >= 10',
            'ff >= 30',
            'chrome >= 34',
            'safari >= 7',
            'opera >= 23',
            'ios >= 7',
            'android >= 4.4',
            'bb >= 10'
        ]
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(config.sass_dest))
    .pipe($.size({title: 'styles'}));
});

<% if (config.public_enabled) { %>gulp.task('copy-public', function() {
    var config = getConfig();
    return gulp.src(config.public_src + '/public/**/*', { dot: true })
        .pipe(gulp.dest(config.public_dest + '/public'))
        .pipe($.size({ title: 'public' }));
});<% } %>

<% if (config.twig_compilation) { %>gulp.task('templates', function() {
    var config = getConfig();
    return gulp.src(config.twig_src + '/*.html.twig')
        .pipe($.twig())
        .pipe($.extReplace('.html', '.html.html'))
        .pipe($.prettify({ indent_size: 2 }))
        .pipe(gulp.dest(config.twig_dest))
        .pipe($.size({title: 'twig'}));
});<% } %>

gulp.task('watch', ['default'], function() {
    var config = getConfig();

    <% if (config.serve) { %>browserSync({
        notify: false,
        logPrefix: 'FrontLab',
        server: [config.twig_dest]
    });<% } %>

    gulp.watch(config.sass_src + '/**/*.{scss, css}', ['styles', <% if (config.serve) { %>reload<% } %>]);
    <% if (config.twig_compilation) { %>gulp.watch(config.twig_src + '/**/*.{html.twig, twig}', ['templates', <% if (config.serve) { %>reload<% } %>]);<% } %>
    <% if (config.public_enabled) { %>gulp.watch(config.public_src + '/public/**/*', ['copy-public', <% if (config.serve) { %>reload<% } %>]);<% } %>
});

gulp.task('default', function(cb) {
    runSequence(
        [
            'styles',
            <% if (config.twig_compilation) { %>'templates',<% } %>
        ],
        [
            <% if (config.public_enabled) { %>'copy-public',<% } %>
        ],
        cb
    );
});
