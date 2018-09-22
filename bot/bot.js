const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);
const mkdirp = require("mkdirp");

rtm.start();

var slack_id;
var account_data;
var account;
var shop_data;
var shop;
var shop_name;
try {
	account_data = fs.readFileSync('./account.json');	
	shop_data = fs.readFileSync('./shop.json');
	account = JSON.parse(account_data);
	shop = JSON.parse(shop_data);
}catch(e){
	account = {
		user :{ShopName:"shopname",Class:"class"}
	};
	shop = {
		shopname : {
			goods: {
				name:"price"},
			image:["image"],
			text:"text"
		}
	};

	fs.writeFileSync('account.json',JSON.stringify(account));	
	fs.writeFileSync('shop.json',JSON.stringify(shop));	
}

function slack(data,channel){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
	request.post('https://slack.com/api/chat.postMessage',{
		form: {
			token: process.env.SLACK_TOKEN,
			channel: channel,
			username: 'mogi-bot',
			text: data
		}
	},(error, response, body) => {
		if (error) console.log(error);
	})
};

function slack_file(data,Data,channel){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
	console.log("Data",Data);
	console.log("data",data);
	my_file = {
		'file' : (data+'.png', fs.createReadStream(data+'.png'), 'png')
	}

	payload={
		"filename":Data+'.png', 
		"token":process.env.SLACK_TOKEN, 
		"channels":channel, 
	}

	requests.post("https://slack.com/api/files.upload", params=payload, files=my_file)
};

const screen = (async(file,shop_name)=>{
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto('http://178.128.102.100/',{waitUntil: "domcontentloaded"});
	await page.screenshot({path: file+'.png', fullPage: true});
	browser.close();
	console.log("screenshot");
	slack_file(file,shop_name);
	return;
});

rtm.on('hello',(event)=>{
	console.log('start slack process');
});

rtm.on('message',(event)=>{
	var channel = event.channel;
	slack_id = event.user;
	console.log("event",event);
	if(event.text.split(' ')[0]==='.help'){
		slack('.help\n.entry <shop name> <class>\n.goods <goods name> <price>\n .text <text>\n.review\n.show',channel);
	}else if(event.text.split(' ')[0]==='.text'){
		try{
			shop[shop_name].text = event.text.slice(6);
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			slack("this text is registered",channel);

		}catch(e){
			slack("Please your register",channel);
		}
			slack('x was sent',event.text.split(' ')[1]);
	}else if(event.text.split(' ')[0]==='.entry'){
		if(event.text.split(' ').length != 3){
			slack('Store name is invalid context.\ne.g.\n.entry <store name> <class>',channel);
			return ;
		}
		var name = event.text.split(' ')[1];
		var Class = event.text.split(' ')[2];
		account[slack_id] = {"ShopName":name,"Class":Class};
		fs.writeFileSync('account.json',JSON.stringify(account));
		slack("Your store is registered.",channel);
	}else if(event.text.split(' ')[0]==='.goods'){
		try{
			if(event.text.split(' ').length != 3){
				slack('goods name or price is invalid context.\ne.g.\n.goods <goods name> <price>',channel);
				return ;
			}
			var Name = event.text.split(' ')[1];
			var Price = event.text.split(' ')[2];
			shop_name = account[slack_id]["ShopName"];
			shop[shop_name] = {goods: {name:"price"},image:["image"],text:"text"};
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			console.log(shop[shop_name].goods);
			shop[shop_name].goods[Name] = Price;
			console.log(shop[shop_name].goods.name);
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			slack("This goods is registered.",channel);
		}catch(e){
			slack("Please register your store.",channel);
		}
	}else if(event.text.split(' ')[0]==='.rewiew'){
		try{
			shop_name = account[slack_id]["ShopName"];
			screen('./files/'+shop_name+shop_name,shop_name);
		}catch(e){
			slack("Please register your account",channel);
		}
	}else if(event.text.split(' ')[0]==='.show'){
		try{
			shop_name = account[slack_id]["ShopName"];
			var shop_data =JSON.stringify(shop[shop_name]);			
			slack(shop_data,channel);			
		}catch(e){
			slack("Please register your account",channel);
		}
	}
	

	
	slack(event);
	if(event.files !== undefined){
		console.log(event.files[0].url_private_download);
		try{
			var count = 0;
			shop_name = account[slack_id]["ShopName"];
			console.log("shop_name",shop_name);
			file=download(shop_name,event.files[0].title,event.files[0].url_private_download);
			if(account[slack_id] !== undefined){
				for(var key in shop[shop_name].image) count++;
				shop[shop_name].image[count] = event.files[0].title;
				fs.writeFileSync('shop.json',JSON.stringify(shop));
				console.log("screenshot will");
				screen(file,shop_name);
				console.log("screenshot was");
			}else{
				slack("Please register your store.",channel);
				console.log("try else");
			}
			console.log("ok");
		}catch(e){
			slack("Please register your account.",channel);
			console.log(e); 
		}
	}
});

function download(name,Name,url){
	let headers={Authorization: ' Bearer '+process.env.SLACK_TOKEN};
	let fname='./files/'+name;
	console.log("headers",headers);
	console.log("ok");
	mkdirp(fname, function (err) {
	});
	request({
		url:url,//file.url_private,
		headers:{'Authorization': 'Bearer '+process.env.SLACK_TOKEN}})
			.pipe(fs.createWriteStream(fname+'/'+Name));
	let Fname = fname+'/'+name;
	return Fname;
}

