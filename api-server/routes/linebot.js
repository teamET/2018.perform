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


/* json fileの読み込み */
var richdata = JSON.parse(fs.readFileSync('./routes/rich.json', 'utf8'));
var shop_area = JSON.parse(fs.readFileSync('./routes/shop-area.json', 'utf8'));
var shop_data = JSON.parse(fs.readFileSync('../bot/shop.json', 'utf8'));

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

/* テンプレートメッセージの作成 */
function Build_msg_template(area) {
    return new Promise(function(resolve, reject) {
        var returnText = {
            "type": "template",
            "altText": "This is the template message.",
            "template": []
        };
        shop_area[area].forEach((shopname) => {
            var value = shop_data[shopname];
            var name = shopname;
            var goods_name = value.goods.name;
            var goods_yen = value.goods.choco;
            var image = value.image;
        });
    });
}

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

/* richmenuの切り替え */
async function rich_change(after, userId) {
    var rich_url = urld_rich_delete.replace("{userId}", userId);
    var rich_url2 = urlp_rich_set.replace("{userId}", userId)
        .replace("{richMenuId}", after);
    var tmp = await Build_responce(rich_url2)
    request.delete(await Build_responce(rich_url), function(error, responce, body) {
        request.post(tmp);
    });
}

/* Type - message */
async function type_message(event) {
    // Dialogflowへの接続今のところしない
    var msg = {"type": "text"};
    var msg2 = undefined;
    switch(event.message.text) {
        case "a":
            msg.text = "ご意見ご感想ふぉーむへ誘導";
            break;
        case "b":
            var from = moment(await DB_get("UserData", "BEACONTIME", "USERID", event.source.userId));
            var now = moment();
            msg.text = "差分は" + now.diff(from)/(1000*60);
            break;
        case "c":
            var userplace = await DB_get("UserData", "PLACE", "USERID", event.source.userId);
            if (userplace == "") {
                msg.text = "近くに模擬店がないみたい...\n移動してからもう一度試してください";
            } else {
                //userplaceの場所に合う模擬店をjson or htmlから引っ張ってきてテンプレートメッセージにする
                msg.text = userplace + "にいるから近くの模擬店を取得";
            }
            break;
        case "map":
            msg.text = "mapを表示します";
            type_image();
            break;
        default:
            msg.text = "個別の返信はできません(*:△:)";
            break;
    }
    if (msg.text) {
        var tmp = await Build_responce(urlp_reply, await Build_msg_text(
            event.replyToken, msg, msg2
        ));
        request.post(tmp);
    }
}

/* Type - follow */
async function type_follow(event) {
    //rich menuの登録
    var rich_url = urlp_rich_set.replace('{userId}', event.source.userId)
        .replace('{richMenuId}', richdata.start);
    request.post(await Build_responce(rich_url));
    var msg = {
        "type": "text",
        "text": "東京高専文化祭BOTを友達登録してくれてありがとう！"
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg
    ));
    request.post(tmp);
}

async function addUser(event, usertype) {
    //DBへユーザの追加
    var nowtime = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = 'INSERT INTO UserData (USERID, USERTYPE, BEACONTIME, PLACE) VALUES ("{id}", "{type}", "{time}", "{place}")';
    query = query.replace('{id}', event.source.userId)
        .replace('{type}', event.postback.data)
        .replace('{time}', nowtime)
        .replace('{place}', "");
    connection.query(query);
    //richmenuの切り替え
    rich_change(richdata.normal, event.source.userId);
    var msg = {
        "type": "text",
        "text": usertype + "と認証しました"
    };
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, msg
    ));
    request.post(tmp);
}

/* Type - unfolow */
function removeUser(event) {
    var query = 'DELETE FROM UserData WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId);
    connection.query(query);
}

/* Type - Beacon */
async function type_beacon(event) {
    /* beacon侵入時間の更新 */
    var tmp = DB_get("UserData", "BEACONTIME", "USERID", event.source.userId);
    var now = moment();
    var nowtime = now.format('YYYY-MM-DD HH:mm:ss');
    var db_time = moment(await tmp);
    var db_place = DB_get("BeaconData", "PLACE", "BEACONID", event.beacon.hwid);
    if ((now.diff(db_time)/(1000*60)) >= 7 ) {
        var query = 'UPDATE UserData SET BEACONTIME = "{time}" WHERE USERID = "{id}"'
            .replace("{id}", event.source.userId)
            .replace("{time}", nowtime);
        connection.query(query);
        var db_msg = DB_get("BeaconData", "MESSAGE", "BEACONID", event.beacon.hwid);
        var msg = {
            "type": "text",
            "text": "現在，" + await db_place + "にいます"
        };
        var msg2 = {
            "type": "text",
            "text": "おしらせ\n" + await db_msg
        };
        var tmp = await Build_responce(urlp_reply, await Build_msg_text(
            event.replyToken, msg, msg2
        ));
        request.post(tmp);
    }
    var query = 'UPDATE UserData SET PLACE = "{place}" WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId)
        .replace("{place}", await db_place);
    connection.query(query);
    if (db_place == "taiikukan") {
        rich_change(richdata.event, event.source.userId);
    }

}

/* 体育館退出用 */
async function beacon_leave(event) {
    var db_place = await DB_get("BeaconData", "PLACE", "BEACONID", event.beacon.hwid);
    var query = 'UPDATE UserData SET PLACE = "{place}" WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId)
        .replace("{place}", "");
    connection.query(query);
    if (db_place == "taiikukan") {
        rich_change(richdata.normal, event.source.userId);
    }
}

/* 画像送信用 */
async function type_image(){
    var imgMsg = {
        "type": "imagemap",
        "baseUrl": "https://avatars0.githubusercontent.com/u/28134110?s=200&v=4",
        "altText": "This is an imagemap",
        "baseSize": {
            "height": 1040,
            "width": 1040
        },
        "actions": [
            {
                "type": "uri",
                "linkUri": "https://google.com",
                "area": {
                    "x": 0,
                    "y": 0,
                    "width": 520,
                    "height": 1040
                }
            },
            {
                "type": "message",
                "text": "Hello",
                "area": {
                    "x": 520,
                    "y": 0,
                    "width": 520,
                    "height": 1040
                }
            }
        ]
      }
    var tmp = await Build_responce(urlp_reply, await Build_msg_text(
        event.replyToken, imgMsg
    ));
    request.post(tmp);
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
                    type_message(event);
                    break;
                case "follow":
                    type_follow(event);
                    break;
                case "postback":
                    if (event.postback.data == "Student") {
                        addUser(event, "学生");
                    } else if (event.postback.data == "Other") {
                        addUser(event, "来場者");
                    }
                    break;
                case "beacon":
                    if (event.beacon.type == "enter") {
                        type_beacon(event);
                    } else if (event.beacon.type == "leave") {
                        beacon_leave(event);
                    }
                    break;
                case "unfollow":
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
    res.send(responce);
});

module.exports = router;
