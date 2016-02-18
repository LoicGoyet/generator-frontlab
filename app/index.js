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
            twig_compilation: null,
            public_enabled: null,
            public_src: null,
            public_dest: null,
            serve: null,
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
            },
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
                default: function(answers) {
                    return answers.sass_src;
                },
            },
            {
                type: 'input',
                name: 'public_dest',
                message: 'Where do you want to copy the \'public\' folder ?',
                when: function(answers) {
                    return answers.public_enabled;
                },
                default: function(answers) {
                    return answers.sass_dest;
                },
            },
        ], function(answers) {
            // Sass anwsers
            this.config.sass_src = answers.sass_src + '/style';
            this.config.sass_dest = answers.sass_dest;

            // Twig anwsers
            this.config.twig_enabled = answers.twig_enabled;
            this.config.twig_src = answers.twig_enabled ? answers.twig_src + '/templates' : false;
            this.config.twig_compilation = answers.twig_enabled ? answers.twig_compilation : false;
            this.config.twig_dest = answers.twig_enabled && this.config.twig_compilation ? answers.twig_dest : false;

            // Copy
            this.config.public_enabled = answers.public_enabled;
            this.config.public_src = answers.public_src ? answers.public_src : false;
            this.config.public_dest = answers.public_dest ? answers.public_dest : false;

            // Server
            this.config.serve = answers.serve ? answers.serve : false;
            done();
        }.bind(this));
    },

    configuring: function() {
        config.write(this, this.config);
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

        setTimeout(function() {
            var scripts = {
                'make-dev': 'npm install && bower install && gulp',
                'start': 'gulp watch'
            };

            var package_str = fs.readFileSync(this.destinationPath('package.json'));
            var package = JSON.parse(package_str);
            package.scripts['make-dev'] = 'npm install && bower install && gulp';
            package.scripts['start-dev'] = 'gulp watch';
            fs.writeFileSync(this.destinationPath('package.json'), JSON.stringify(package, null, 4));
        }.bind(this), 500);


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
            this.destinationPath(this.config.sass_src)
        );

        // Create twig files
        // -----------------
        if (this.config.twig_enabled) {
            this.fs.copyTpl(
                this.templatePath('templates'),
                this.destinationPath(this.config.twig_src)
            );
        }

        // Create public folder
        // --------------------
        if (this.config.public_enabled) {
            this.fs.copyTpl(
                this.templatePath('public'),
                this.destinationPath(this.config.public_src + '/public')
            );
        }
    },

    install: function() {
        var devDependencies = [
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

        // Gulp twig dependencies
        if (this.config.twig_compilation) {
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
