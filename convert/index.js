var xlsx = require("./xlsx2json"),
    json = require("./json2json"),
    csv = require("./csv2json");

var Converter = function() {};

Converter.csv = csv;
Converter.json = json;
Converter.xlsx = xlsx;

Converter.prototype.factory = function(extension) {

};