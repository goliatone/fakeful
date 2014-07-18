var fs = require('fs'),
    Converter = require('../convert'),
    express = require('express'),
    router = express.Router();

var uploader = {};
uploader.post = function(req, res) {
    // request.files will contain the uploaded file(s),
    // keyed by the input name (in this case, "file")
    console.log(req.files);

    var file = req.files['convertFile'];

    //TODO: Sanitize output file name
    //TODO: Take in filename parameter!
    //TODO: Build index!
    var path = file.path;
    var output = 'resources/' + file.originalname.replace(file.extension, 'json');

    Converter.run(file.extension, {
        input: path,
        output: output,
        headerTransforms: [

            function removeSpaces(header) {
                return header.toLowerCase().replace(/\s/g, '_');
            }
        ]
    }, function(err, result) {
        if (err) return res.json(412, {
            message: "File format not supported"
        });
        res.json(result);
    });
};

uploader.get = function(req, res) {
    res.status(200).set('Content-Type', 'text/html');
    res.send(
        '<form action="/files/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="convertFile">' +
        '<input type="submit" value="Upload!">' +
        '</form>'
    );
};

router.get('/upload', uploader.get)
router.post('/upload', uploader.post);

module.exports = function(server) {
    //TODO: Here we should also take a config.
    //config should have upload/output directories.
    //we should mkdir if they do not exist.
    _mkdirp('uploads');
    _mkdirp('resources');

    console.log(' - XLSX route handler');
    server.use('/files', router);
};


function _mkdirp(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, 0766, function(err) {
            if (err) {
                console.log(err);
                console.log("ERROR! Can't make the directory! \n");
            }
        });
    }
}