var fs = require('fs'),
    _ = require('underscore');


var JsonDB = function(file, idAttribute) {
    var idAttr = idAttribute || '_index';
    var file = file.indexOf('.json') === -1 ? file + '.json' : file;
    if (!file) {
        throw new Error("DB: file name is required");
    }

    var db = new FileDB(file, {
        idAttribute: idAttr
    });

    return db;
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

var _save = function(file, docs) {
    fs.writeFile(file, JSON.stringify(docs, null, " "), 'utf-8', cb);
};

var _load = function(file, callback) {
    fs.readFile(file, 'utf-8', callback);
};

var FileDB = function(file, config) {
    this.file = file;
    this.idAttr = config.idAttr || '_index';
};

FileDB.prototype.find = function(attrs, cb) {
    //predicate is optional
    if (_.isFunction(attrs)) {
        cb = attrs;
        attrs = undefined;
    }

    if (!fs.existsSync(this.file)) {
        console.warn('FILE DOES NOT EXIST', this.file);
        cb(null, []);
        return;
    }

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
        if (err) {
            cb(err, null);
            return;
        }
        var selected = (data && data.length > 0) ? data[0] : undefined;
        cb(null, selected);
    }).bind(this));
};

FileDB.prototype.insert = function(newDoc, cb) {
    this.find((function(err, docs) {

        if (err) {
            cb(err);
            return;
        }

        var match = _.filter(docs, function(doc) {
            return doc[this.idAttr] === newDoc[this.idAttr];
        });
        if (match.length >= 1) {
            _.extend(match[0], newDoc);
        } else {
            newDoc[this.idAttr] = docs.push(newDoc) - 1;
        }
        _save(this.file, docs);
        cb(null, docs);
    }).bind(this));
};

FileDB.prototype.remove = function(attrs, cb) {
    if (!fs.existsSync(this.file)) {
        cb(null);
        return;
    }

    this.find((function(err, docs) {

        if (err) {
            cb(err);
            return;
        }

        attrs = _convertValueToFilter(attrs);

        var toDelete = _.where(docs, attrs);
        var toKeep = _.difference(docs, toDelete);

        _save(this.file, toKeep);
        cb(null, toKeep);
    }).bind(this));
};

module.exports = JsonDB;