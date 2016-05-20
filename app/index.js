var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');
var config = require('../helper/config.js')();


module.exports = generators.Base.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        /**
         * @model: '{"sass_src":"test"}'
         */
        this.argument('config', {
            required: false,
            desc: '\nA string that will be JSON parse to init the config and avoid prompts\nexample : \'{"sass_src":"test"}\'',
        });

        if (this.config) {
            this.config = JSON.parse(this.config);
        } else {
            this.config = {};
        }
    },

    initializing: function() {
        this.log('Welcome to the frontlab generator');
        this.default = {
            src: this.config.sass_src ? this.config.sass_src : 'src',
            dest: this.config.sass_dest ? this.config.sass_dest : 'dest',
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
                when: function(answers) {
                    return !this.config.sass_src;
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
                when: function(answers) {
                    return !this.config.sass_dest;
                }.bind(this),
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
                default: true,
                when: function(answers) {
                    return !this.config.twig_enabled;
                }.bind(this),
            },
            {
                type: 'input',
                name: 'twig_src',
                message: 'Where do you want to generate the twig architecture ?',
                default: function() {
                    return this.default.src;
                }.bind(this),
                when: function(answers) {
                    return (answers.twig_enabled || this.config.twig_enabled) && !this.config.twig_src;
                }.bind(this),
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
                    return (answers.twig_enabled || this.config.twig_enabled) && !this.config.twig_compilation;
                }.bind(this),
            },
            {
                type: 'input',
                name: 'twig_dest',
                message: 'Where will be generated the html files after compilation ?',
                default: function() {
                    return this.default.dest;
                }.bind(this),
                when: function(answers) {
                    return ((answers.twig_enabled || this.config.twig_enabled) && (answers.twig_compilation || this.config.twig_compilation)) && !this.config.twig_dest;
                }.bind(this),
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
                when: function(answers) {
                    return !this.config.public_enabled;
                }.bind(this),
            },
            {
                type: 'input',
                name: 'public_src',
                message: 'Where do you want to generate the \'public\' folder ?',
                when: function(answers) {
                    return (answers.public_enabled || this.config.public_enabled) && !this.config.public_src;
                }.bind(this),
                default: function() {
                    return this.default.src;
                }.bind(this),
            },
            {
                type: 'input',
                name: 'public_dest',
                message: 'Where do you want to copy the \'public\' folder ?',
                when: function(answers) {
                    return answers.public_enabled && !this.config.public_dest;
                }.bind(this),
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
                    return (answers.twig_compilation || answers.public_enabled) && !this.config.serve;
                }.bind(this),
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

        writingBowerfiles: function() {
            this.fs.copyTpl(
                this.templatePath('_bowerrc'),
                this.destinationPath('.bowerrc'),
                { config: this.config }
            );

            this.fs.copyTpl(
                this.templatePath('bower.json'),
                this.destinationPath('bower.json'),
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
                'gulp-notify',
                'gulp-load-plugins',
                'fs-extra',
                'run-sequence',
                'av-gulp-injector',

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
