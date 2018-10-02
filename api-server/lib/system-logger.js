var fluentLogger = require('fluent-logger');

var levels = [
  'info',
  'debug',
  'warn',
  'error'
];

levels.forEach(function(level) {
  module.exports[level] = function(msg) {
    fluentLogger.emit('syslog.' + level, { message: msg });
  };
});
