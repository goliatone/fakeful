var xlsxj = require("../libs/xlsx2json"),
    json2 = require("../libs/json2json"),
    express = require('express'),
    router = express.Router();

var uploader = {};
uploader.post = function(req, res) {
    // request.files will contain the uploaded file(s),
    // keyed by the input name (in this case, "file")
    console.log(req.files);

    var file = req.files['convertFile'];

    var path = file.path;
    var output = 'resources/' + file.originalname.replace(file.extension, '.json');

    xlsx({
        input: path,
        output: output,
        headerTransforms: [

            function removeSpaces(header) {
                return header.toLowerCase().replace(/\s/g, '_');
            }
        ]
    }, function(err, result) {
        res.json(result);
    });
};

uploader.get = function(req, res) {
    res.status(200).set('Content-Type', 'text/html');
    res.send(
        '<form action="/xlsx/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="convertFile">' +
        '<input type="submit" value="Upload!">' +
        '</form>'
    );
};

router.get('/upload', uploader.get)
router.post('/upload', uploader.post);

module.exports = function(server) {
    console.log(' - XLSX route handler');
    server.use('/xlsx', router);
};