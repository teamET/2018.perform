const dotenv=require("dotenv").config();
const fs = require("fs");
const puppeteer = require("puppeteer");
const request = require("request");
const jsdom=require("jsdom");
const {RTMClient}=require("@slack/client");
const rtm=new RTMClient(process.env.SLACK_TOKEN);
const utils= require("./utils.js");
//load json
const account= require("./private/id2mogiid.json");
const admin= require("./public/admin.json");
const shop= require("./public/shop.json");

//load env
const SLACK_TOKEN=process.env.SLACK_TOKEN;
const DEV_SERVER=process.env.DEV_SERVER;

var slack_id;
var shop_name,shop_id;
var timetable_data;
var events;
var timetable;
var arr;
var list;
var photos=[];

function create_json(){
    var events_data,tag_data;
	try {
		const tag=JSON.parse(fs.readFileSync("./private/tag.json"));
	}catch(e){
		console.log(e);
	}
    try {
        events_data = fs.readFileSync("./public/events.json");
        events = JSON.parse(events_data);
    }catch(e){
        events = [{
            "id":"id",
            "date":"date",
            "time":"time",
            "start_time":"start_time",
            "end_time":"end_time",
            "place":"place",
            "name":"name",
            "content":"content",
            "from":"from",
            "tstamp":"tstamp"
        }];
        fs.writeFileSync('./public/events.json',JSON.stringify(events));		
    }
}

function backup(name,data){
    utils.log("name : ```"+data+"```");
    fs.writeFileSync("./public/"+name+".json",JSON.stringify(data));
}

function save_shop_image(event,shop_id){
    utils.log(event.files[0].url_private_download);
    var count = 0;
    file=utils.download(shop_name,event.files[0].title,event.files[0].url_private_download);
    console.log(shop);
    console.log(shop_id);
    console.log(shop[shop_id]);
    shop[shop_id].image.push(event.files[0].title);
}

function slack(data,channel){
    utils.log(data);
    request.post("https://slack.com/api/chat.postMessage",{
        form: {
            token: process.env.SLACK_TOKEN,
            channel: channel,
            username: "mogi-bot",
            text: data
        }
    },(error, response, body) => {
        if (error) console.log(error);
    });
}

const screen = (async(channel,file,shop_id)=>{
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.goto(DEV_SERVER,{waitUntil: "domcontentloaded"});
    await page.screenshot({path: file+".png", fullPage: true});
    browser.close();
    utils.log(file);
    utils.sendFile(channel,file+".png");
    return;
});

function tag_message(tag,channel){
    var arr = [];
    var text;
    var mes;
    for(var i in tag){
        text = tag[i].id+":"+tag[i].tag;
        arr.push(text);
    }
    mes = arr.join(' , ');
    slack(mes,channel);
}

function get_mogiid(event){
    console.log(event.channel);
    try{
        return [account[event.channel]["id"],account[event.channel]["name"]];
    }catch(e){
        console.log('not mogi',event.channel);
        return undefined;
    }
}

function admin_message(event){
	if(event.text.split(' ')[0]===".message"){
		slack("get admin message");
		request.post(
			{
				url:'https://kunugida2018.tokyo-ct.ac.jp/api/beacon/update',
				form:{
					"place":[A,B,C,D,E,F,tailkukan,hazama,seimon,joho.All],
					"message":event.text.split(' ')[1]
				}
			},
			(err,res,body)=>{
				if(err)utils.log(err);
				utils.log(res);
			});
	}
}

rtm.on("hello",(event)=>{
    utils.log("hello slack");
    console.log("start slack process");
});

rtm.on("reaction_added",(event)=>{
//    save_shop_image(event,shop_id);
});

rtm.on("reaction_removed",(event)=>{
//    save_shop_image(event,shop_id);
});



rtm.on("message",(event)=>{
    var channel = event.channel;
    if(event.text){event.text = event.text.replace('　',' ');}
    var ts = event.ts;
    var shopd=get_mogiid(event);
	if(event.channel=="GCS4TEWGZ"){
//		admin_message(event);
		return;
	}else if(event.channel=="CD0KZSRQ9"){
		if(event.files){
//			photos.push(utils.download("photo_club",event.files[0].title,event.files[0].url_private_download));
			slack(JSON.stringify(photos),event.channel);
		}
		return;
	}else if(shopd){
        shop_id=shopd[0];
        shop_name=shopd[1];
        if(!shop[shop_id]) shop[shop_id]={"goods":[],"image":[],"label":[]};
        console.log(shop_id,shop_name);
    }else{
        return;
    }
    slack_id = event.user;
    if(event.text.split(" ")[0]===".help"){
        slack("\`\`\`"+shop_name+"\`\`\`",event.channel);
        utils.help(event);
    }else if(event.text.split(" ")[0]===".text"){
        shop[shop_id].text = event.text.slice(6);
        shop[shop_id].tstamp = ts;
        slack("テキストが登録されました.",channel);
    }else if(text.split(' ')[0]==='.goods'){
        if(text.split(' ').length != 3){
            slack('商品名または値段の入力方法に誤りがあります.\ne.g.\n.goods <goods name> <price>',channel);
            return ;
        }
        var cnt;
        var Name = text.split(' ')[1];
        var Price = text.split(' ')[2];
        console.log(shop);
        console.log(shop[shop_id].goods[0]);
        for(cnt=0;cnt<shop[shop_id].goods.length;cnt++){
            if(shop[shop_id].goods[cnt]["name"] == Name){
                shop[shop_id].goods[cnt]["price"] = Price;
                slack("値段が更新されました.",channel);
                shop[shop_id].tstamp = ts;
                return ;
            }
        }
        var data = {"name":Name,"price":Price};
        shop[shop_id].goods.push(data);
        shop[shop_id].tstamp = ts;
        if(shop[shop_id].goods[0].name==='name') shop[shop_id].goods.shift();
        slack("商品が登録されました.\nタグの登録を行ってください.",channel);
        tag_message(tag,channel);
    }else if(text.split(' ')[0]==='.rewiew'){
        screen('./public/'+shop_id+shop_id,shop_id);
    }else if(text.split(' ')[0]==='.show'){
        slack("```"+
            "name : "+shop_name+"\n"+
            "goods : "+JSON.stringify(shop[shop_id]["goods"])+"\n"+
            "image : "+JSON.stringify(shop[shop_id]["image"])+"\n"+
            "label : "+shop[shop_id]["label"]+"\n"+
            "text : "+shop[shop_id]["text"]+"\n"+
            "```",event.channel);
    }else if(text.split(' ')[0]==='.event'){
        try{
            if(text.split(' ').length != 8){
                slack('registed data is invarid.\n'+
                    'e.g.\n'+
                    '.event <date> <start_time> <end_time> <place> <name> <content> <from>\n'+
                    'ex.\n'+
                    '.event 22 18:00 19:00 第一体育館 後夜祭 演出部門によるプロジェクションマッピング 演出部門',
                        channel);
                return ;
            }
            var date = text.split(' ')[1];
            var start_time = text.split(' ')[2];
            var end_time = text.split(' ')[3];
            var place = text.split(' ')[4];
            var name = text.split(' ')[5];
            var content = text.split(' ')[6];
            var from = text.split(' ')[7];
            var time = '2018/10/'+date+'/'+start_time+':00';
            events[events.length-1] = {"id":events.length-1,"date":date,"time":time,"start_time":start_time,"end_time":end_time,"place":place,"name":name,"content":content,"from":from,"tstamp":ts};
            events = utils.json_sort(events);
            slack("イベントが登録されました.",channel);			
        }catch(e){
            slack("想定外のエラーが発生しました",channel);
        }
    }else if(text.split(' ')[0]==='.show_event'){
        var events_text = JSON.stringify(events,null,'\t')
        slack(events_text,channel);
    }else if(text.split(' ')[0]==='.tag'){
        var tags = text.split(' ');
        console.log("tags",tags);
        tags.shift();
        console.log("tags",tags);
        var cnt=0;
        console.log(shop);
        for(var key in shop[shop_id].label) cnt++;
        console.log("cnt",cnt);
        console.log("tag",tag);
        for(let i in tags){
            for(let j in tag){
                if((tags[i]==tag[j].id)&&(shop[shop_id].label.indexOf(tag[j].tag)==-1)){
                    console.log("tag",tag[j].tag);
                    shop[shop_id].label[cnt] = tag[j].id;
                    console.log("list",shop[shop_id].label[cnt]);
                    shop[shop_id].tstamp = ts;
                    cnt++;
                }
            }
        }
        console.log(shop);
        shop[shop_id].tstamp = ts;
        if(shop[shop_id].label[0]==='label') shop[shop_id].label.shift();
        slack("タグが登録されました.",channel);
    }else if(text.split(' ')[0]==='.tag_help'){
        //		slack("0:食べ物, 1:飲み物, 2:アトラクション, 3:温かいもの, 4:冷たいもの, 5:甘い, 6:しょっぱい",channel);
        tag_message(tag,channel);
    }else if(text.split(' ')[0]==='.tag_save'){
        try{
            var tags = {"id":tag.length,"tag":text.split(' ')[1]};
            tag.push(tags);
        }catch(e){
            console.log(e);
        }
    }
    backup("shop",shop);
    backup("tag",tag);
    backup("events",events);
});

if(require.main ===module){
    if(SLACK_TOKEN === undefined){
        console.log("slack token is not defined");
    }
    console.log(account);
    utils.log("start process");
    create_json();
    list = utils.read_list();
    rtm.start();
}
