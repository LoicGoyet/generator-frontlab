var generators = require('yeoman-generator');
var fs = require('fs-extra');
var chalk = require('chalk');

var config = require('../helper/config.js')();
var partial = require('../helper/partial.js')();
var folder = require('../helper/folder.js')();


module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Creating style partial');
        this.config = config.getJSON(this);
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
                brick: answers.template_brick ? answers.template_brick : false,
            };
            done();
        }.bind(this));
    },

    configuring: function() {
        this.file = {
            scss: this.destinationPath(this.config.sass.src + '/' + this.type + '/_' + this.name + '.scss'),
            twig: this.destinationPath(this.config.twig.src + '/guidelines/' + this.type + '/_' + this.name + '.html.twig'),
            twig_brick: this.destinationPath(this.config.twig.src + '/bricks/_' + this.name + '.html.twig'),
        };
        this.doGenerate = {
            scss: !fs.existsSync(this.file.scss),
            twig: !fs.existsSync(this.file.twig) && this.template.gui,
            twig_brick: !fs.existsSync(this.file.twig) && !fs.existsSync(this.file.twig_brick) && this.template.brick,
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
            partial.create(this.file.scss);

            // Import scss partial into main.scss
            partial.import(
                '@import \'' + this.type + '/' + this.name + '\';\n', // injection
                '// END ' + this.type, // flag
                this.destinationPath(this.config.sass.src + '/main.scss') // path
            );
        }

        if (this.doGenerate.twig) {
            folder.create(this.destinationPath(this.config.twig.src + '/guidelines'));
            folder.create(this.destinationPath(this.config.twig.src + '/guidelines/' + this.type));

            var content = '';
            if (this.doGenerate.twig_brick) {
                content = '{% include \'../../bricks/_' + this.name + '.html.twig\' %}';
            }
            partial.create(this.file.twig, content);

            // Generate guideline template import
            partial.import(
                '    {% include \'guidelines/' + this.type + '/_' + this.name + '.html.twig\' %}\n    ', // injection
                '{% endblock ' + this.type + ' %}', // flag
                this.destinationPath(this.config.twig.src + '/guidelines.html.twig') // path
            );
        }

        if (this.doGenerate.twig_brick) {
            folder.create(this.destinationPath(this.config.twig.src + '/bricks'));
            partial.create(this.file.twig_brick);
        }
    },
});
