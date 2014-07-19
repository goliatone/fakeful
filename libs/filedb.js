var fs = require('fs'),
    _ = require('underscore');


var JsonDB = function(resource, idAttribute) {

    JsonDB.loadMetadata();

    var idAttr = idAttribute || JsonDB.idAttribute;
    var file = resource.indexOf('.json') === -1 ? resource + '.json' : resource;
    if (!file) {
        throw new Error("DB: file name is required");
    }

    var db = new FileDB(JsonDB.resourcesPath + file, {
        idAttribute: idAttr,
        resource: resource
    });

    return db;
};

var EXT = JsonDB.EXT = '.json';
JsonDB.resourcesPath = '';
JsonDB.idAttribute = 'id';
JsonDB.metadataFile = '.jsondb';
JsonDB.metadata = {};

JsonDB.loadMetadata = function() {
    if (this.loaded) return;

    if (fs.existsSync(file)) return;

    this.load(JsonDB.resourcesPath + JsonDB.metadataFile, function(err, data) {
        try {
            JsonDB.metadata = JSON.parse(data);
        } catch (err) {
            console.log(err);
            throw new Error('Unable to load metadata');
            return;
        }
    });
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
            _load(dirname + file, function(err, data) {
                resource = file.replace(EXT, '');
                items = JSON.parse(data);
                JsonDB.updateMetadata(resource, file, items);
                count++;
                if (total === count) callback(null, JsonDB.metadata);

            });
        } catch (e) {

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
    fs.writeFile(file, JSON.stringify(docs, null, " "), 'utf-8', function() {
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
FileDB.prototype.find = function(attrs, cb) {
    //predicate is optional
    if (_.isFunction(attrs)) {
        cb = attrs;
        attrs = undefined;
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

        attrs = _convertValueToFilter(attrs, this.idAttr);

        if (attrs) docs = _.where(docs, attrs);

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
    this.find((function(err, docs) {

        if (err) return cb(err);


        var match = _.filter(docs, (function(doc) {
            return doc[this.idAttr] === newDoc[this.idAttr];
        }).bind(this));

        if (match.length >= 1) _.extend(match[0], newDoc);
        else newDoc[this.idAttr] = docs.push(newDoc) - 1;

        _save(this.file, docs, this.resource);

        cb(null, docs);

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