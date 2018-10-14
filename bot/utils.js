const dotenv=require('dotenv').config();
const fs=require('fs');
const mkdirp = require("mkdirp");
const request = require("request");
const logger=require('pino')();
const winston=require('winston');
const SLACK_TOKEN=process.env.SLACK_TOKEN;
const BOT_USERNAME='mogi-shop';

const winstonlogger=winston.createLogger({
	transports:[
		new winston.transports.Console(),
		new winston.transports.File({filename:'logs/info.log',level:'error'}),
		new winston.transports.File({filename:'logs/combined.log'})
	]
});

function read_list(){
	try{
		arr = fs.readFileSync('./data/list.txt').toString().split('\r\n');
	}catch(e){
		console.log("can not read list.txt");
	}
	return arr;
}

function id_exist(shopid){
	var shop_list=read_list();
	console.log(shop_list);
}

function json_sort(arr){
	arr.sort(function(a,b) {
 		return (a.time > b.time ? 1 : -1);
	});
	for(i = 0 ; i < arr.length ; i++ ){
　  	arr[i].id = i;
	}
	return arr;
}

function to_Array(shop){
	var Ashop = [];
	var cnt=0;
	for(key in shop){
		Ashop.push(shop[key]);
		Ashop[cnt].id = key;
		cnt++;
	}
	console.log("Ashop",Ashop);
	fs.writeFileSync('./data/Ashop.json',JSON.stringify(Ashop));
}

function slack_log(message){
	console.log(message);
	winstonlogger.info(message);
	slack_postMessage("GCSFWFUE8",message);
}

function slack_err(message){
	console.log(message);
	winstonlogger.error(message);
	slack_postMessage("GCS4U0GKT",message);
}

function slack_responce(message,event){
    if(event.username === BOT_USERNAME){
        return;
    }
    console.log(message);
	request.post('https://slack.com/api/chat.postMessage',{
		form: {
			token: SLACK_TOKEN,
			channel: event.channel,
			username: 'mogi-bot',
			text: message
		}
	},(error, response, body) => {
		if (error) slack_err(error);
	});
}
function slack_upload(channel,image){
	console.log(channel,image,SLACK_TOKEN)
	var arg={
		url:'https://slack.com/api/files.upload',
		headers:{
			"Content-Type":"multipart/form-data;"
		},
		formData:{
			token: SLACK_TOKEN,
			channels:channel,
			username:'mogi-bot',
			title:"Image",
			filename:image,
			file:fs.createReadStream(image),
		}
	};
	console.log(arg)
	request.post(arg,(error, response, body) => {
		console.log(body);
	});
};


function download(dir,title,url){
	var dir='./private/raw/'+dir;
	var fname=dir+'/'+title;
	mkdirp(dir,(err)=>{slack_log(err);});
	request({
		url:url,
		headers:{'Authorization': 'Bearer '+SLACK_TOKEN}
	}).pipe(fs.createWriteStream(fname));
	console.log("download file successed",dir,fname,url);
	return fname;
}

const HELP_MESSAGE="booth\n\
```\
.help\n\
.entry <shop name>\n\
.goods <goods name> <price>\n\
.del_goods <goods name>\n\
.tag <number>\n\
.del_tag <number>\n\
.review\n\
.show\n\
.show_tag\n\
```\n\
event\n\
```\
.event <date> <start_time> <end_time> <place> <name> <content> <from>\n\
.news <from> <content>\n\
.show_event\
```";

function help(event){
	slack_responce(HELP_MESSAGE,event);
}

function slack_postMessage(channel,message){
	res=request.post('https://slack.com/api/chat.postMessage',{
		form: {
			token: SLACK_TOKEN,
			channel: channel,
			username: 'mogi-bot',
			text:message 
		}
	},(error, response, body) => {
		if (error) console.log("error",error);
	});
};



module.exports={
	sendFile:slack_upload,
	slack_postMessage:slack_postMessage,
	res:slack_responce,
	log:slack_log,
	err:slack_err,
	download:download,
	help:help,
	read_list:read_list,
	json_sort:json_sort,
	to_Array:to_Array
}

function fileid2url(fileid){
    var url=undefined;
    console.log(fileid);
	await request.post('https://slack.com/api/files.info',{
		form: {
			token: SLACK_TOKEN,
			file: fileid,
		}
	},async (error, response, body) => {
        if (error){
            console.log("error",error);
        }else{
            data=await JSON.parse(body);
            url=await data.file.url_private_download;
            await console.log("url_private_download",url);
            return url;
        } 
	});
};

async function downloadById(fileid){
    const dir="test";
    const title="test_title";
    const url=await fileid2url(fileid);
    await console.log("downloadById url",url);
    await download(dir,title,url);
 }

if(require.main ===module){
    const fileid="FD7T60M1R";
    downloadById(fileid);
}

