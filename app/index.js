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
            }
        };
    },

    // Get sass src
    // ============
    ask_sass_src: function() {
        var done = this.async();
        this.prompt({
            type: 'input',
            name: 'sass_src',
            message: 'Where do you want to generate the sass architecture ?',
            default: 'src'
        }, function(answers) {
            this.config.sass.src = answers.sass_src + '/style';
            done();
        }.bind(this));
    },

    // Get sass dest
    // =============
    ask_sass_dest: function() {
        var done = this.async();
        this.prompt({
            type: 'input',
            name: 'sass_dest',
            message: 'Where will be generated the sass files ?',
            default: 'dest'
        }, function(answers) {
            this.config.sass.dest = answers.sass_dest;
            done();
        }.bind(this));
    },

    // Ask template
    // ============
    ask_twig: function() {
        var done = this.async();
        this.prompt([
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
                default: 'dest',
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
        ], function(answers) {
            this.config.twig.enabled = answers.twig_enabled;
            this.config.twig.src = answers.twig_enabled ? answers.twig_src : false;
            this.config.twig.compilation = answers.twig_enabled ? answers.twig_compilation : false;
            done();
        }.bind(this));
    },

    show_config: function() {
        this.log(this.config);
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
            this.templatePath('_gitignore'),
            this.destinationPath('.gitignore')
        );
        this.fs.copyTpl(
            this.templatePath('_scss-lint.yml'),
            this.destinationPath('.scss-lint.yml')
        );

        // Create gulpfile
        // ---------------
        this.fs.copyTpl(
            this.templatePath('gulpfile.js'),
            this.destinationPath('gulpfile.js')
        );

        // Create sass files
        // -----------------
        this.fs.copyTpl(
            this.templatePath('sass'),
            this.destinationPath(this.config.sass.src)
        );

        // Create json config
        // ------------------
        var config_str = JSON.stringify(this.config, null, 4);
        fs.writeFileSync(this.destinationPath('frontlab.json'), config_str);
    },

    install: function() {
        this.npmInstall(['gulp'], { 'saveDev': true });
        this.npmInstall(['gulp-load-plugins'], { 'saveDev': true });
        this.npmInstall(['fs-extra'], { 'saveDev': true });

        // Gulp sass dependencies
        this.npmInstall(['gulp-sourcemaps'], { 'saveDev': true });
        this.npmInstall(['gulp-sass'], { 'saveDev': true });
        this.npmInstall(['gulp-autoprefixer'], { 'saveDev': true });
        this.npmInstall(['gulp-size'], { 'saveDev': true });
    },
});