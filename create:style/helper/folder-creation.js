var fs = require('fs-extra');
var chalk = require('chalk');

module.exports = function() {
    var folderCreation = function(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
        }

        return;
    };

    return folderCreation;
};
