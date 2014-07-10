var routes = {};

routes.list = function(req, res, next) {

};

routes.create = function(req, res, next) {

};

routes.read = function(req, res, next) {

};

routes.update = function(req, res, next) {

};

// DELETE /:resource/:id
routes.destroy = function(req, res, next) {

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