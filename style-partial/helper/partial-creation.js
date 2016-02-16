var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var partialCreation = function(file) {
        fs.writeFileSync(file, '', 'utf8');
        this.log(chalk.green('create file : ') + file);
        return;
    };

    return partialCreation;
};
