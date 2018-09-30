var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var request = require('request');
var connection = require('./mysqlConnection');

/* 環境変数 */
const channelSecret = "cf2ce152898f4d3465d1e5f2d3dd46e8";
const accessToken = "0dsdbxxcI/wkh1vXXjh+GxNqS1bFbVRYH4v0zWiKURT9qfK/Gn9huqMLB2/LyLzCf8q56GSJ809ankSwwf+35nE0hXZCizbw5+TLTZ2oH2l/4oHhhuHkEM8tK6SCDPcQREcaofZqeRMW5jbTbo8WigdB04t89/1O/w1cDnyilFU=";

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
function Build_msg_text(Token, messages) {
    return new Promise(function(resolve, reject) {
        var tmp_m = [];
        for(var i=0; i<message.length; i++) {
            tmp_m[i] = {
                "type": "text",
                "text": messages[i]
            };
        }
        var tmp = {
            "replyToken": Token,
            "messages": tmp_m
        };
        resolve(tmp);
    });
}

/* Type - message */
async function type_message(event) {
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, [event.message.text]
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
}

/* Type - follow */
async function type_follow(event) {
    var rich_url = urlp_rich_set.replace('{userId}', event.source.userId).replace('{richMenuId}', 'richmenu-b29e60fb9ff07712e58f5c4e9203b477');
    request.post(await Build_responce(rich_url), function(error, responce, body) {
        console.log(body);
    });
    var message = "東京高専文化祭BOTを友達登録してくれてありがとう！";
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, [message]
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
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, [usertype + "と認証しました"]
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
    //DBへユーザの追加
}

/* Type - Beacon */
async function type_beacon(event) {
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, ["ビーコン範囲に入りました"]
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
        if (value.type == "message"){
            console.log("message");
            type_message(value);
        } else if (value.type == "follow") {
            console.log("follow");
            type_follow(value);
        } else if (value.type == "postback") {
            console.log("postback");
            if (value.postback.data == "Student") {
                addUser(value, "学生");
            }else if(value.postback.data == "Other") {
                addUser(value, "来場者");
            }
        } else if (value.type == "beacon") {
            if (value.beacon.type == "enter") {
                type_beacon(value);
            }
        } else {
            console.log(value);
        }
    } else {
        //認証失敗
        console.log("line_NG");
        res.status(403);
    }
    console.log("end");
    res.send(responce);
});

module.exports = router;
