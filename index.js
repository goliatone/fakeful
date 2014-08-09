var server = require('./libs/server');

// server.use(server.express.static(__dirname + '/public/'));
// server.use(server.express.directory(__dirname + '/public/'));
server.run({
    dirname: __dirname + '/public',
    routesPath: __dirname + '/routes'
});