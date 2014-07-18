var xlsx = require("./xlsx2json"),
    json = require("./json2json"),
    csv = require("./csv2json");

var Converter = function() {};

Converter.csv = csv;
Converter.json = json;
Converter.xlsx = xlsx;

Converter.prototype.factory = function(extension) {
    return Converter[extension];
};

Converter.prototype.run = function(extension, options, callback) {
    var lib = this.factory(extension);
    if (!lib) return callback(new Error('Extension not supported'));
    lib(options, callback);
};


module.exports = new Converter;