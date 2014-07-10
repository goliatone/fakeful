/**
 * Routes autodiscovery module.
 */
var fs = require('fs');

module.exports = function(app) {
    console.log("Routes: loading...");

    var name;
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === 'index.js') return;
        name = file.substr(0, file.indexOf('.'));
        /*
         * Dynamically include and initialize all route files.
         */
        require('./' + name)(app);
    });
};