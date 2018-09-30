var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var fluentLogger = require('express-fluent-logger');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(fluentLogger('td.test_db',{host: 'localhost', port: 24224, timeout: 3.0,responceHeaders:['X-userid']}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use(app.router);
//app.use(app.errorHandler());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/api',(req,res)=>{
    res.send('hello api');
});
app.get('/api/enquete',(req,res)=>{res.send('hello api');});
app.post('/api/enquete',(req,res)=>{res.send('hello api');});

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
