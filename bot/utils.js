const ejs=require('ejs');
const dotenv=require('dotenv').config();
const fs=require('fs');
const mkdirp = require("mkdirp");
const path=require('path');
const request = require("request");
const logger=require('pino')();
const winston=require('winston');
const SLACK_TOKEN=process.env.SLACK_TOKEN;

const winstonlogger=winston.createLogger({
	tranports:[
		new winston.transports.Console(),
		new winston.transports.File({filename:'logs/combined.log'})
	]
});
winstonlogger.info('hello');

function slack_postMessage(channel,message){
	request.post('https://slack.com/api/chat.postMessage',{
		form: {
			token: SLACK_TOKEN,
			channel: channel,
			username: 'mogi-bot',
			text:message 
		}
	},(error, response, body) => {
		if (error) console.log(error);
	})
};

function slack_log(message){
	winstonlogger.info(message);
	slack_postMessage("logging",message);
}

function slack_err(message){
	slack_postMessage("errors",message);
}

function slack_react(message){

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

//file=utils.download(shop_name,event.files[0].title,event.files[0].url_private_download);
function download(dir,title,url){
	var dir='./files/'+dir;
	var fname=dir+'/'+title;
	mkdirp(dir,(err)=>{console.log(err);});
	request({
		url:url,
		headers:{'Authorization': 'Bearer '+SLACK_TOKEN}
	}).pipe(fs.createWriteStream(fname));
	console.log("download file successed",dir,fname,url);
	return fname;
}

function load_template(filename){
	var file=path.join(__dirname,filename);
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
	postMessage:slack_postMessage,
	log:slack_log,
	err:slack_err,
	download:download,
	make_template:make_template
}

/*
 * sample json data 
	{
		"shopname":{"goods":{"name":"price"},"image":["image"],"text":"text"},
		"4J":{"goods":{"name":"price"},"image":["image"],"text":"text"}
	}  
*/
/* make_template tests */


if(require.main ===module){

	var EVENT_DATA = JSON.parse(fs.readFileSync('./event.json', 'utf8'));
	var SHOP_DATA = JSON.parse(fs.readFileSync('./shop.json', 'utf8'));
	make_template('_timetable',EVENT_DATA);
	make_template('_news',EVENT_DATA);
	make_template('_shoptable',SHOP_DATA);
//	slack_postMessage("develop","files/4J/4J.png")
//	slack_upload("develop","files/4J/4J.png")

	slack_log("hello world");
	slack_postMessage("develop","files/4J/4J.png")
	slack_upload("develop","files/4J/4J.png")

}

