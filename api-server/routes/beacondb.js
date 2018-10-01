var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var connection = require('./mysqlConnection');

const INSERT = 'INSERT INTO BeaconData (BEACONID, MESSAGE, PLACE) VALUES ("{id}", "{msg}", "{place}")';
const UPDATE = 'UPDATE BeaconData SET MESSAGE = "{msg}" WHERE BEACONID = "{id}"';

/* MAIN */
router.post('/create', function(req, res, next) {
    var responce = "";
    res.status(200);
    res.send(responce);
});

router.post('/set', function(req, res, next) {
    var responce = "";
    res.status(200);
    res.send(responce);
});

router.get('/get', function(req, res, next) {
    var responce = "test";
    res.status(200);
    res.send(responce);
});

module.exports = router;