var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var partialCreation = function(file, content) {
        if (typeof content === 'undefined') {
            content = '';
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log(chalk.green('create file : ') + file);
        return;
    };

    return partialCreation;
};
