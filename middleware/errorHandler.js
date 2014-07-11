/**
 * Error handler middle ware
 * error handling middleware have an arity of 4
 * instead of the typical (req, res, next),
 * otherwise they behave exactly like regular
 * middleware, you may have several of them,
 * in different orders etc.
 *
 * @param  {Object} options Configuration object.
 * @return {Function}       Express like middleware.
 */
module.exports = function(options) {
    console.log('∆ Middleware: initialize ERROR support');

    var errorHandler = function(err, req, res, next) {
        // log it
        console.error(err.stack);

        // respond with 500 "Internal Server Error".
        res.send(500);
    };
    return errorHandler;
};