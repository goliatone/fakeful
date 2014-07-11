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


module.exports = function(server) {
    console.log(' - API RESTful route handler');

    // server.get('/db', routes.db);
    server.get('/:resource', routes.list);
    server.get('/:parent/:parentId/:resource', routes.list);
    server.get('/:resource/:id', routes.read);

    server.post('/:resource', routes.create);

    server.put('/:resource/:id', routes.update);
    server.patch('/:resource/:id', routes.update);
};