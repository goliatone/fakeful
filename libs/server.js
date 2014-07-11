var express = require('express'),
    methodOverride = require('method-override'),
    cors = require('../middleware/cors'),
    routes = require('../routes'),
    server = express();

console.log("***************************");
console.log("time: ", new Date());

/*
 * Serve all assets in public directory.
 */

server.use(methodOverride());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded());
server.use(express.static(__dirname + '/public/'));
server.use(express.directory(__dirname + '/public/'));
server.use(server.router);

server.use(error);

// error handling middleware have an arity of 4
// instead of the typical (req, res, next),
// otherwise they behave exactly like regular
// middleware, you may have several of them,
// in different orders etc.
function error(err, req, res, next) {
    // log it
    console.error(err.stack);

    // respond with 500 "Internal Server Error".
    res.send(500);
}

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
    routes(server);
    console.log('Server Run: listening in port', port);
    server.listen(port);
};

server.get('/', function(req, res, next) {

    res.json({
        success: true,
        count: 40,
        data: {
            message: "hola mundito!"
        }
    });
});



module.exports = server;