var db = require('../libs/filedb'),
    express = require('express'),
    router = express.Router();



var routes = {};

// GET /:resource

routes.list = function(req, res, next) {

    var where = JSON.parse(req.param('where'));
    console.log(where);

    db(req.params.resource).get(function(err, resources) {
        res.jsonp(resources);
    });
};
// POST /:resource
routes.create = function(req, res, next) {
    db(req.params.resource).put(req.body, function(err, resource) {
        res.jsonp(resource);
    });
};

// GET /:resource/:id
routes.read = function(req, res, next) {
    // res.send('read=> resource:' + req.params.resource + ' id: ' + req.params.id);

    db(req.params.resource).getSingle(+req.params.id, function(err, resource) {
        res.jsonp(resource);
    });
};

// PUT /:resource/:id
// PATCH /:resource/:id
routes.update = function(req, res, next) {
    db(req.params.resource).put(req.body, function(err, resource) {
        res.jsonp(resource);
    });
};

// DELETE /:resource/:id
routes.destroy = function(req, res, next) {
    db(req.params.resource).del(req.params.id, function(err, resource) {
        res.jsonp(resource);
    });
};

// server.get('/db', routes.db);
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