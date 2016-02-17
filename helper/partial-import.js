var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var partialImport = function(injection, flag, path) {
        var file = fs.readFileSync(path, 'utf8');
        file = file.replace(flag, injection + flag);
        fs.writeFileSync(path, file);
        console.log(chalk.green('import partial into : ') + path);
        return;
    };

    return partialImport;
};
