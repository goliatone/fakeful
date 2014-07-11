var fs = require('fs');
var _ = require('underscore');

/**
 * Creates a DB instance that is a simple wapper around the given file.
 * @param file File path
 * @param idAttribute Name of the attribut to use as the id. Used to identify
 * an existing document by the put and delete methods. Default value is 'id'
 */
var open = function(file, idAttribute) {
    var idAttr = idAttribute || '_index';
    var file = file.indexOf('.json') === -1 ? file + '.json' : file;
    if (!file) {
        throw new Error("DB: file name is required");
    }

    var convertValueToFilter = function(attrs) {
        // if a value was provided instead of an object, use the value as an id
        if (attrs !== undefined && !_.isObject(attrs)) {
            var val = attrs;
            attrs = {};
            attrs[idAttr] = val;
        }
        return attrs;
    };


    var get = function(attrs, cb) {

        //predicate is optional
        if (_.isFunction(attrs)) {
            cb = attrs;
            attrs = undefined;
        }
        if (!fs.existsSync(file)) {
            cb(null, []);
            return;
        }

        fs.readFile(file, 'utf-8', function(err, data) {
            if (err) {
                cb(err);
                return;
            }

            if (!data || data === '') {
                cb(null, []);
                return;
            }

            try {
                var docs = JSON.parse(data);
            } catch (err) {
                cb(err);
                return;
            }

            attrs = convertValueToFilter(attrs);

            if (attrs) {
                docs = _.where(docs, attrs);
            }
            cb(null, docs);
        });

    };


    var getSingle = function(attrs, cb) {

        get(attrs, function(err, data) {

            if (err) {
                cb(err, null);
                return;
            }
            var selected = (data && data.length > 0) ? data[0] : undefined;
            cb(null, selected);
        });

    };


    var put = function(newDoc, cb) {

        get(function(err, docs) {

            if (err) {
                cb(err);
                return;
            }

            var match = _.filter(docs, function(doc) {
                return doc[idAttr] === newDoc[idAttr];
            });
            if (match.length >= 1) {
                _.extend(match[0], newDoc);
            } else {
                newDoc[idAttr] = docs.push(newDoc) - 1;
            }
            _save(docs);
            cb(null, docs);
        });
    };

    var _save = function(docs) {
        fs.writeFile(file, JSON.stringify(docs, null, " "), 'utf-8', cb);
    };


    var del = function(attrs, cb) {
        if (!fs.existsSync(file)) {
            cb(null);
            return;
        }

        get(function(err, docs) {

            if (err) {
                cb(err);
                return;
            }

            attrs = convertValueToFilter(attrs);

            var toDelete = _.where(docs, attrs);
            var toKeep = _.difference(docs, toDelete);

            _save(toKeep);
            cb(null, toKeep);
        });

    };

    return {
        get: get,
        getSingle: getSingle,
        put: put,
        "delete": del
    }

};

module.exports = open;