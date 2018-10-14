var express = require('express');
var router = express.Router();
const crypto = require('crypto');
var request = require('request');
var moment = require('moment');
var fs = require('fs');
var cheerio = require('cheerio-httpcli');
const dialogflow = require("dialogflow");
const dropboxV2Api = require('dropbox-v2-api');
var connection = require('./mysqlConnection');

/* 環境変数 */
const channelSecret = process.env.channelSecret;
const accessToken = process.env.accessToken;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const dropbox = process.env.dropbox;

//dialogflow
const session_client = new dialogflow.SessionsClient({
    project_id: GOOGLE_PROJECT_ID,
    credentials: {
        client_email: GOOGLE_CLIENT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    }
});

//DropBox
const dbx = dropboxV2Api.authenticate({
    token: dropbox
});

/* json fileの読み込み */
const flex_tmp = require("./flex_template.json");
const flex_item = require("./flex_item.json");
const flex_image = require("./shop-map.json");
var richdata = JSON.parse(fs.readFileSync('./routes/rich.json', 'utf8'));
var shop_area = JSON.parse(fs.readFileSync('./routes/shop-area.json', 'utf8'));
var map_data  = JSON.parse(fs.readFileSync('./routes/mapdata.json','utf8'));
var shop_data = JSON.parse(fs.readFileSync('../bot/data/shop.json', 'utf8'));
var boothID_data   = JSON.parse(fs.readFileSync('./routes/boothID.json','utf8'));
var laboFlex_tmpdata = JSON.parse(fs.readFileSync('./routes/flex_labo.json'));
var labo_data = JSON.parse(fs.readFileSync('./routes/labodata.json'));

/* LINE MessagingAPI URL */
//URL POST
const urlp_reply = "https://api.line.me/v2/bot/message/reply";
const urlp_rich_set = "https://api.line.me/v2/bot/user/{userId}/richmenu/{richMenuId}";
const urlp_push = "https://api.line.me/v2/bot/message/multicast";
//LINE URL GET
const urlg_download_message = "https://api.line.me/v2/bot/message/{messageId}/content";
//LINE URL DELETE
const urld_rich_delete = "https://api.line.me/v2/bot/user/{userId}/richmenu";

/**
 * LINEに渡すBodyを生成する
 * @param  {string} url LINE MessagingAPI エンドポイントを指定
 * @param  {obj} [res_body] Build_msg_textの返り値を指定
 * @return {obj} LINEにPOSTするJson Body
 */
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

/**
 * LINEのmessageオブジェクトを生成する -> Build_responceに渡す
 * @param  {} Token - replyToken
 * @param  {} message1 
 * @param  {} [message2]
 * @param  {} [message3]
 * @param  {} [message4]
 * @param  {} [message5]
 */
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

/**
 * 模擬店のflexを作成する
 * @param  {string} shopid ショップid
 * @return {obj} Bulid_msg_textに渡す
 */
function Build_flex(shopid) {
    var data = shop_data[shopid];
    var tmp = flex_tmp;
    tmp.header.contents[0].text = data.shopname;
    tmp.hero.url = data.image[0];
    tmp.footer.contents[2].url = flex_image[shopid];
    for (var i=0; i<data.goods.length; i++) {
        var goodjson = data.goods[i];
        var g = flex_item;
        g.contents[0].text = goodjson.name;
        g.contents[1].text = goodjson.price + "円";
        tmp.body.contents.push(g);
    }
    return tmp;
}
/**
 * 研究室のFlexデータを作成する
 * @param {string} laboid 研究室ID
 * @return {obj} tmp 研究室のFlexデータ(ひとつだけ。bubbleを返す)
 */
function Build_LaboFlex_Bubble(laboid){
    // JSONの参照私を値渡しにする
    var tmp = JSON.parse(JSON.stringify(laboFlex_tmpdata.tmp));
    tmp.body.contents[3].contents = []; // 初期化
    // 室内番号・詳細・タイトル
    tmp.body.contents[0].contents[0].text = labo_data[laboid].floor;
    if(labo_data[laboid] == "3208・3223") tmp.body.contents[0].contents[0].align = "center";
    else tmp.body.contents[0].contents[0].align = "start";
    tmp.body.contents[0].contents[1].text = labo_data[laboid].floorText;
    tmp.body.contents[1].text = labo_data[laboid].title;
    tmp.body.contents[1].size = labo_data[laboid].titleSize;
    // 日付・実施時間
    for(var i=0;i<labo_data[laboid].datetime.length;i++){
        var date = JSON.parse(JSON.stringify(laboFlex_tmpdata.dateTmp));
        date.contents[1].text = labo_data[laboid].datetime[i].date;
        tmp.body.contents[3].contents.push(date);
        var times = JSON.parse(JSON.stringify(laboFlex_tmpdata.timesTmp));
        for(var j=0;j<labo_data[laboid].datetime[i].times.length;j++){
            var time = JSON.parse(JSON.stringify(laboFlex_tmpdata.timeTmp));
            time.text = labo_data[laboid].datetime[i].times[j];
            times.contents[1].contents.push(time);
        }
        tmp.body.contents[3].contents.push(times);
        var separator = laboFlex_tmpdata.separator;
        tmp.body.contents[3].contents.push(separator);
    }
    // 補足情報
    tmp.body.contents[4].text = labo_data[laboid].supplementation;
    return tmp;
}

/**
 *Numで指定する選択肢のボタンflexを作成する
 * @param {int}   Num   // 選択肢の個数
 * @param {str[]} text  // それぞれの選択肢で指定する文字列
 * @return {obj} flex message (Button)
 */
function Build_flexButton(texts){
    var tmp = {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
            ]
        }
    }
    for(i=0;i<texts.length;i++){
        var addtmp = {
            "type": "button",
            "style": "primary",
            "action": {
                "type":"message",
                "label":texts[i],
                "text":texts[i]
             }
        }
        tmp.body.contents.push(addtmp);
    }
    return tmp;
}

/**
 * データベースからデータ取得
 * @param  {string} table テーブル名
 * @param  {string} col 取得したい列名
 * @param  {string} where 検索する列名
 * @param  {string} id キー
 * @return {string} 検索した結果
 */
function DB_get(table, col, where, id) {
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

/**
 * リッチメニューの切り替え
 * @param  {string} after 切り替え後のリッチメニューId（richdata）
 * @param  {string} userId 切り替えるユーザId
 */
async function rich_change(after, userId) {
    var rich_url = urld_rich_delete.replace("{userId}", userId);
    var rich_url2 = urlp_rich_set.replace("{userId}", userId)
        .replace("{richMenuId}", after);
    var tmp = await Build_responce(rich_url2)
    request.delete(await Build_responce(rich_url), function(error, responce, body) {
        request.post(tmp);
    });
}

/**
 *  テキストメッセージの生成
 * @param {String} text テキストデータ
 * @return {obj}   msg  テキストメッセージ
 */
function msg_text(text){
    var msg = {"type": "text"};
    msg.text = text;
    return msg;
}

/**
 * イメージマップメッセージの生成
 * @param {string} usage 用途(map)
 * @param {obj}    data  用途に対応するデータ
 * @return {obj}   msg  イメージマップメッセージ
 */
function msg_imagemap(usage,data){
    var msg = {"type":"imagemap"};
    if(usage == "map"){
        var location = map_data[data.location];
        msg.baseUrl  = location.baseUrl;
        msg.altText  = location.altText;
        msg.baseSize = location.baseSize;
        msg.actions  = location.actions;
        // console.log(msg);
    }
    return msg;
}

async function image_download(event) {
    let url = urlg_download_message.replace("{messageId}", event.message.id);
    let tmp = DB_get("UserData", "USERTYPE", "USERID", event.source.userId);
    let option = await Build_responce(url);
    option.encoding = null;
    let nowtime = moment().format('HH:mm:ss:SSS');
    let usertype = await tmp;
    request.get(option, function(err, res, body) {
        if(err) {
            console.log(body);
        } else {
            let path = "/kufes18/" + usertype + "/" +nowtime+ ".png"
            fs.writeFileSync("../" + nowtime + ".png", body, "binary");
            dbx({
                resource: 'files/upload',
                parameters: {
                    path: path
                },
                readStream: fs.createReadStream("../" + nowtime + ".png")
            }, (err, result, response) => {
                //upload completed
                fs.unlink("../" + nowtime + ".png",  function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }
    });
}

/**
 * Event - messageの時のおおもと
 * 基本的にlineへのレスポンスはここで行う
 * @param  {obj} event LINEからのBody
 */
async function type_message(event) {
    // Dialogflowへの接続今のところしない
    var msg  = undefined;
    var msg2 = undefined;
    var msg3 = undefined;
    var msg4 = undefined;
    var msg5 = undefined;
    var mapdata  = new Object(); // mapの場所データなど
    // [エリア][ピンの番号]([][0] : エリア名)
    var OutsideArea =  [["A",1,2,3,4,5],
                        ["B",1,2,3,4],
                        ["C",1,2],
                        ["D",1,2,3,4,5,6,7,8],
                        ["E",1,2,3,4,5,6],
                        ["F",1,2,3]];
    // [棟][各階にあるのピンの数]]([][0] : 棟の数)
    // 8棟は1，3階だが、プログラム内では1,2階として処理する。
    var mapBFdata  = [[2,3,3,5,0],
                      [3,2,3,3,4],
                      [5,1,2],
                      [8,1,1]];
    switch(event.message.text) {
        case "近くの模擬店を探す":
            var userplace = await DB_get("UserData", "PLACE", "USERID", event.source.userId);
            if (userplace == "" || userplace == "hazama" || userplace == "joho") {
                msg = msg_text("近くに模擬店がないみたい...\n移動してからもう一度試してください");
            } else {
                //userplaceの場所に合う模擬店をjson or htmlから引っ張ってきてテンプレートメッセージにする
                msg = {
                    "type": "flex",
                    "altText": "This is a flex message.",
                    "contents": {
                        "type": "carousel",
                        "contents": []
                    }
                };
                for (var i=0; i<shop_area[userplace].length; i++) {
                    var shopid = shop_area[userplace][i];
                    msg.contents.contents.push(Build_flex(shopid));
                }
            }
            break;
        case "マップを表示":
            //mapdata.location = "Top";
            //msg = msg_imagemap("map",mapdata);
            msg = {
                "type": "flex",
                "altText":  "TOP",
                "contents": {}
            };
            var buttonTexts = ["[Top] 構外全体マップへ","[Top] 構内全体マップへ"];
            msg.contents = Build_flexButton(buttonTexts);
            break;
        case "[Top] 構内全体マップへ":
            mapdata.location = "InsideTop";
            msg = msg_imagemap("map",mapdata);
            msg2 = msg_text("棟を選択してください");            
            break;
        case "[Top] 構外全体マップへ":
            mapdata.location = "OutsideTop";
            msg = msg_imagemap("map",mapdata);
            msg2 = msg_text("エリアを選択してください");
            break;
        case "7棟の情報を表示":
            msg = {
                "type": "flex",
                "altText": "7棟の研究室情報",
                "contents": {
                    "type": "carousel",
                    "contents": []
                }
            };
            for (var i=17; i<= 23; i++) {
                console.log("labo"+i);
                msg.contents.contents.push(Build_LaboFlex_Bubble("labo"+i));
            }
            break;
        case "labo9":
            msg = msg_text(labo_data[laboid].floor);
            break;
        default:
            msg = msg_text("個別の返信はできません(*:△:)");
            break;
    }

    /***** イメージマップタップ時の出力判定 *****/
    // [1] 構外マップ
    for(var i=0;i<OutsideArea.length;i++){
        for(var j=1;j<OutsideArea[i].length;j++){
            switch(event.message.text){
                case "エリア"+OutsideArea[i][0]+"の"+OutsideArea[i][j]+"番の模擬店情報を表示":
                    // ** 模擬店情報送信部
                    msg = {
                        "type": "flex",
                        "altText": "エリア"+OutsideArea[i][0]+"の"+OutsideArea[i][j]+"番の模擬店情報",
                        "contents": {}
                    };
                    msg.contents = Build_flex(boothID_data["Outside"+OutsideArea[i][0]+OutsideArea[i][j]]);
                    msg2 = msg_text("debug message [エリアの模擬店情報]");
                    break;
            }
        }
        switch(event.message.text){
            case "エリア"+OutsideArea[i][0]+"へ":
                mapdata.location = "Area"+OutsideArea[i][0];
                msg = msg_imagemap("map",mapdata);
                msg2 = msg_text("ピンを選択すると模擬店の詳細を表示します");
                break;
        }
    }
    // [2] 構内マップ
    for(var i=0;i<mapBFdata.length;i++){
        for(var j=1;j<mapBFdata[i].length;j++){
            // フロアの画像送信部
            switch(event.message.text){
                case mapBFdata[i][0] + "棟"+j+"階へ":
                    mapdata.location = "I"+mapBFdata[i][0]+j;
                    msg = msg_imagemap("map",mapdata);
                    break;
                case "8棟3階へ":
                    mapdata.location = "I"+82;
                    msg = msg_imagemap("map",mapdata);
                    break;                    
            }
            for(var k=1;k<=mapBFdata[i][j];k++){
                switch(event.message.text){
                    case mapBFdata[i][0]+"棟"+j+"階の"+k+"番の模擬店情報を表示":
                        // ** 模擬店情報送信部
                        if(boothID_data["Inside"+mapBFdata[i][0]+j+k].match(/labo/)){
                            // 研究室情報を送信する
                            msg = {
                                "type": "flex",
                                "altText":  mapBFdata[i][0]+"棟"+j+"階の"+k+"番目の研究室情報",
                                "contents": {}
                            };
                            msg.contents = Build_LaboFlex_Bubble(boothID_data["Inside"+mapBFdata[i][0]+j+k]);
                        }else{
                            msg = {
                                "type": "flex",
                                "altText":  mapBFdata[i][0]+"棟"+j+"階の"+k+"番目の模擬店情報",
                                "contents": {}
                            };
                            msg.contents = Build_flex(boothID_data["Inside"+mapBFdata[i][0]+j+k]);
                            msg2 = msg_text("debug message [~棟~階~番の模擬店情報へ]");
                        }
                        
                        break;
                    case 8+"棟"+3+"階の"+1+"番の模擬店情報を表示":
                        // 研究室情報を送信する
                        msg = {
                            "type": "flex",
                            "altText":  mapBFdata[i][0]+"棟"+j+"階の"+k+"番目の研究室情報",
                            "contents": {}
                        };
                        msg.contents = Build_LaboFlex_Bubble(boothID_data["Inside"+821]);
                }
            }
        }
        // 階数を選択するflexMessageの送信
        switch(event.message.text){
            case mapBFdata[i][0]+"棟へ":
                msg = {
                    "type": "flex",
                    "altText":  mapBFdata[i][0]+"棟の階を選択してください。",
                    "contents": {}
                }
                var buttonTexts = [];
                for(j=1;j<mapBFdata[i].length;j++){
                    if(i==3 && j==2){
                        buttonTexts.push(mapBFdata[i][0]+"棟"+3+"階へ"); //8棟3階の処理
                    }else{
                        buttonTexts.push(mapBFdata[i][0]+"棟"+j+"階へ");
                    }
                }
                console.log(buttonTexts);
                msg.contents = Build_flexButton(buttonTexts);
                break;
        }
    }

    //画像を送信してきた時の処理
    if (event.message.type == "image") {
        image_download(event);
        msg = msg_text("画像を送信してくれてありがとう(o・∇・o)");
    }
    if (msg){
        var tmp = await Build_responce(urlp_reply, await Build_msg_text(
            event.replyToken,msg, msg2, msg3, msg4, msg5
        ));
        request.post(tmp);
    }
}


/**
 * Event - followの時
 * @param  {obj} event LINEからのBody
 */
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
/**
 * ユーザが初回登録をした
 * @param  {obj} event LINEからのBody
 * @param  {string} usertype 学生 or 来場者
 */
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

/**
 * ユーザがブロックした
 * @param  {obj} event LINEからのBody
 */
function removeUser(event) {
    var query = 'DELETE FROM UserData WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId);
    connection.query(query);
}

/**
 * ビーコンに侵入した時のおおもと
 * @param  {obj} event LINEからのBody
 */
async function type_beacon(event) {
    /* beacon侵入時間の更新 */
    var tmp = DB_get("UserData", "BEACONTIME", "USERID", event.source.userId);
    var now = moment();
    var nowtime = now.format('YYYY-MM-DD HH:mm:ss');
    var db_time = moment(await tmp);
    var db_place = DB_get("BeaconData", "PLACE", "BEACONID", event.beacon.hwid);
    //前回の侵入から7分経っている -> 更新してメッセージを送信
    if ((now.diff(db_time)/(1000*60)) >= 7 ) {
        var query = 'UPDATE UserData SET BEACONTIME = "{time}" WHERE USERID = "{id}"'
            .replace("{id}", event.source.userId)
            .replace("{time}", nowtime);
        connection.query(query);
        //メッセージを整形
        var db_msg = DB_get("BeaconData", "MESSAGE", "BEACONID", event.beacon.hwid);
        var msg = {
            "type": "text",
            "text": "現在，" + await db_place + "です"
        };
        var msg2 = {
            "type": "text",
            "text": "[おしらせ]\n" + await db_msg
        };
        var tmp = await Build_responce(urlp_reply, await Build_msg_text(
            event.replyToken, msg, msg2
        ));
        request.post(tmp);
    }
    //ユーザがいる場所を登録
    var query = 'UPDATE UserData SET PLACE = "{place}" WHERE USERID = "{id}"'
        .replace("{id}", event.source.userId)
        .replace("{place}", await db_place);
    connection.query(query);
    //体育館に侵入したならリッチメニューを切り替える
    if (db_place == "taiikukan") {
        rich_change(richdata.event, event.source.userId);
    }

}

/**
 * ビーコンから退出した（体育館専用）
 * @param  {obj} event LINEからのBody
 */
async function beacon_leave(event) {
    var p = DB_get("UserData", "PLACE", "USERID", event.source.userId);
    var db_place = await DB_get("BeaconData", "PLACE", "BEACONID", event.beacon.hwid);
    var user_place = await p;
    if (db_place == user_place) {
        var query = 'UPDATE UserData SET PLACE = "{place}" WHERE USERID = "{id}"'
            .replace("{id}", event.source.userId)
            .replace("{place}", "");
        connection.query(query);
        if (db_place == "taiikukan") {
            rich_change(richdata.normal, event.source.userId);
        }
    }
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
        //Eventは複数
        body.events.forEach((event) => {
            switch(event.type) {
                case "message":
                    type_message(event);
                    break;
                case "follow":
                    type_follow(event);
                    break;
                case "postback":
                    if (event.postback.data == "Student") { addUser(event, "学生"); }
                    else if (event.postback.data == "Other") { addUser(event, "来場者"); }
                    break;
                case "beacon":
                    if (event.beacon.type == "enter") { type_beacon(event); }
                    else if (event.beacon.type == "leave") { beacon_leave(event); }
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

function pushOnlyDB(query) {
    return new Promise(function(resolve, reject) {
        connection.query(query,function(err, rows) {
            resolve(rows);
        });
    });
}

/**
 * 受け取るデータは
 * @param {string} param mysql検索キー（where以下）
 * @param {string} message 送信する文面
 */
router.post('/pushmessage/send', async function(req, res, next) {
    var responce = "";
    const body = req.body; // Request body string
    let msg = msg_text(body.message);
    var query = 'SELECT USERID FROM UserData WHERE ' + body.param;
    let rows = await pushOnlyDB(query);
    let users = [];
    for (let i=0; i<rows.length; i++) {
        users.push(rows[i]["USERID"]);
        if (i%150 == 149) {
            let tmp = {
                "to": users,
                "messages": [msg]
            }
            request.post(await Build_responce(urlp_push, tmp))
            users.length = 0;
        }
    }
    if (users.length != 0) {
        let tmp = {
            "to": users,
            "messages": [msg]
        }
        request.post(await Build_responce(urlp_push, tmp));
        users.length = 0;
    }
    res.status = 200;
    res.send(responce);
});

module.exports = router;
