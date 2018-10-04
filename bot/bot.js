const dotenv=require("dotenv").config();
const fs = require("fs");
const puppeteer = require("puppeteer");
const request = require("request");
const jsdom=require("jsdom");
const {RTMClient}=require("@slack/client");
const rtm=new RTMClient(process.env.SLACK_TOKEN);
const utils= require("./utils.js");
const SLACK_TOKEN=process.env.SLACK_TOKEN;
const DEV_SERVER=process.env.DEV_SERVER;
//const mkdirp = require("mkdirp");

var slack_id;
var account;
var shop;
var shop_name;
var timetable_data;
var events;
var timetable;
var arr;
var list;
var shop_id;
var tag;

console.log('start process');
utils.log("start process",SLACK_TOKEN);
utils.log("`hello winston`\n> test test",SLACK_TOKEN);

function create_json(){
    var account_data,shop_data,events_data,tag_data;
	try {
		account_data = fs.readFileSync("./data/account.json");
		shop_data = fs.readFileSync("./data/shop.json");
		events_data = fs.readFileSync("./data/events.json");
		tag_data = fs.readFileSync("./data/list.json");
		account = JSON.parse(account_data);
		shop = JSON.parse(shop_data);
		events = JSON.parse(events_data);
		tag = JSON.parse(tag_data);
	}catch(e){
		account = {
			"user" :{"id":"id","ShopName":"shopname","Class":"class"}
		};
		shop = {
			"id" : {
				"shopname":"shopname",
				"goods":[{
					"name":"name","price":"price"}],
				"image":["image"],
				"text":"text",
				"tstamp":"tstamp",
				"label":["label"]
			}
		};
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
		fs.writeFileSync('./data/account.json',JSON.stringify(account));	
		fs.writeFileSync('./data/shop.json',JSON.stringify(shop));
		fs.writeFileSync('./data/events.json',JSON.stringify(events));		
	}
}

function update_shop(shop){
    utils.log(shop);
	utils.to_Array(shop);
    fs.writeFileSync("./data/shop.json",JSON.stringify(shop));
}

function update_account(account){
    utils.log(account);
    fs.writeFileSync("./data/account.json",JSON.stringify(account));
}

function save_json(account,shop){
    utils.log(account);
    utils.log(shop);
	utils.to_Array();
	console.log("okok");
    fs.writeFileSync("./data/account.json",JSON.stringify(account));
    fs.writeFileSync("./data/shop.json",JSON.stringify(shop));
}

function update_events(events){
    utils.log(events);
    fs.writeFileSync("./data/events.json",JSON.stringify(events));
}


function save_shop_image(event){
    utils.log(event.files[0].url_private_download);
    try{
        var count = 0;
        shop_name = account[slack_id]["ShopName"];
        file=utils.download(shop_name,event.files[0].title,event.files[0].url_private_download);
        if(account[slack_id] !== undefined){
            for(var key in shop[shop_name].image){
                if(shop[shop_name].image[count] !== event.files[0].title) count++;
            }
            shop[shop_name].image[count] = event.files[0].title;
			update_shop(shop);
			screen(channel,file,shop_name);
        }else{
            slack("店舗を登録してください.",channel);
            console.log("try else");
        }
        console.log("ok");
    }catch(e){
        slack("アカウントを登録してください.",channel);
        console.log("error",e); 
    }
}

function slack(data,channel){
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
	utils.sendFile(channel,file+".png");
	return;
});

function not_registered(event){
	var mes="アカウントを登録してください.";
	res(mes,event.channel);
}

function no_goods(event){
	var mes="アカウントを登録してください.";
	res(mes,event.channel);
}

rtm.on("hello",(event)=>{
    utils.log("hello slack");
	console.log("start slack process");
});


rtm.on("message",(event)=>{
	//make_template("_timetable.ejs",timetable_data)
	var channel = event.channel;
	var text = event.text.replace('　',' ');
	var ts = event.ts;
	slack_id = event.user;
	utils.log(event);
	if(event.text.split(" ")[0]===".help"){
		utils.help(event);
	}else if(event.text.split(" ")[0]===".text"){
		try{
			shop[shop_name].text = event.text.slice(6);
			update_shop(shop);
			slack("テキストが登録されました.",channel);
		}catch(e){
			slack("店舗情報を登録してください.",channel);
		}
		slack("this text is registered",channel);
	}else if(text.split(' ')[0]==='.entry'){
		if(text.split(' ').length != 4){
			slack('入力方法に誤りがあります.\ne.g.\n.entry <store id> <store name> <class>',channel);
			return ;
		}
		shop_id = text.split(' ')[1];
		var cnt=0;
		if(list.indexOf(shop_id) == -1){
			slack("店舗idが間違っています.",channel);
			return ;
		}
		var name = text.split(' ')[2];
		var Class = text.split(' ')[3];
		account[slack_id] = {"id":shop_id,"ShopName":name,"Class":Class};
		update_account(account);
		slack("店舗が登録されました.",channel);
	}else if(text.split(' ')[0]==='.goods'){
		try{
			if(text.split(' ').length != 3){
				slack('商品名または値段の入力方法に誤りがあります.\ne.g.\n.goods <goods name> <price>',channel);
				return ;
			}
			var cnt;
			var Name = text.split(' ')[1];
			var Price = text.split(' ')[2];
			console.log(shop);
			shop_name = account[slack_id]["ShopName"];
			shop_id = account[slack_id]["id"];
			if(shop[shop_id] == undefined){
				shop[shop_id] = {"shopname":shop_name,"goods": [{"name":Name,"price":Price}],"image":["image"],"text":"text","tstamp":ts,"label":["label"]};
			}else{
				console.log("ok");
				console.log(shop[shop_id].goods[0]);
				for(cnt=0;cnt<shop[shop_id].goods.length;cnt++){
					if(shop[shop_id].goods[cnt]["name"] == Name){
						shop[shop_id].goods[cnt]["price"] = Price;
						slack("値段が更新されました.",channel);
						update_shop(shop);
						return ;
					}
				}
				var data = {"name":Name,"price":Price};
				shop[shop_id].goods.push(data);
			}
			update_shop(shop);
			slack("商品が登録されました.",channel);
			slack("タグの登録を行ってください.",channel);
			slack("0:食べ物, 1:飲み物, 2:アトラクション, 3:温かいもの, 4:冷たいもの, 5:甘い, 6:しょっぱい",channel);
		}catch(e){
			console.log(e);
			slack("店舗を登録してください.",channel);
		}
	}else if(text.split(' ')[0]==='.rewiew'){
		try{
			shop_id = account[slack_id]["id"];
			screen('./files/'+shop_id+shop_id,shop_id);
		}catch(e){
			slack("アカウントを登録してください",channel);
		}
	}else if(text.split(' ')[0]==='.show'){
		try{
			shop_id = account[slack_id]["id"];
			var shop_data =JSON.stringify(shop[shop_id]);			
			slack(shop_data,channel);			
		}catch(e){
			slack("アカウントを登録してください",channel);
		}
	}else if(text.split(' ')[0]==='.event'){
		try{
			if(text.split(' ').length != 8){
				slack('registed data is invarid.\ne.g.\n.event <date> <start_time> <end_time> <place> <name> <content> <from>\nex.\n.event 22 18:00 19:00 第一体育館 後夜祭 演出部門によるプロジェクションマッピング 演出部門',channel);
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
//			console.log("events.length",events.length);
			events[events.length-1] = {"id":events.length-1,"date":date,"time":time,"start_time":start_time,"end_time":end_time,"place":place,"name":name,"content":content,"from":from,"tstamp":ts};
			events = utils.json_sort(events);
			update_events(events);
			slack("イベントが登録されました.",channel);			
		}catch(e){
			slack("アカウントを登録してください",channel);
		}
	}else if(text.split(' ')[0]==='.show_event'){
		var events_text = JSON.stringify(events,null,'\t')
		slack(events_text,channel);
	}else if(text.split(' ')[0]==='.tag'){
		try{
			shop_id = account[slack_id]["id"];
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
						shop[shop_id].label[cnt] = tag[j].tag;
						console.log("list",shop[shop_id].label[cnt]);
						fs.writeFileSync('shop.json',JSON.stringify(shop));
						cnt++;
					}
				}
			}
			console.log(shop);
			update_shop(shop);
			slack("タグが登録されました.",channel);
		}catch(e){
			console.log(e);
			slack("アカウントを登録してください",channel);
			
		}
	}else if(text.split(' ')[0]==='.tag_help'){
		slack("0:食べ物, 1:飲み物, 2:アトラクション, 3:温かいもの, 4:冷たいもの, 5:甘い, 6:しょっぱい",channel);
	}else if(text.split(' ')[0]==='.line'){
		
	}
//	utils.save_templates();
	if(event.files !== undefined){
        save_shop_image(event);
	}
});

if(require.main ===module){
	if(SLACK_TOKEN === undefined){
		console.log("slack token is not defined");
	}
	utils.log("start process");
	create_json();
	list = utils.read_list();
	rtm.start();
}
