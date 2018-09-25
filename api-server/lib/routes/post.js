var logger = require('../system-logger');
var EmptyResponse = require('../error-handler').EmptyResponse;

exports.index = function(req, res) {
  logger.info('this is info');
  res.send('Hello, world');
};

exports.create = function(req, res) {
  throw new Error('error is thrown!');
};

exports.show = function(req, res, next) {
  findPost(req.params.post, function(err, post) {
    if (err) { next(err); }
  });
};

function findPost(id, cb) {
  cb(new EmptyResponse('not found post: %d', id));
}
