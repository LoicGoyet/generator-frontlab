'use strict';
var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');
var config = require('../helper/config.js')();

module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Welcome to the frontlab generator');
        this.config = {
            'style': {
                'src': 'src/style',
                'dest': 'dest'
            },
            'javascript': {
                'src': 'src/javascript',
                'dest': 'dest',
            },
            'twig': {
                'src': 'src/templates',
                'dest': 'dest',
            },
            'public': {
                'src': 'src',
                'dest': 'dest'
            },
        }
    },

    writing: {
        frontlab: function() {
            this.fs.copyTpl(
                this.templatePath('frontlab/frontlab.js'),
                this.destinationPath('frontlab.js')
            );

            this.fs.copyTpl(
                this.templatePath('style/.scss-lint.yml'),
                this.destinationPath('.scss-lint.yml')
            );
        },

        scss: function() {
            this.fs.copyTpl(
                this.templatePath('style/architecture'),
                this.destinationPath(this.config.style.src)
            );

            this.fs.copyTpl(
                this.templatePath('style/.scss-lint.yml'),
                this.destinationPath('.scss-lint.yml')
            );
        },

        javascript: function() {
            this.fs.copyTpl(
                this.templatePath('javascript'),
                this.destinationPath(this.config.javascript.src)
            );

            this.fs.copyTpl(
                this.templatePath('webpack/webpack.config.babel.js'),
                this.destinationPath('webpack.config.babel.js'),
                { config: this.config }
            );

            this.fs.copyTpl(
                this.templatePath('webpack/.babelrc'),
                this.destinationPath('.babelrc')
            );
        },

        twig: function() {
            this.fs.copyTpl(
                this.templatePath('twig'),
                this.destinationPath(this.config.twig.src)
            );
        },

        gulp: function() {
            this.fs.copyTpl(
                this.templatePath('gulp/gulpfile.babel.js'),
                this.destinationPath('gulpfile.babel.js'),
                { config: this.config }
            );
        },

        bower: function() {
            this.fs.copyTpl(
                this.templatePath('bower/.bowerrc'),
                this.destinationPath('.bowerrc'),
                { config: this.config }
            );

            this.fs.copyTpl(
                this.templatePath('bower/bower.json'),
                this.destinationPath('bower.json'),
                { config: this.config }
            );
        },

        editorconfig: function() {
            this.fs.copyTpl(
                this.templatePath('editorconfig/.editorconfig'),
                this.destinationPath('.editorconfig')
            );
        },

        public: function() {
            this.fs.copyTpl(
                this.templatePath('public'),
                this.destinationPath(this.config.public.src + '/public')
            );
        },

        npm: function() {
            this.fs.copyTpl(
                this.templatePath('npm/package.json'),
                this.destinationPath('package.json')
            );
        },
    },

    install: {
        getDependencies: function() {
            var dependencies = [
                'postcss-object-fit-images',
            ];

            var devDependencies = [
                'babel-core',
                'babel-loader',
                'babel-preset-es2015',
                'browser-sync',
                'fs-extra',
                'gulp',
                'gulp-autoprefixer',
                'gulp-babel',
                'gulp-cssmin',
                'gulp-ext-replace',
                'gulp-load-plugins',
                'gulp-notify',
                'gulp-postcss',
                'gulp-prettify',
                'gulp-sass',
                'gulp-sass-glob',
                'gulp-size',
                'gulp-sourcemaps',
                'gulp-twig',
                'gulp-util',
                'node-sass',
                'run-sequence',
                'webpack',
            ];

            this.npmInstall(dependencies, { 'save': true }, function() {
                this.npmInstall(devDependencies, { 'saveDev': true }, function() {
                    this.runInstall('yarn', null, function() {
                        this.bowerInstall(['trowel-core'], { 'save': true });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },
    },
});
