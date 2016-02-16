var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Creating style partial');
        var configExists = fs.existsSync(this.destinationPath('frontlab.json'));

        this.config = null;
        if (configExists) {
            var config_str = fs.readFileSync(this.destinationPath('frontlab.json'));
            this.config = JSON.parse(config_str);
        } else {
            this.log(chalk.red('there is no frontlab.json file at the root of your project'));
        }
    },

    prompting: function() {
        var done = this.async();
        this.prompt([
            {
                type: 'list',
                name: 'type',
                message: 'What type of partial do you want to generate ?',
                default: 'components',
                choices: [
                    {
                        name: 'base',
                        value: 'base',
                        checked: false
                    },
                    {
                        name: 'components',
                        value: 'components',
                        checked: false
                    },
                    {
                        name: 'layout',
                        value: 'layout',
                        checked: false
                    },
                    {
                        name: 'pages',
                        value: 'pages',
                        checked: false
                    },
                    {
                        name: 'themes',
                        value: 'themes',
                        checked: false
                    },
                    {
                        name: 'utils',
                        value: 'utils',
                        checked: false
                    },
                    {
                        name: 'vendor',
                        value: 'vendor',
                        checked: false
                    }
                ]
            },
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of your partial ?',
                default: 'pod',
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
                name: 'template_gui',
                message: 'Do you want to generate a template for your guidelines ?',
                default: function(answers) {
                    if (['components', 'layout', 'utils'].indexOf(answers.type) >= 0) {
                        return true;
                    }

                    return false;
                }.bind(this),
            },
            {
                type: 'confirm',
                name: 'template_brick',
                message: 'Do you want to generate a template reusable into all your templates ?',
                when: function(answers) {
                    return answers.template_gui;
                },
                default: true,
            },
        ], function(answers) {
            this.type = answers.type;
            this.name = answers.name;
            this.template = {
                gui: answers.template_gui,
                brick: answers.template_brick,
            };
            done();
        }.bind(this));
    },

    configuring: function() {
        this.file = {
            scss: this.destinationPath(this.config.sass.src + '/' + this.type + '/_' + this.name + '.scss'),
            twig: this.destinationPath(this.config.twig.src + '/guidelines/' + this.type + '/_' + this.name + '.html.twig')
        };
        this.doGenerate = {
            scss: !fs.existsSync(this.file.scss),
            twig: !fs.existsSync(this.file.twig),
        };
    },

    writing: function() {
        for (var key in this.file) {
            if (!this.doGenerate[key]) {
                this.log(chalk.red('file ') + this.file[key] + chalk.red(' already exists'));
            }
        }

        if (this.doGenerate.scss) {
            // Create scss partial file
            fs.writeFileSync(this.file.scss, '', 'utf8');
            this.log(chalk.green('create file : ') + this.file.scss);

            // Import scss partial into main.scss
            var injection = '@import \'' + this.type + '/' + this.name + '\';';
            var flag = '// END ' + this.type;
            var mainSCSSpath = this.destinationPath(this.config.sass.src + '/main.scss');
            var mainSCSS = fs.readFileSync(mainSCSSpath, 'utf8');
            mainSCSS = mainSCSS.replace(flag, injection + '\n' + flag);
            fs.writeFileSync(mainSCSSpath, mainSCSS);
            this.log(chalk.green('import partial into : ') + mainSCSSpath);
        }

        if (this.doGenerate.twig) {
            // Create if necessary template partial folder
            if (!fs.existsSync(this.destinationPath(this.config.twig.src + '/guidelines'))) {
                fs.mkdirSync(this.destinationPath(this.config.twig.src + '/guidelines'));
            }

            if (!fs.existsSync(this.destinationPath(this.config.twig.src + '/guidelines/' + this.type))) {
                fs.mkdirSync(this.destinationPath(this.config.twig.src + '/guidelines/' + this.type));
            }

            // Create template partial file
            fs.writeFileSync(this.file.twig, '', 'utf8');
            this.log(chalk.green('create file : ') + this.file.twig);
        }
    },
});
