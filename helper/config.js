var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var config = {};

    config.isIsset = function($) {
        return fs.existsSync($.destinationPath('frontlab.json'));
    };

    config.getString = function($) {
        if (config.isIsset($)) {
            return fs.readFileSync($.destinationPath('frontlab.json'));
        }

        return null;
    };

    config.getJSON = function($) {
        if (config.isIsset($)) {
            return JSON.parse(config.getString($));
        }

        return $.env.error(chalk.red('there is no frontlab.json file at the root of your project'));
    };

    config.write = function($, config) {
        var string = JSON.stringify(config, null, 4);
        fs.writeFileSync($.destinationPath('frontlab.json'), string);
    };

    return config;
};
