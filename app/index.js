var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');
var config = require('../helper/config.js')();


module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Welcome to the frontlab generator');
        this.config = {
            sass_src: null,
            sass_dest: null,

            twig_enabled: null,
            twig_src: null,
            twig_compilation: null,
            twig_dest: null,

            public_enabled: null,
            public_src: null,
            public_dest: null,
            serve: null,
        };

        this.default = {
            src: 'src',
            dest: 'dest',
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
                default: function() {
                    return this.default.src;
                }.bind(this),
                filter: function(input) {
                    this.default.src = input;
                    return input + '/style';
                }.bind(this),
            },
            {
                type: 'input',
                name: 'sass_dest',
                message: 'Where will be generated the sass files ?',
                default: function() {
                    return this.default.dest;
                }.bind(this),
                filter: function(input) {
                    this.default.dest = input;
                    return input;
                }.bind(this),
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
                default: function() {
                    return this.default.src;
                }.bind(this),
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
                filter: function(input) {
                    return input + '/templates';
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
                default: function() {
                    return this.default.dest;
                }.bind(this),
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

            // Public prompts
            // --------------
            {
                type: 'confirm',
                name: 'public_enabled',
                message: 'Do you want to generate a \'public\' folder (usefull for copy all files without transformation)',
                default: true,
            },
            {
                type: 'input',
                name: 'public_src',
                message: 'Where do you want to generate the \'public\' folder ?',
                when: function(answers) {
                    return answers.public_enabled;
                },
                default: function() {
                    return this.default.src;
                }.bind(this),

            },
            {
                type: 'input',
                name: 'public_dest',
                message: 'Where do you want to copy the \'public\' folder ?',
                when: function(answers) {
                    return answers.public_enabled;
                },
                default: function() {
                    return this.default.dest;
                }.bind(this),
            },

            // Server prompt
            // -------------
            {
                type: 'confirm',
                name: 'serve',
                message: 'Do you need a gulp task for having a localserver ?',
                when: function(answers) {
                    return answers.twig_compilation || answers.public_enabled;
                },
                default: true,
            },
        ], function(answers) {
            for (var key in answers) {
                this.config[key] = answers[key];
            }
            done();
        }.bind(this));
    },

    configuring: function() {
        config.write(this, this.config);
    },

    writing: {
        writingPackageJSON: function() {
            fs.stat(this.destinationPath('package.json'), function(err, stats) {
                var packageExists = err === null && stats.isFile();
                if (!packageExists) {
                    this.fs.copyTpl(
                        this.templatePath('package.json'),
                        this.destinationPath('package.json')
                    );
                }
            }.bind(this));
        },

        writingDotfiles: function() {
            this.fs.copyTpl(
                this.templatePath('_scss-lint.yml'),
                this.destinationPath('.scss-lint.yml')
            );

            this.fs.copyTpl(
                this.templatePath('_editorconfig'),
                this.destinationPath('.editorconfig')
            );
        },

        writingGulpfile: function() {
            this.fs.copyTpl(
                this.templatePath('gulpfile.js'),
                this.destinationPath('gulpfile.js'),
                { config: this.config }
            );
        },

        writingSassArchitecture: function() {
            this.fs.copyTpl(
                this.templatePath('sass'),
                this.destinationPath(this.config.sass_src)
            );
        },

        writingTwigArchitecture: function() {
            if (this.config.twig_enabled) {
                this.fs.copyTpl(
                    this.templatePath('templates'),
                    this.destinationPath(this.config.twig_src)
                );
            }
        },

        writingPublicArchitecture: function() {
            if (this.config.public_enabled) {
                this.fs.copyTpl(
                    this.templatePath('public'),
                    this.destinationPath(this.config.public_src + '/public')
                );
            }
        },
    },

    install: {
        getDependencies: function() {
            this.devDependencies = [
                'gulp',
                'gulp-size',
                'gulp-load-plugins',
                'fs-extra',
                'run-sequence',

                // Gulp sass dependencies
                'gulp-sourcemaps',
                'gulp-sass',
                'gulp-autoprefixer',
            ];
        },

        addTwigDependencies: function() {
            if (this.config.twig_compilation) {
                this.devDependencies.push(
                    'gulp-twig',
                    'gulp-ext-replace',
                    'gulp-prettify'
                );
            }
        },

        addServeDependencies: function() {
            if (this.config.serve) {
                this.devDependencies.push(
                    'browser-sync'
                );
            }
        },

        installDependencies: function() {
            this.npmInstall(this.devDependencies, { 'saveDev': true });
        },
    },
});
