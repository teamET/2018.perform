console.log("hello sakakendo");
var express=require("express");
var app=express();
var ejs=require("html");
/*
var ejs=require('ejs');
app.set('view engine', 'ejs');
*/
app.use(function (req, res, next) {
	console.log('Request URL:', req.originalUrl);
	console.log('Time:', Date.now());
	next();
});


app.get('/shop',function (req, res) {
	res.render('shop', { title: '模擬店を探す'});
});
app.get('/ivent',function (req, res) {
	res.render('ivent', { title: 'イベントタイムスケジュール'});
});
app.get('/',function (req, res) {
	res.render('top');
});