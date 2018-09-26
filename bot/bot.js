const dotenv=require('dotenv').config();
const fs = require("fs");
const puppeteer = require("puppeteer");
const request = require("request");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);
const utils= require("./utils.js");
SLACK_TOKEN=process.env.SLACK_TOKEN;
DEV_SERVER=process.env.DEV_SERVER;
const mkdirp = require("mkdirp");

var slack_id;
var account_data;
var account;
var shop_data;
var shop;
var shop_name;
var events_data;
var timetable_data;
var events;
var timetable;
var arr;
var list;
var shop_id;
var tag;
var tag_data;


function create_json(){
	try {
		account_data = fs.readFileSync('./account.json');	
		shop_data = fs.readFileSync('./shop.json');
		events_data = fs.readFileSync('./events.json');	
		tag_data = fs.readFileSync('./tag.json');	
		account = JSON.parse(account_data);
		shop = JSON.parse(shop_data);
		events = JSON.parse(events_data);
		tag = JSON.parse(tag_data);
		console.log("tag",tag);

	}catch(e){
		account = {
			"user" :{"ShopName":"shopname","Class":"class"}
		};
		shop = {
			"shopname" : {
				"id":"id",
				"goods": {
					"name":"price"},
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
	
		fs.writeFileSync('account.json',JSON.stringify(account));	
		fs.writeFileSync('shop.json',JSON.stringify(shop));
		fs.writeFileSync('events.json',JSON.stringify(events));		
	}
}

function slack(data,channel){

	request.post('https://slack.com/api/chat.postMessage',{
		form: {
			token: process.env.SLACK_TOKEN,
			channel: channel,
			username: 'mogi-bot',
			text: data
		}
	},(error, response, body) => {
		if (error) console.log(error);
	});
};


const screen = (async(channel,file,shop_name)=>{
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto(DEV_SERVER,{waitUntil: "domcontentloaded"});
	await page.screenshot({path: file+'.png', fullPage: true});
	browser.close();
	utils.sendFile(channel,file+'.png');
	return;
});

rtm.on('hello',(event)=>{
	console.log('start slack process');
});

rtm.on('message',(event)=>{
	var channel = event.channel;
	var text = event.text.replace('　',' ');
	var ts = event.ts;
	slack_id = event.user;
	console.log("event",event);
	if(text.split(' ')[0]==='.help'){
		slack('.help\n.entry <shop name> <class>\n.goods <goods name> <price>\n .text <text>\n.review\n.show\n.show_event',channel);
	}else if(text.split(' ')[0]==='.text'){
		try{
			shop[shop_name].text = text.slice(6);
			fs.writeFileSync('shop.json',JSON.stringify(shop));
		}catch(e){
			slack("Please register your store.",channel);
		}
		slack("this text is registered",channel);
	}else if(text.split(' ')[0]==='.entry'){
		if(text.split(' ').length != 4){
			slack('Store name is invalid context.\ne.g.\n.entry <store id> <store name> <class>',channel);
			return ;
		}
		shop_id = text.split(' ')[1];
		if(list.indexOf(shop_id) == -1){
			slack("shop-id is invalid.");
			return ;
		}
		var name = text.split(' ')[2];
		var Class = text.split(' ')[3];
		account[slack_id] = {"id":shop_id,"ShopName":name,"Class":Class};
		fs.writeFileSync('account.json',JSON.stringify(account));
		slack("Your store is registered.",channel);
	}else if(text.split(' ')[0]==='.goods'){
		try{
			if(text.split(' ').length != 3){
				slack('goods name or price is invalid context.\ne.g.\n.goods <goods name> <price>',channel);
				return ;
			}
			var Name = text.split(' ')[1];
			var Price = text.split(' ')[2];
			shop_name = account[slack_id]["ShopName"];
			shop_id = account[slack_id]["id"];
			if(shop[shop_name] == undefined){
				shop[shop_name] = {"id":shop_id,goods: {name:"price"},image:["image"],text:"text",tstamp:ts,label:["label"]};
				fs.writeFileSync('shop.json',JSON.stringify(shop));
				shop[shop_name].goods[Name] = Price;
			}else{
				shop[shop_name].goods[Name] = Price;	
			}
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			slack("This goods is registered.",channel);
		}catch(e){
			slack("Please register your store.",channel);
		}
	}else if(text.split(' ')[0]==='.rewiew'){
		try{
			shop_name = account[slack_id]["ShopName"];
			screen('./files/'+shop_name+shop_name,shop_name);
		}catch(e){
			slack("Please register your account",channel);
		}
	}else if(text.split(' ')[0]==='.show'){
		try{
			shop_name = account[slack_id]["ShopName"];
			var shop_data =JSON.stringify(shop[shop_name]);			
			slack(shop_data,channel);			
		}catch(e){
			slack("Please register your account",channel);
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
			fs.writeFileSync('events.json',JSON.stringify(events));
			slack("this event is registered.",channel);			
		}catch(e){
			slack("Please register your account",channel);
		}
	}else if(text.split(' ')[0]==='.show_event'){
		var events_text = JSON.stringify(events,null,'\t')
		slack(events_text,channel);
	}else if(text.split(' ')[0]==='.tag'){
		try{
			shop_name = account[slack_id]["ShopName"];
			var tags = text.split(' ');
			console.log("tags",tags);
			tags.shift();
			console.log("tags",tags);
			var cnt=0;
			console.log(shop);
			for(var key in shop[shop_name].label) cnt++;
			console.log("cnt",cnt);
			console.log("tag",tag);
			
			for(let i in tags){
				for(let j in tag){
					if((tags[i]==tag[j].id)&&(shop[shop_name].label.indexOf(tag[j].tag)==-1)){
						console.log("tag",tag[j].tag);
						shop[shop_name].label[cnt] = tag[j].tag;
						console.log("list",shop[shop_name].label[cnt]);
						fs.writeFileSync('shop.json',JSON.stringify(shop));
						cnt++;
					}
				}
			}
			console.log(shop);
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			slack("Tag is registered.",channel);
		}catch(e){
			console.log(e);
			slack("Please register your account",channel);
			
		}
	}
	slack(event);
	if(event.files !== undefined){
		console.log(event.files[0].url_private_download);
		try{
			var count = 0;
			shop_name = account[slack_id]["ShopName"];
			file=utils.download(shop_name,event.files[0].title,event.files[0].url_private_download);
			if(account[slack_id] !== undefined){
				for(var key in shop[shop_name].image){
					if(shop[shop_name].image[count] !== event.files[0].title) count++;
				}
				shop[shop_name].image[count] = event.files[0].title;
				fs.writeFileSync('shop.json',JSON.stringify(shop));
				screen(channel,file,shop_name);
			}else{
				slack("Please register your store.",channel);
				console.log("try else");
			}
			console.log("ok");
		}catch(e){
			slack("Please register your account.",channel);
			console.log("error",e); 
		}
	}
});

if(require.main ===module){
	if(SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
	create_json();
	list = utils.read_list();
	rtm.start();
}

