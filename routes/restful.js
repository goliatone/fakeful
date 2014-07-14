var db = require('../libs/filedb'),
    fs = require('fs'),
    path = require("path"),
    express = require('express'),
    router = express.Router();


db.idAttribute = '_index';
db.resourcesPath = 'resources/';

var routes = {};

// GET /:resource

routes.list = function(req, res, next) {
    // var where = JSON.parse(req.param('where'));
    // console.log(where);
    // console.log('HERE')
    db(req.params.resource).find(function(err, resources) {
        res.jsonp(resources);
    });
};
// POST /:resource
routes.create = function(req, res, next) {
    db(req.params.resource).insert(req.body, function(err, resource) {
        res.jsonp(resource);
    });
};

// GET /:resource/:id
routes.read = function(req, res, next) {
    // res.send('read=> resource:' + req.params.resource + ' id: ' + req.params.id);
    db(req.params.resource).findOne(+req.params.id, function(err, resource) {
        if (err) return res.json(500, {
            message: 'Error'
        });
        res.json(resource);
    });
};

// PUT /:resource/:id
// PATCH /:resource/:id
routes.update = function(req, res, next) {
    db(req.params.resource).insert(req.body, function(err, resource) {
        res.jsonp(resource);
    });
};

// DELETE /:resource/:id
routes.destroy = function(req, res, next) {
    db(req.params.resource).remove(req.params.id, function(err, resource) {
        res.jsonp(resource);
    });
};

routes.listResources = function(req, res) {
    var _resources = db.resourcesPath;
    fs.readdir(_resources, function(err, files) {
        if (err) throw err;
        var out = {
            files: []
        };
        files.filter(function(file) {
            return fs.statSync(path.join(_resources, file)).isFile();
        }).forEach(function(file) {
            console.log("%s (%s)", file, path.extname(file));
            out.files.push(file.replace(path.extname(file), ''));
        });

        res.jsonp(out);
    });
};

router.get('/resources', routes.listResources);
router.get('/:resource', routes.list);
router.get('/:parent/:parentId/:resource', routes.list);
router.get('/:resource/:id', routes.read);

router.post('/:resource', routes.create);

router.put('/:resource/:id', routes.update);
router.patch('/:resource/:id', routes.update);

//TODO: Make take config object to add a resource path
//so that we can namespace resources and we can take in
//routes from a configuration file.
module.exports = function(server) {
    console.log(' - API RESTful route handler');
    server.use('/api', router);
};