'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');


var JsonDB = function(resource, idAttribute) {

    JsonDB.loadMetadata();

    var idAttr = idAttribute || JsonDB.idAttribute;
    var file = resource.indexOf('.json') === -1 ? resource + '.json' : resource;
    if (!file) {
        throw new Error('DB: file name is required');
    }

    var db = new FileDB(path.join(JsonDB.resourcesPath, file), {
        idAttribute: idAttr,
        resource: resource
    });

    return db;
};

var EXT = JsonDB.EXT = '.json';
JsonDB.resourcesPath = './resources';
JsonDB.idAttribute = 'id';
JsonDB.metadataFile = '.jsondb';
JsonDB.metadata = {};

JsonDB.loadMetadata = function() {
    if (this.loaded) return;

    var dirname = path.join(JsonDB.resourcesPath,  JsonDB.metadataFile);

    if(!fs.existsSync(JsonDB.resourcesPath)) fs.mkdirSync(JsonDB.resourcesPath);

    if (fs.existsSync(dirname)) return;

    this.load(dirname, function(err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log('Indexing DB for the first time');
                return JsonDB.indexMetadata();
            }
            throw err;
        }
        try {
            JsonDB.metadata = JSON.parse(data);
            this.loaded = true;
        } catch (err) {
            console.log('======');
            console.log(err);
            console.log(data);
            console.log('======');
            throw new Error('Unable to load metadata');
        }
    }.bind(this));
};

JsonDB.updateMetadata = function(resource, file, items) {
    JsonDB.metadata[resource] = {
        file: file,
        count: items.length || 0
    };
    var dirname = JsonDB.resourcesPath + JsonDB.metadataFile;
    fs.writeFile(dirname, JSON.stringify(JsonDB.metadata, null, " "));
};

JsonDB.indexMetadata = function() {
    var dirname = JsonDB.resourcesPath,
        resource,
        items,
        files,
        total,
        count;

    files = fs.readdirSync(dirname);
    total = files.length;
    files.forEach(function(file) {
        try {
            console.log('LOAD PATH ',path.join(dirname, file))
            _load(path.join(dirname, file), function(err, data) {
                resource = file.replace(EXT, '');
                items = JSON.parse(data);
                JsonDB.updateMetadata(resource, file, items);
                count++;
                if (total === count) callback(null, JsonDB.metadata);
            });
        } catch (e) {
            console.log('ERROR', e)
        }
    });
};

var _convertValueToFilter = function(attrs, idAttr) {
    // if a value was provided instead of an object, use the value as an id
    if (attrs !== undefined && !_.isObject(attrs)) {
        var val = attrs;
        attrs = {};
        attrs[idAttr] = val;
    }
    return attrs;
};

var _save = JsonDB.save = function(file, docs, resource) {
    fs.writeFile(file, JSON.stringify(docs, null, ' '), 'utf-8', function() {
        JsonDB.updateMetadata(resource, file, docs);
    });
};

var _load = JsonDB.load = function(file, callback) {
    fs.readFile(file, 'utf-8', callback);
};

var _exists = JsonDB.exists = function(file, callback) {
    if (fs.existsSync(file)) return;
    console.warn('FILE DOES NOT EXIST', file);
    callback(new Error('Resource file #file# does not exist'.replace('#file#', file)));
    return;
};

var FileDB = function(file, config) {
    this.file = file;
    console.log('FileDB', file)
    this.idAttr = config.idAttr || JsonDB.idAttribute;
    this.resource = config.resource;
};

/**
 * Find element
 * @param  {Object}   attrs
 * @param  {Function} cb
 * @return {void}
 * @throws {Error} If file does not exist.
 */
FileDB.prototype.find = function(options, cb) {
    //predicate is optional
    if (_.isFunction(options)) {
        cb = options;
        options = undefined;
    }

    _exists(this.file, cb);

    _load(this.file, (function(err, data) {

        if (err) return cb(err);

        if (!data || data === '') return cb(null, []);

        try {
            var docs = JSON.parse(data);
        } catch (err) {
            cb(err);
            return;
        }

        options = _convertValueToFilter(options, this.idAttr);

        if (options) docs = _.where(docs, options);

        cb(null, docs);
    }).bind(this));
};

FileDB.prototype.findOne = function(attrs, cb) {
    this.find(attrs, (function(err, data) {
        if (err) return cb(err, null);

        var selected = (data && data.length > 0) ? data[0] : undefined;

        cb(null, selected);
    }).bind(this));
};

FileDB.prototype.insert = function(newDoc, cb) {
    // console.log('INSERT', newDoc);

    this.find((function(err, docs) {

        if (err) return cb(err);


        var match = _.filter(docs, (function(doc) {
            return doc[this.idAttr] === newDoc[this.idAttr];
        }).bind(this));

        var out;

        if (match.length >= 1){
            out = match[0];
            _.extend(out, newDoc);
        } else {
            newDoc[this.idAttr] = docs.push(newDoc) - 1;
            out = newDoc;
        }

        // console.log('INSERT find cb', this.resource);

        _save(this.file, docs, this.resource);

        cb(null, out);

    }).bind(this));
};

FileDB.prototype.remove = function(attrs, cb) {
    _exists(this.file, cb);

    this.find((function(err, docs) {

        if (err) return cb(err);

        attrs = _convertValueToFilter(attrs);

        var toDelete = _.where(docs, attrs);
        var toKeep = _.difference(docs, toDelete);

        _save(this.file, toKeep, this.resource);

        cb(null, toKeep);
    }).bind(this));
};

module.exports = JsonDB;