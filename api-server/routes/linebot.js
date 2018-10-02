var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var request = require('request');
var moment = require('moment');
var fs = require('fs');
var cheerio = require('cheerio-httpcli');
const dialogflow = require("dialogflow");
var connection = require('./mysqlConnection');

/* 環境変数 */
const channelSecret = process.env.channelSecret;
const accessToken = process.env.accessToken;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

//dialogflow
const session_client = new dialogflow.SessionsClient({
    project_id: GOOGLE_PROJECT_ID,
    credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});

var richdata = JSON.parse(fs.readFileSync('./routes/rich.json', 'utf8'));

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

async function DB_get(table, col, where, id) {
    return new Promise(function(resolve, reject) {
        var query = 'SELECT {col} FROM {table} WHERE {where} = "{id}"'
            .replace("{table}", table)
            .replace("{col}", col)
            .replace("{where}", where)
            .replace("{id}", id);
        connection.query(query,function(err, rows) {
            resolve(rows[0][col]);
        })
    });
}

/* Type - message */
async function type_message(event) {
    // Dialogflowへの接続
    var msg = {"type": "text"};
    switch(event.message.text) {
        case "a":
            msg.text = "さてはお前...aを押したな";
            break;
        case "b":
            msg.text = "登録時間は" + await DB_get("UserData", "BEACONTIME", "USERID", event.source.userId);
            break;
        case "c":
            msg.text = "";
            break;
        default:
            break;
    }
    if (msg.text) {
        var tmp = await Build_responce(urlp_reply, await Build_msg_text(
            event.replyToken, msg
        ));
        request.post(tmp, function(error, responce, body) {
            console.log(body);
        });
    }
}

/* Type - follow */
async function type_follow(event) {
    //rich menuの登録
    var rich_url = urlp_rich_set.replace('{userId}', event.source.userId)
        .replace('{richMenuId}', richdata.start);
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
    //DBへユーザの追加
    var nowtime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = 'INSERT INTO UserData (USERID, USERTYPE, BEACONTIME) VALUES ("{id}", "{type}", "{time}")';
    query = query.replace('{id}', event.source.userId)
        .replace('{type}', event.postback.data)
        .replace('{time}', nowtime);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
    //rich menuの削除
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
    rich_url = urlp_rich_set.replace("{userId}", event.source.userId)
        .replace("{richMenuId}", richdata.normal);
    request.post(await Build_responce(rich_url), function(error, responce, body) {
        console.log(body);
    });
}

/* Type - unfolow */
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
    /* beacon侵入時間の更新
       本来は指定分以内になんども通知が来ないように設定するべき */
    var nowtime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = 'UPDATE UserData SET BEACONTIME = "{time}" WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId)
        .replace("{time}", nowtime);
    connection.query(query, function(err, rows) {
        console.log(rows);
    });
    var db_msg = DB_get("BeaconData", "MESSAGE", "BEACONID", event.beacon.hwid);
    var db_place = DB_get("BeaconData", "PLACE", "BEACONID", event.beacon.hwid);
    var msg = {
        "type": "text",
        "text": "現在，" + await db_place + "にいます"
    };
    var msg2 = {
        "type": "text",
        "text": await db_msg
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg, msg2
    ));
    request.post(tmp, function(error, responce, body) {
        console.log(body);
    });
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
