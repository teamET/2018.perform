var express = require('express');
var router = express.Router();
let counter = 0;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { count: counter });
});

router.get('/counter', function(req, res, next) {
  counter++;
});

router.get('/movie', function(req, res, next) {
  res.send(String(counter));
});

module.exports = router;
