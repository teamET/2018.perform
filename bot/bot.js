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
var account_data;
var account;
var shop_data;
var shop;
var shop_name;

console.log('start process');
utils.log("start process",SLACK_TOKEN);
utils.log("hello winston",SLACK_TOKEN);

function create_json(){
	try {
		account_data = fs.readFileSync("./data/account.json");	
		shop_data = fs.readFileSync("./data/shop.json");
		account = JSON.parse(account_data);
		shop = JSON.parse(shop_data);
	}catch(e){
		account = {
			"user" :{"ShopName":"shopname","Class":"class"}
		};
		shop = {
			"shopname" : {
				"goods": {
					"name":"price"},
				"image":["image"],
				"text":"text"
			}
		};

		fs.writeFileSync("./data/account.json",JSON.stringify(account));	
		fs.writeFileSync("./data/shop.json",JSON.stringify(shop));	
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


const screen = (async(channel,file,shop_name)=>{
	const browser = await puppeteer.launch({args: ["--no-sandbox", "--disable-setuid-sandbox"]});
	const page = await browser.newPage();
	await page.goto(DEV_SERVER,{waitUntil: "domcontentloaded"});
	await page.screenshot({path: file+".png", fullPage: true});
	browser.close();
	utils.sendFile(channel,file+".png");
	return;
});

function help(event){
	var mes=" \
		```\
			.help\n.\
			entry <shop name> <class>\n.\
			goods <goods name> <price>\n \
			.text <text>\n.review\n\
			.show\
		```";
	res(mes,event);
}

function not_registered(event){
	var mes="Please register your account.";
	res(mes,event.channel);
}

rtm.on("hello",(event)=>{
	console.log("start slack process");
});


rtm.on("message",(event)=>{
	var channel = event.channel;
	slack_id = event.user;
	console.log("event",event);
	if(event.text.split(" ")[0]===".help"){
		help(event);
	}else if(event.text.split(" ")[0]===".text"){
		try{
			shop[shop_name].text = event.text.slice(6);
			fs.writeFileSync("shop.json",JSON.stringify(shop));
			slack("this text is registered",channel);
		}catch(e){
			slack("Please your register",channel);
		}
		slack("x was sent",event.text.split(" ")[1]);
	}else if(event.text.split(" ")[0]===".entry"){
		if(event.text.split(" ").length != 3){
			slack("Store name is invalid context.\ne.g.\n.entry <store name> <class>",channel);
			return ;
		}
		var name = event.text.split(" ")[1];
		var Class = event.text.split(" ")[2];
		account[slack_id] = {"ShopName":name,"Class":Class};
		fs.writeFileSync("account.json",JSON.stringify(account));
		slack("Your store is registered.",channel);
	}else if(event.text.split(" ")[0]===".goods"){
		try{
			if(event.text.split(" ").length != 3){
				slack("goods name or price is invalid context.\ne.g.\n.goods <goods name> <price>",channel);
				return ;
			}
			var Name = event.text.split(" ")[1];
			var Price = event.text.split(" ")[2];
			shop_name = account[slack_id]["ShopName"];
			if(shop[shop_name] == undefined){
				shop[shop_name] = {goods: {name:"price"},image:["image"],text:"text"};
				fs.writeFileSync("shop.json",JSON.stringify(shop));
				shop[shop_name].goods[Name] = Price;
			}else{
				shop[shop_name].goods[Name] = Price;	
			}
			fs.writeFileSync("shop.json",JSON.stringify(shop));
			slack("This goods is registered.",channel);
		}catch(e){
			slack("Please register your store.",channel);
		}
	}else if(event.text.split(" ")[0]===".rewiew"){
		try{
			shop_name = account[slack_id]["ShopName"];
			screen("./files/"+shop_name+shop_name,shop_name);
		}catch(e){
			slack("Please register your account",channel);
		}
	}else if(event.text.split(" ")[0]===".show"){
		try{
			shop_name = account[slack_id]["ShopName"];
			var shop_data =JSON.stringify(shop[shop_name]);			
			slack(shop_data,channel);			
		}catch(e){
			slack("Please register your account",channel);
		}
	}
	utils.log(event);
	//	slack(event);
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
				fs.writeFileSync("shop.json",JSON.stringify(shop));
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
		console.log("slack token is not defined");
	}
	utils.log("start process");
	//	logger.info('start');
	create_json();
	rtm.start();
}
