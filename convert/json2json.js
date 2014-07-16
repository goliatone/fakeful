var fs = require('fs');



var json2json = function(config, callback) {
    if (!config.input) {
        console.error("You miss a input file");
        process.exit(1);
    }

    var cv = new CV(config, callback);
};

function CV(config, callback) {
    this.config = config;
    this.config.headerTransforms = config.headerTransforms || [];
    var data = this.load_file(config.input);
    data = JSON.parse(data);
    this.makeJSON(data, config.output, callback)
}

CV.prototype.load_file = function(input) {
    return fs.readFileSync(input, "utf8");
};

CV.prototype.makeJSON = function(data, path, callback) {
    if (path !== null) {
        var stream = fs.createWriteStream(path, {
            flags: 'w'
        });
        var write = (typeof data !== 'string') ? JSON.stringify(data) : data;
        stream.write(write);
        callback(null, data);
    } else {
        callback(null, data);
    }
};

module.exports = json2json;