var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var fluentLogger = require('express-fluent-logger');

var linebot = require('./routes/linebot');
var beacon_db = require('./routes/beacondb');
var index = require('./routes/index');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(fluentLogger('td.test_db',{host: 'localhost', port: 24224, timeout: 3.0,responceHeaders:['X-userid'], enableReconnect: false}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//app.use(app.router);
//app.use(app.errorHandler());

app.use('/api/linebot', linebot);
app.use('/api/beacon', beacon_db);
//app.use('/api', apiRouter);
app.get('/api',(req,res)=>{res.send('hello api');});
app.use('/api/web', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
