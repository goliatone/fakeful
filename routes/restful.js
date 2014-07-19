var db = require('../libs/filedb'),
    fs = require('fs'),
    path = require("path"),
    express = require('express'),
    router = express.Router();

/***************************************
 * Template handling, move to file
 ****************************************/

var Template = require('handlebars');
Template.registerHelper('data', function(options) {
    return JSON.stringify(options.data.root.data);
});

Template.precompileAction = function(action) {
    var tsrc = fs.readFileSync('views/restful/' + action + '.jtpl', 'utf8');
    Template[action] = Template.compile(tsrc);
};
Template.precompileAction('list');
Template.precompileAction('result');

db.idAttribute = '_index';
db.resourcesPath = 'resources/';

var Routes = {
    messages: {
        list: 'Resources',
        read: 'Resource',
        create: 'Resource created',
        update: 'Resource updated',
        destroy: 'Resource destroyed'

    }
};

Routes.resultHandler = function(action, resource, res, err, result) {
    var out = Template.result({
        action: action,
        resource: resource,
        message: Routes.messages[action],
        count: result.length || 1,
        data: result
    });

    res.set('Content-Type', 'application/json');
    res.send(200, out);
};

// GET /:resource

Routes.list = function(req, res, next) {
    // var where = JSON.parse(req.param('where'));
    // console.log(where);
    // console.log('HERE')
    var resource = req.params.resource;
    db(resource).find(Routes.resultHandler.bind(null, 'list', resource, res));
};

// POST /:resource
Routes.create = function(req, res, next) {
    db(req.params.resource).insert(req.body, function(err, resource) {
        res.jsonp(resource);
    });
};

// GET /:resource/:id
Routes.read = function(req, res, next) {
    // res.send('read=> resource:' + req.params.resource + ' id: ' + req.params.id);
    var resource = req.params.resource,
        id = +req.params.id;
    db(resource).findOne(id, Routes.resultHandler.bind(null, 'read', resource, res));
};

// PUT /:resource/:id
// PATCH /:resource/:id
Routes.update = function(req, res, next) {
    var resource = req.params.resource,
        attributes = req.body;
    db(resource).insert(attributes, Routes.resultHandler.bind(null, 'update', resource, res));
};

// DELETE /:resource/:id
Routes.destroy = function(req, res, next) {
    var resource = req.params.resource,
        id = +req.params.id;
    db(resource).remove(id, Routes.resultHandler.bind(null, 'delete', resource, res));
};

// GET /resources
Routes.listResources = function(req, res) {
    var _resources = db.resourcesPath;
    fs.readdir(_resources, function(err, files) {
        if (err) throw err;
        var out = {
            resources: []
        };
        files.filter(function(file) {
            return fs.statSync(path.join(_resources, file)).isFile();
        }).forEach(function(file) {
            console.log("%s (%s)", file, path.extname(file));
            out.resources.push(file.replace(path.extname(file), ''));
        });

        res.jsonp(out);
    });
};

router.get('/resources', Routes.listResources);

router.get('/:resource', Routes.list);
router.get('/:resource/:id', Routes.read);
router.get('/:parent/:parentId/:resource', Routes.list);


router.post('/:resource', Routes.create);


router.put('/:resource/:id', Routes.update);
router.patch('/:resource/:id', Routes.update);

router.delete('/:resource/:id', Routes.destroy);

//TODO: Make take config object to add a resource path
//so that we can namespace resources and we can take in
//routes from a configuration file.
module.exports = function(server) {
    console.log(' - API RESTful route handler');
    server.use('/api', router);
};