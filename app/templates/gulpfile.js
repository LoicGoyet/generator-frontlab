var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs-extra');

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
