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

var uploader = {};
uploader.post = function(req, res) {
    // request.files will contain the uploaded file(s),
    // keyed by the input name (in this case, "file")
    res.send({
        "message": "POST uploader"
    });
};

uploader.get = function(req, res) {
    res.status(200).set('Content-Type', 'text/html');
    res.send(
        '<form action="/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="upload-file">' +
        '<input type="submit" value="Upload!">' +
        '</form>'
    );
};

module.exports = function(server) {
    console.log(' - XLSX route handler');
    server.get('/xlsx/:output', converter.xlsx);

    server.get('/upload', uploader.get)
    server.post('/upload', uploader.post);
};