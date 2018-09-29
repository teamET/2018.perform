var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var fluentLogger = require('fluent-logger').configure('tag_prefix', {
  host: 'localhost',
  port: 24224,
  timeout: 3.0,
});
var logger = require('morgan');

var linebot = require('./routes/linebot');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//app.use(app.router);
//app.use(app.errorHandler());

app.use('/linebot', linebot);
//app.use('/api', apiRouter);
app.get('/api',(req,res)=>{res.send('hello api');});

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
