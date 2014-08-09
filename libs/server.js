'use strict';

var express = require('express'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    errorHandler = require('../middleware/errorHandler'),
    finder = require('trackfinder'),
    debug = require('debug')('et'),
    multer = require('multer');

console.log('***************************');
console.log('time: ', new Date());
console.log('dirname:', __dirname);

var server = express();

server.express = express;


server.set('views', path.join(__dirname, '../views'));
server.set('view engine', 'ejs');


server.use(favicon());
server.use(logger('dev'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded());
server.use(cookieParser());
server.use(multer({
    dest: './uploads/',
    rename: function(fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
    }
}));

server.use(cors());
server.use(express.static(__dirname + '/../public'));

server.findPort = function getPort() {
    var port = process.env.PORT || 9390;
    var args = process.argv.splice(2);
    if (!args.length) return port;
    port = parseInt(args[0]);
    return port;
};

var port = server.findPort();
server.set('port', port);

server.run = function(config) {
    var port = server.findPort();

    finder.register(server, {
        path: config.routesPath
    });

    console.log('Server Run: listening in port', port);

    var app = server.listen(port, function() {
        debug('Express server listening on port' + app.address().port);
    });
};

server.get('/', function(req, res) {
    res.render('index', {
        title: 'FAKEful'
    });
});

/// catch 404 and forward to error handler
// server.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

/*
 * development error handler
 * will print stacktrace
 */
// if (server.get('env') === 'development') {
require('express-debug')(server, { /* settings */ });
server.use(require('express-chrome-logger'));

server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});
// }

/*
 * production error handler
 * no stacktraces leaked to user
 */
server.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = server;