var logger = require('./system-logger');

module.exports = function() {
  return function(err, req, res, next) {
    if (err instanceof EmptyResponse) { res.status(404); }

    logger.error(err.message);

    res.send(('' + res.statusCode).match(/2\d{2}/) ? 500 : res.statusCode,
             'Something broken!');
  };
};
