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

module.exports = function(server) {
    console.log(' - XLSX route handler');
    server.get('/xlsx/:output', converter.xlsx);
};