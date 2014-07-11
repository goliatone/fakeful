var xlsxj = require("../libs/xlsx2json");

var converter = {};

converter.xlsx = function(req, res, next) {

    xlsxj({
        input: req.params.output + ".xlsx",
        output: req.params.output + ".json",
        headerTransforms: [

            function removeSpaces(header) {
                return header.toLowerCase().replace(/\s/g, '_');
            }
        ]
    }, function(err, result) {
        res.jsonp(result);
    });
};

// var fs = require('fs');
// fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log'));
// http://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
module.exports = function(server) {
    console.log(' - XLSX route handler');
    server.get('/xlsx/:output', converter.xlsx);
};