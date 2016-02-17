var generators = require('yeoman-generator');
var config = require('../helper/config.js')();
var partial = require('../helper/partial.js')();

module.exports = generators.Base.extend({
    initializing: function() {
        this.log('Creating style partial');
        this.config = config.getJSON(this);
        this.name = null;
    },

    prompting: function() {
        var done = this.async();
        this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the page ?',
                default: 'contact',
                validate: function(input) {
                    if (typeof input !== 'string' || input.length === 0) {
                        this.log(chalk.red('You must pass a valid string valid !'));
                        return false;
                    }
                    return true;
                },
            },
        ], function(answers) {
            this.name = answers.name;
            done();
        }.bind(this));
    },

    writing: function() {
        // Twig
        var twig_content = '{% extends \'layout/_layout.html.twig\' %}\n\n{% block content %}\n    <h1>Hello ' + this.name + ' !</h1>\n{% endblock content %}\n';
        partial.create(this.destinationPath(this.config.twig.src + '/' + this.name + '.html.twig'), twig_content);

        // Sass
        partial.create(this.destinationPath(this.config.sass.src + '/pages/_' + this.name + '.scss'));
        partial.import(
            '@import \'pages/' + this.name + '\';\n', // injection
            '// END pages', // flag
            this.destinationPath(this.config.sass.src + '/main.scss') // path
        );
    },
});
