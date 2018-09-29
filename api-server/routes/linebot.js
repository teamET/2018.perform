var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var request = require('request');


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

/* GET home page. */
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
        //以下デバッグ用
        console.log("line_OK");
        const event = body.events[0];
        if (event.type == "message"){
            request.post({
                url: urlp_reply,
                headers: {
                    "Authorization": "Bearer " + accessToken
                },
                json: {
                    "replyToken": event.replyToken,
                    "messages": [
                        {
                            "type": "text",
                            "text": event.message.text
                        }
                    ]
                }
            }, function (error, response, body){
                context.log(body);
            });
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
