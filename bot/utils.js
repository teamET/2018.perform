const ejs=require('ejs');
const dotenv=require('dotenv').config();
const fs=require('fs');
const mkdirp = require("mkdirp");
const path=require('path');
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
 		return (a.time > b.time ? 1 : 1);
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
	winstonlogger.info(message);
	slack_postMessage("GCSFWFUE8",message);
}

function slack_err(message){
	winstonlogger.error(message);
	slack_postMessage("#errors",message);
	slack_postMessage("#errors",message);
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
	var dir='./public/'+dir;
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
.goods <goods name> <price>\n\
.tag <number>\n\
.review\n\
.show\n\
```\n\
event\n\
```\
.event <date> <start_time> <end_time> <place> <name> <content> <from>\n\
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

function load_template(){
	var file=path.join(__dirname,"./views/_booth.ejs");
	var data="";
	try{
		data=fs.readFileSync(file,'utf-8');
	}catch(e){
		logger.error(e.message);
		return "";
	}
	return data;
}

function save_html(name,html){
	fs.writeFile(path.join(__dirname,'views/'+name+'.html'),html,(err)=>{
		 if(err){     
			 console.log("error occured"+err.message);
			 throw err;
		 }else{
			logger.info('write file successed');
		}
	});
}

function make_template(filename,data){
	logger.info('make_tempalte',data);
	var template=load_template(`./views/${filename}.ejs`);
	logger.info('make_tempalte',template);
	var html=ejs.render(template,{data: data},(err,str)=>{
		if(err){
			logger.error('ejs error',err);
		}
		logger.info('ejs results',str);
	});
	save_html(filename,html);
	return html
}


module.exports={
	sendFile:slack_upload,
	slack_postMessage:slack_postMessage,
	res:slack_responce,
	log:slack_log,
	err:slack_err,
	download:download,
	make_template:make_template,
	help:help,
	read_list:read_list,
	json_sort:json_sort,
	to_Array:to_Array
}

/*
 * sample json data 
	{
		"shopname":{"goods":{"name":"price"},"image":["image"],"text":"text"},
		"4j":{"goods":{"name":"price"},"image":["image"],"text":"text"}
	}  
*/
/* make_template tests */


if(require.main ===module){
/*
	var EVENT_DATA = JSON.parse(fs.readFileSync('./event.json', 'utf8'));
	var SHOP_DATA = JSON.parse(fs.readFileSync('./shop.json', 'utf8'));
	make_template('_timetable',EVENT_DATA);
	make_template('_news',EVENT_DATA);
    */
//	make_template('_shoptable','{"shopname":"4J","goods":{"goods":{"name":"price"},"image":["image"],"text":"text"}}');
//	slack_log("hello world");
}
