var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var connection = require('./mysqlConnection');

const channelSecret = process.env.channelSecret;

const INSERT = 'INSERT INTO BeaconData (BEACONID, MESSAGE, PLACE) VALUES ("{id}", "{msg}", "{place}")';
const UPDATE = 'UPDATE BeaconData SET MESSAGE = "{msg}" WHERE PLACE = "{place}"';
const U = 'UPDATE BeaconData SET MESSAGE = "{msg}" WHERE PLACE IS NOT NULL'

/* MAIN */
router.post('/create', function(req, res, next) {
    //bodyの受け取り
    var body = req.body;
    var query = INSERT.replace("{id}", body.beaconid)
        .replace("{msg}", body.message)
        .replace("{place}", body.place);
    console.log(query);
    connection.query(query, function(err, rows) {
        console.log(rows);
        if (err) {
            res.status(403);
            res.send(err);
        } else {
            res.status(200);
            res.send(rows);
        }
    });
});

router.post('/update', function(req, res, next) {
    //bodyの受け取り
    if (req.key == channelSecret) {
        var body = req.body;
        var query = UPDATE.replace("{msg}", body.message)
            .replace("{place}", body.place);
        if (body.place == "ALL") {
            query = U.replace("{msg}", body.message);
        }
        connection.query(query, function(err, rows) {
            console.log(rows);
            if (err) {
                res.status(403);
                res.send(err);
            } else {
                res.status(200);
                res.send(rows);
            }
        });
    }
    res.status(114514);
    res.send('nk');
});

router.post('/delete', function(req, res, next) {
    var query = 'DELETE FROM BeaconData WHERE BEACONID = "{id}"'
        .replace("{id}", req.body.beaconid);
    connection.query(query, function(err, rows) {
        if (err) {
            res.status(403);
            res.send(err);
        } else {
            res.status(200);
            res.send(rows);
        }
    });
});

router.get('/get', function(req, res, next) {
    var query = "SELECT * FROM BeaconData";
    connection.query(query, function(err, rows) {
        if (err) {
            res.status(403);
            res.send(err);
        } else {
            var msg = [];
            for(var i=0; i<rows.length; i++) {
                var tmp = {
                    "beaconid": rows[i]["BEACONID"],
                    "message": rows[i]["MESSAGE"],
                    "place": rows[i]["PLACE"]
                };
                msg.push(tmp);
            }
            res.status(200);
            res.send(msg);
        }
    })
});

module.exports = router;
