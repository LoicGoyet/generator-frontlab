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
    askPartialType: function() {
        var done = this.async();
        this.prompt({
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
        }, function(answers) {
            this.type = answers.type;
            done();
        }.bind(this));
    },
    askPartialName: function() {
        var done = this.async();
        this.prompt({
            type: 'input',
            name: 'name',
            message: 'What is the name of your partial ?'
        }, function(answers) {
            this.name = answers.name;
            done();
        }.bind(this));
    },
    testGeneration: function() {
        this.file = this.destinationPath(this.config.sass.src + '/' + this.type + '/_' + this.name + '.scss');
        this.doGenerate = !fs.existsSync(this.file);
    },
    generateFile: function() {
        if (this.doGenerate) {
            fs.writeFileSync(this.file, '', 'utf8');
            this.log(chalk.green('create file : ') + this.file);
        } else {
            this.log(chalk.red('file ') + this.file + chalk.red(' already exists'));
        }
    },
    importFile: function() {
        if (this.doGenerate) {
            var injection = '@import \'' + this.type + '/' + this.name + '\';';
            var flag = '// END ' + this.type;
            var mainSCSSpath = this.destinationPath(this.config.sass.src + '/main.scss');
            var mainSCSS = fs.readFileSync(mainSCSSpath, 'utf8');
            mainSCSS = mainSCSS.replace(flag, injection + '\n' + flag);
            fs.writeFileSync(mainSCSSpath, mainSCSS);
            this.log(chalk.green('import partial into : ') + mainSCSSpath);
        }
    }
});
