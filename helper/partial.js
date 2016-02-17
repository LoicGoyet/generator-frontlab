var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var partial = {};

    partial.import = function(injection, flag, path) {
        var file = fs.readFileSync(path, 'utf8');
        file = file.replace(flag, injection + flag);
        fs.writeFileSync(path, file);
        console.log(chalk.green('import partial into : ') + path);
        return;
    };

    partial.create = function(file, content) {
        if (typeof content === 'undefined') {
            content = '';
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(chalk.green('create file : ') + file);
        return;
    };

    return partial;
};
