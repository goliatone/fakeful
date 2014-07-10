/**
 * CORS middleware
 * @param  {Object} options Configuration object.
 * @return {Function}       Express like middleware.
 */
module.exports = function(options) {
    console.log('Middleware: initialize CORS support');
    options || (options = {
        domains: '*'
    });
    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', options.domains);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // intercept OPTIONS method
        if ('OPTIONS' == req.method) res.send(204);
        else next();
    };
    return allowCrossDomain;
};