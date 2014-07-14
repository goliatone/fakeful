var fs = require('fs'),
    JSONStream = require('JSONStream'),

var getStream(jsonData) = function() {
    var stream = fs.createReadStream(jsonData, {
        encoding: 'utf8'
    });

    var parser = JSONStream.parse();

    return stream.pipe(parser);
};

getStream(options.input).on('complete', function(err) {
        // handle any errors
    }

    var json2json = function(options, callback) {
        var output = require(options.input);
        var stream = fs.createWriteStream(output, {
            flags: 'w'
        });
        stream.write(JSON.stringify(output));
        callback(null, output);
    };

    module.exports = json2json;