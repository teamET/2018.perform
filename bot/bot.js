const puppeteer = require("puppeteer");
const request = require("request");
const fs = require("fs");
const jsdom=require('jsdom');
const {RTMClient}=require('@slack/client');
const rtm=new RTMClient(process.env.SLACK_TOKEN);
const mkdirp = require("mkdirp");
const getDirName = require("path").dirname
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
		user :{ShopName:"shopname"}
	};
	shop = {
		shopname : {
			goods: {
				name:"name",
				price:"price"},
			image:"image",
			text:"text"
		}
	};

	fs.writeFileSync('account.json',JSON.stringify(account));	
	fs.writeFileSync('shop.json',JSON.stringify(shop));	
}

function writeFile (path, contents, cb) {
	mkdirp(getDirName(path), function (err) {
		if (err) return cb(err)
		fs.writeFile(path, contents, cb)
	})
}

function slack(data){
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
    request.post('https://slack.com/api/chat.postMessage',{
        form: {
            token: process.env.SLACK_TOKEN,
            channel: 'develop',
            username: 'mogi-bot',
            text: data
		}
　　},(error, response, body) => {
		if (error) console.log(error);
    })
};

const screen = (async(file)=>{
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
	const page = await browser.newPage();
	await page.goto('http://178.128.102.100/',{waitUntil: "domcontentloaded"});
	await page.screenshot({path: file+'.png', fullPage: true});
	browser.close();
	return;
});

rtm.on('hello',(event)=>{
	console.log('start slack process');
});

rtm.on('message',(event)=>{
	slack_id = event.user;
	console.log("event",event);
	if(event.text.split(' ')[0]==='.h'){
		slack('hello');
	}else if(event.text.split(' ')[0]==='.x'){
		slack('x was sent',event.text.split(' ')[1]);
	}else if(event.text.split(' ')[0]==='.entry'){
		if(event.text.split(' ').length != 2){
			slack('Store name is invalid context.\ne.g.\n.entry <store name>');
			return ;
		}
		var name = event.text.split(' ')[1];
		account[slack_id] = {"ShopName":name};
		fs.writeFileSync('account.json',JSON.stringify(account));
		slack("Your store is registered.");
	}else if(event.text.split(' ')[0]==='.goods'){
		try{
			if(event.text.split(' ').length != 3){
				slack('goods name or price is invalid context.\ne.g.\n.goods <goods name> <price>');
				return ;
			}
			var Name = event.text.split(' ')[1];
			var Price = event.text.split(' ')[2];
			shop_name = account[slack_id]["ShopName"];
			shop[shop_name] = {"goods":{"name":Name,"price":Price},"image":"image","text":"text"};
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			shop[shop_name][Name] = {"price":Price};
			fs.writeFileSync('shop.json',JSON.stringify(shop));
			slack("This goods is registered.");
		}catch(e){
			slack("Please register your store.");
		}
	}
	slack(event);
	if(event.files !== undefined){
//		console.log(event.files[0].url_private_download);
		try{
			shop_name = account[slack_id]["ShopName"];
			file=download(shop_name,event.files[0].title,event.files[0].url_private_download);
			if(account[slack_id] !== undefined){
				shop[shop_name]["image"] = file;
				screen(file);
			}else{
				slack("Please register your store."); 
			}
			console.log("ok");
		}catch(e){
			slack("Please register your account."); 
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
	let Fname = fname+'/'+Name;
	return Fname;
}

