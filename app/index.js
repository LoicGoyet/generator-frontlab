var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Welcome to the frontlab generator');
        this.config = {
            sass: {
                src: '',
                dest: '',
            },
            twig: {
                enabled: '',
                compilation: '',
            },
            serve: false,
        };
    },

    prompting: function() {
        var done = this.async();
        this.prompt([
            // Sass prompts
            // ------------
            {
                type: 'input',
                name: 'sass_src',
                message: 'Where do you want to generate the sass architecture ?',
                default: 'src'
            },
            {
                type: 'input',
                name: 'sass_dest',
                message: 'Where will be generated the sass files ?',
                default: 'dest'
            },

            // Twig prompts
            // ------------
            {
                type: 'confirm',
                name: 'twig_enabled',
                message: 'Do you want to generate twig architecture for faster GUI ?',
                default: 'true'
            },
            {
                type: 'input',
                name: 'twig_src',
                message: 'Where do you want to generate the twig architecture ?',
                default: function(answers) {
                    return answers.sass_src;
                },
                when: function(answers) {
                    return answers.twig_enabled;
                },
                validate: function(input) {
                    if (typeof input !== 'string' || input.length === 0) {
                        this.log(chalk.red('You must pass a valid string valid !'));
                        return false;
                    }

                    return true;
                }.bind(this),
            },
            {
                type: 'confirm',
                name: 'twig_compilation',
                message: 'Do you want a gulp task that will compile your twig files ?',
                default: 'true',
                when: function(answers) {
                    return answers.twig_enabled;
                },
            },
            {
                type: 'input',
                name: 'twig_dest',
                message: 'Where will be generated the html files after compilation ?',
                default: function(answers) {
                    return answers.sass_dest;
                },
                when: function(answers) {
                    return answers.twig_enabled && answers.twig_compilation;
                },
                validate: function(input) {
                    if (typeof input !== 'string' || input.length === 0) {
                        this.log(chalk.red('You must pass a valid string valid !'));
                        return false;
                    }

                    return true;
                }.bind(this),
            },
            {
                type: 'confirm',
                name: 'serve',
                message: 'Do you need a gulp task for having a localserver ?',
                when: function(answers) {
                    return answers.twig_compilation;
                },
                default: true,
            }
        ], function(answers) {
            // Sass anwsers
            this.config.sass.src = answers.sass_src + '/style';
            this.config.sass.dest = answers.sass_dest;

            // Twig anwsers
            this.config.twig.enabled = answers.twig_enabled;
            this.config.twig.src = answers.twig_enabled ? answers.twig_src + '/templates' : false;
            this.config.twig.compilation = answers.twig_enabled ? answers.twig_compilation : false;
            this.config.twig.dest = answers.twig_enabled && this.config.twig.compilation ? answers.twig_dest : false;

            // Server
            this.config.serve = answers.serve ? answers.serve : false;
            done();
        }.bind(this));
    },

    configuring: function() {
        this.log(this.config);
        var config_str = JSON.stringify(this.config, null, 4);
        fs.writeFileSync(this.destinationPath('frontlab.json'), config_str);
    },

    writing: function() {
        // Generate package.json
        // ---------------------
        var packageExists = fs.existsSync(this.destinationPath('package.json'));
        if (!packageExists) {
            this.fs.copyTpl(
                this.templatePath('package.json'),
                this.destinationPath('package.json')
            );
        }

        // Create dotfiles
        // -----------------
        this.fs.copyTpl(
            this.templatePath('_scss-lint.yml'),
            this.destinationPath('.scss-lint.yml')
        );

        this.fs.copyTpl(
            this.templatePath('_editorconfig'),
            this.destinationPath('.editorconfig')
        );

        // Create gulpfile
        // ---------------
        this.fs.copyTpl(
            this.templatePath('gulpfile.js'),
            this.destinationPath('gulpfile.js'),
            { config: this.config }
        );

        // Create sass files
        // -----------------
        this.fs.copyTpl(
            this.templatePath('sass'),
            this.destinationPath(this.config.sass.src)
        );

        // Create twig files
        // -----------------
        if (this.config.twig.enabled) {
            this.fs.copyTpl(
                this.templatePath('templates'),
                this.destinationPath(this.config.twig.src)
            );
        }
    },

    install: function() {
        var devDependencies = [
            'gulp',
            'gulp-size',
            'gulp-load-plugins',
            'fs-extra',

            // Gulp sass dependencies
            'gulp-sourcemaps',
            'gulp-sass',
            'gulp-autoprefixer',
        ];

        // Gulp twig dependencies
        if (this.config.twig.compilation) {
            devDependencies.push(
                'gulp-twig',
                'gulp-ext-replace',
                'gulp-prettify'
            );
        }

        // Gulp serve dependencies
        if (this.config.serve) {
            devDependencies.push(
                'browser-sync'
            );
        }

        this.npmInstall(devDependencies, { 'saveDev': true });
    },
});
