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
        total: 9999,
        data: result
    });

    res.set('Content-Type', 'application/json');
    res.send(200, out);
};

// GET /:resource

Routes.list = function(req, res, next) {
    // var where = JSON.parse(req.param('where'));
    var where = req.param('where', false);
    if (where) {
        where = JSON.parse(where);
    } else where = undefined;

    var resource = req.params.resource;
    db(resource).find(where, function(err, items) {

        var offset = req.param('offset', false),
            limit = req.param('limit', 30),
            output = items;

        if (offset) {
            //TODO: Check boundaries!!!
            //TODO: Check if isNaN after parseInt!
            offset = parseInt(offset),
            limit = parseInt(limit);

            offset = offset > 0 ? offset - 1 : 0;

            output = items.slice(offset, offset + limit);
        }

        Routes.resultHandler('list', resource, res, null, output);

    });
};

// POST /:resource
Routes.create = function(req, res, next) {
    var resource = req.params.resource,
        attributes = req.body;
    db(resource).insert(attributes, Routes.resultHandler.bind(null, 'create', resource, res));
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
    /*
    db.indexMetadata(function(err, data) {
        res.jsonp(data);
    });
    return;
*/
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

Routes.using = '/api';
Routes.routes = {
    'GET /resources': Routes.listResources,
    'GET /:resource': Routes.list,
    'GET /:resource/:id': Routes.read,
    'GET /:parent/:parentId/:resource': Routes.list,
    'POST /:resource': Routes.create,
    'PUT /:resource/:id': Routes.update,
    'PATCH /:resource/:id': Routes.update,
    'DELETE /:resource/:id': Routes.destroy
};

//TODO: Make take config object to add a resource path
//so that we can namespace resources and we can take in
//routes from a configuration file.
module.exports =  Routes;