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
    //bodyの受け取り
    var body = req.body;
    var query = INSERT.replace("{id}", body.beaconid)
        .replace("{msg}", body.message)
        .replace("{place}", body.place);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
    res.status(200);
    res.send(responce);
});

router.post('/set', function(req, res, next) {
    var responce = "";
    //bodyの受け取り
    var body = req.body;
    var query = UPDATE.replace("{msg}", body.message)
        .replace("{id}", body.beaconid);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
    res.status(200);
    res.send(responce);
});

router.get('/get', function(req, res, next) {
    var responce = "test";
    res.status(200);
    res.send(responce);
});

module.exports = router;