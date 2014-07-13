var db = require('../libs/filedb');

var routes = {};

// GET /:resource
routes.list = function(req, res, next) {
    // res.send('list=> resource:' + req.params.resource);
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

//TODO: Make take config object to add a resource path
//so that we can namespace resources and we can take in
//routes from a configuration file.
module.exports = function(server) {
    console.log(' - API RESTful route handler');

    // server.get('/db', routes.db);
    server.get('/api/:resource', routes.list);
    server.get('/api/:parent/:parentId/:resource', routes.list);
    server.get('/api/:resource/:id', routes.read);

    server.post('/api/:resource', routes.create);

    server.put('/api/:resource/:id', routes.update);
    server.patch('/api/:resource/:id', routes.update);
};