var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs-extra');
<% if (config.serve) { %>var browserSync = require('browser-sync');<% } %>
<% if (config.serve) { %>var reload = browserSync.reload;<% } %>

var getConfig = function() {
    var config_str = fs.readFileSync('frontlab.json');
    return JSON.parse(config_str);
};

gulp.task('styles', function () {
    var config = getConfig();
    return gulp.src(config.sass.src + '/main.scss')
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
    .pipe(gulp.dest(config.sass.dest))
    .pipe($.size({title: 'styles'}));
});

<% if (config.twig.compilation) { %>gulp.task('templates', function() {
    var config = getConfig();
    return gulp.src(config.twig.src + '/*.html.twig')
        .pipe($.twig())
        .pipe($.extReplace('.html', '.html.html'))
        .pipe($.prettify({ indent_size: 2 }))
        .pipe(gulp.dest(config.twig.dest))
        .pipe($.size({title: 'twig'}));
});<% } %>

gulp.task('watch', ['styles', <% if (config.twig.compilation) { %>'templates',<% } %>], function() {
    var config = getConfig();

    <% if (config.serve) { %>browserSync({
        notify: false,
        logPrefix: 'FrontLab',
        server: ['.tmp', config.twig.dest]
    });<% } %>

    gulp.watch(config.sass.src + '/**/*.{scss, css}', ['styles', <% if (config.serve) { %>reload<% } %>]);
    gulp.watch(config.twig.src + '/**/*.{html.twig, twig}', ['templates', <% if (config.serve) { %>reload<% } %>]);
});
