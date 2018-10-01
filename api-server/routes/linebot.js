var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var request = require('request');
var moment = require('moment');
const dialogflow = require("dialogflow");
var connection = require('./mysqlConnection');

/* 環境変数 */
const channelSecret = "cf2ce152898f4d3465d1e5f2d3dd46e8";
const accessToken = "0dsdbxxcI/wkh1vXXjh+GxNqS1bFbVRYH4v0zWiKURT9qfK/Gn9huqMLB2/LyLzCf8q56GSJ809ankSwwf+35nE0hXZCizbw5+TLTZ2oH2l/4oHhhuHkEM8tK6SCDPcQREcaofZqeRMW5jbTbo8WigdB04t89/1O/w1cDnyilFU=";
const GOOGLE_PROJECT_ID = "kufes-2018";
const GOOGLE_CLIENT_EMAIL = "dialogflow-qulnmn@kufes-2018.iam.gserviceaccount.com";
const GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC5NHF7eqbHOyIU\nJIhQJ81rO/C+lxIFMY9VCugm04tUwgvEakK48TMzTNxmFB89MN8jvkCPFHSMuW5A\nNTQNwai2y6kASQVQmHtRBTYaN316NulGcUkhg9ORgSOAuB/VUHqDyHgDUjRFknj4\n0efJpw9ECkxzXP2e0rz/T72By9JxSxkoRq6x4N5k1v4Jr3+J8rHG8D4pZRxZ+olc\nhXdJrPv8QZ56o+TDBywYZHN40zStH+r8QocTPpO+tloegNmjyGZUkAQN8qAMNhyi\niTr6H8yHXrFhihDhtKlR3YHC0b9ON9euUPblU8hdqoGC0ZP+cPrry7BAFyumWJ1v\nR5GgmRTxAgMBAAECggEACmZHeQeKFeXcJAVpIhcaEctr2UfiWyhNRBk4r/Vw/XFn\n979/v6LLnTXTqme22VjFLtygA2jCoqRG7JQQODWHo7wL4Vg4VC47vnDseMxk31f2\nAV6bHKaqWqFFvRSZtQCv4HaBRq53APEYmeAvg8M9uDRb1p6CH0j2E+AGZCNtza6x\nXEFU5va8dc6dcIZcRU7MgpWleZM54MLvffImAosNRSiEtbPqg/YUN/39bybmD9l/\noQBpyfd97oFi4VYsQkthfJ52WZg/RlWG44s/WWe/wL8WWftiIRWylLYwfJjPVtuZ\nRslJm1x6JuU1ATM69RNzbk7HIsvQopZUEg5Kg5p4AQKBgQDmwc0LBtocf3N6QkYA\ntIqNLEi3gkveUFgOjl8nPpT1t8JfW7WzBg3Dfox4V8y0xuqqcx1nyXLj87Hs51t0\nyVPRq5XgNC8gSCaPitRWRu2KIEHy7mQVIXwtSWykekd+KpTaGmlxHoOx67TW6mS7\nJHh8oC81bmSUXZiehRAiVpaXyQKBgQDNdvvI7zm4Hn8dcFSSDoPXtTepNhNv2OHn\n0nza2O7a2CEQfypIkGlBx1MmvIzQrpYfhup+SbTgWYjIS6oDbfVuQpSlhCgrRfPr\nEf4nKK9lbd8IZI7hSJScsz1NgcWHSLghB3uHrecT/AWIwiXhLY9GhVX6taqPmqF6\n/hZIM2b36QKBgQCL+JhwjNp2mNSqH1MpEFpOocMGFTICCwgu5CtRucNPfQSZJR8F\nFbH5mGSKhu9z5IjplWQL1YUsQmD1y6yNHaYLM6J42g6P7VP+k/6SyvlBZKm8OuBY\ndPRG4BfXeRiurhOWbJjy9ch6fvg1uP4bCldPeTbJmUnHOTLfTOVpfs5gCQKBgFu8\nbSzIyt+PFjhBqDDSNEGCUsjFMSZ2El8cFszroLGrYA/qhymA+M36vgCEnOarnLGU\n3mvmYtDsiOrNBaqkVLmXFqFUAU9Y21AwZ2Z6ft1tkfBAXZ7udhQE3zEU6Om/KR7u\nJVRt68d7dckazijc26Sj8cCPjgiyBLlSawZvlODJAoGBALYo35VcRb5FIqF/Kmuj\nW4/pj6MkXK2OPhmPYCTJVkDUJo6EAZhX+/6UlJ2bkhomLujH/YeXwAF9Z/ABFLZz\nzFeR7r6Bh+dhnFq8/63SKwV9mfCpsREMpLarNajITKqu4szANjuuiy3iZyKe2qeD\n9hv5A9oLL+Mq3rLhnCvq7SF4\n-----END PRIVATE KEY-----\n";

//dialogflow
const session_client = new dialogflow.SessionsClient({
    project_id: GOOGLE_PROJECT_ID,
    credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});

/* LINE MessagingAPI URL */
//URL POST
const urlp_reply = "https://api.line.me/v2/bot/message/reply";
const urlp_rich_set = "https://api.line.me/v2/bot/user/{userId}/richmenu/{richMenuId}";
//LINE URL GET
const urlg_download_message = "https://api.line.me/v2/bot/message/{messageId}/content";
//LINE URL DELETE
const urld_rich_delete = "https://api.line.me/v2/bot/user/{userId}/richmenu";

/* responceの作成.全てこれを介す. */
function Build_responce(url, res_body) {
    return new Promise(function(resolve, reject) {
        var tmp = {
            url: url,
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        };
        if (res_body) {
            tmp.json = res_body;
        }
        resolve(tmp);
    });
}

/* メッセージの作成 */
function Build_msg_text(Token, message1, message2, message3, message4, message5) {
    return new Promise(function(resolve, reject) {
        var tmp = {
            "replyToken": Token,
            "messages": []
        };
        if (message1) {
            tmp.messages.push(message1);
            if (message2) {
                tmp.messages.push(message2);
                if (message3) {
                    tmp.messages.push(message3);
                    if (message4) {
                        tmp.messages.push(message4);
                        if (message5) {
                            tmp.messages.push(message5);
                        }
                    }
                }
            }
        }
        resolve(tmp);
    });
}

/* テンプレートメッセージの作成
function Build_msg_template(Token) {
    return new Promise(function(resolve, reject) {
    });
}*/

/* Type - message */
async function type_message(event) {
    query = 'SELECT BEACONTIME FROM UserData WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId);
    connection.query(query, function(err, rows) {
        var msg2 = {
            "type": "text",
            "text": rows[0].BEACONTIME
        };
    });
    // Dialogflowへの接続
    var msg = {
        "type": "text",
        "text": event.message.text
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg, msg2
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
}

/* Type - follow */
async function type_follow(event) {
    var rich_url = urlp_rich_set.replace('{userId}', event.source.userId)
        .replace('{richMenuId}', 'richmenu-b29e60fb9ff07712e58f5c4e9203b477');
    request.post(await Build_responce(rich_url), function(error, responce, body) {
        console.log(body);
    });
    var msg = {
        "type": "text",
        "text": "東京高専文化祭BOTを友達登録してくれてありがとう！"
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
}

async function addUser(event, usertype) {
    var rich_url = urld_rich_delete.replace('{userId}', event.source.userId);
    request.delete(await Build_responce(rich_url), function(error, responce, body) {
        console.log(body);
    });
    var msg = {
        "type": "text",
        "text": usertype + "と認証しました"
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
    //DBへユーザの追加
    var nowtime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = 'INSERT INTO UserData (USERID, USERTYPE, BEACONTIME) VALUES ("{id}", "{type}", "{time}")';
    query = query.replace('{id}', event.source.userId)
        .replace('{type}', event.postback.data)
        .replace('{time}', nowtime);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
}

function removeUser(event) {
    console.log("remove");
    var query = 'DELETE FROM UserData WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
}

/* Type - Beacon */
async function type_beacon(event) {
    var nowtime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = 'UPDATE UserData SET BEACONTIME = "{time}" WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId)
        .replace("{time}", nowtime);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
    query = 'SELECT MESSAGE FROM BeaconData WHERE BEACONID = "{id}"'
        .replace("{id}", event.beacon.hwid);
    connection.query(query, function(err, rows) {
        console.log("select: " + rows);
    });
    var msg = {
        "type": "text",
        "text": "ビーコン範囲に入りました"
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
    //DB処理が入る
}



/* MAIN */
router.post('/', function(req, res, next) {
    var responce = "";
    /* LINE認証 */
    const body = req.body; // Request body string
    const signature = crypto
        .createHmac('SHA256', channelSecret)
        .update(JSON.stringify(body)).digest('base64');
    if (req.header("x-line-signature") == signature) {
        //認証成功
        res.status(200);
        console.log("line_OK");
        var value = body.events[0];
        body.events.forEach((event) => {
            switch(event.type) {
                case "message":
                    console.log("message");
                    type_message(event);
                    break;
                case "follow":
                    console.log("follow");
                    type_follow(event);
                    break;
                case "postback":
                    console.log("postback");
                    if (event.postback.data == "Student") {
                        addUser(event, "学生");
                    } else if (event.postback.data == "Other") {
                        addUser(event, "来場者");
                    }
                    break;
                case "beacon":
                    console.log("beacon");
                    if (event.beacon.type == "enter") {
                        type_beacon(event);
                    }
                    break;
                case "unfollow":
                    console.log("unfollow");
                    removeUser(event);
                    break;
                default:
                    console.log(event);
                    break;
            }
        });
    } else {
        //認証失敗
        console.log("line_NG");
        res.status(403);
    }
    console.log("end");
    res.send(responce);
});

module.exports = router;
