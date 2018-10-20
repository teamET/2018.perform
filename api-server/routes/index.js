var express = require('express');
var router = express.Router();
let fs = require("fs");
let counter = 0;

setInterval(function() {
  let st = fs.readFileSync("./router/count.txt");
  let oldnum = +st;
  if (oldnum < counter) {
    fs.writeFile("./routes/count.txt", counter+"", function(err) {
      if (err) {
        console.log(err);
      }
    });
  } else if (oldnum > counter) {
    counter += oldnum;
    fs.writeFile("./routes/count.txt", counter+"", function(err) {
      if (err) {
        console.log(err);
      }
    });
  }
}, 5*1000);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { count: counter });
});

router.get('/counter', function(req, res, next) {
  counter++;
  res.send("Thank you!");
});

router.get('/movie', function(req, res, next) {
  res.send(counter + "");
});

router.get('/reset', function(req, res, next) {
  counter = 0;
  fs.writeFile("./routes/count.txt", counter+"", function(err) {
    if (err) {
      console.log(err);
    }
  });
  res.send("reset ok");
});

module.exports = router;
