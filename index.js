var server = require('./libs/server');


server.run();



return;

var xlsxj = require("./libs/xlsx2json");
var openDB = require('json-file-db');

var db = openDB('output.json');
db.get({
    _index: 333
}, function(err, data) {
    console.log(data);
});
return;
xlsxj({
    input: "sample.xlsx",
    output: "output.json",
    headerTransforms: [

        function removeSpaces(header) {
            return header.toLowerCase().replace(/\s/g, '_');
        }
    ]
}, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        // console.log(result);
        var db = openDB('output.json');
        db.get({
            _index: 333
        }, function(err, data) {
            console.log(data);
        });
    }
});