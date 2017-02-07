var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        main: './<%= config.javascript.src %>/main.js'
    },
    output: {
        path: path.join(__dirname, '<%= config.javascript.dest %>'),
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js'
    },
    module: {
        loaders: [
            {
                loader: "babel-loader",
                test: path.join(__dirname, '<%= config.javascript.src %>'),
                query: {
                    plugins: [],
                    presets: 'es2015'
                }
            }
        ]
    }
};
