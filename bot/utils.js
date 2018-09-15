const ejs=require('ejs');
const fs=require('fs');
const path=require('path');
const logger=require('pino')();

function slack_file(data,Data){
	console.log("##### slack_file","data",data,"Data",Data);
	if(process.env.SLACK_TOKEN === undefined){
		console.log('slack token is not defined');
		return;
	}
	console.log("file send");
	request.post('https://slack.com/api/files.upload',{
		form: {
			token: process.env.SLACK_TOKEN,
			channel: 'develop',
			filename: Data+'.png',
			file: fs.createReadStream(data+'.png')  
		}
	},(error, response, body) => {
		if (error) console.log(error);
	})
};

function download(url){
	var filename="";
	logger.info("donwload");

	return filename;
}

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

function make_template(data){
	logger.info('make_tempalte',data);
	var template=load_template();
	logger.info('make_tempalte',template);
	var html=ejs.render(template,data,(err,str)=>{
		if(err){
			logger.error('ejs error',err);
		}
		logger.info('ejs results',str);
	});
	save_html(data.name,html);
	return html
}



module.exports={
	sendFile:slack_file,
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
	logger.info("start test");
	var data={"name":"4J","goods":{"banana":"100"},"image":["image"],"text":"text"};
	logger.info(data);;
	html=make_template(data);
	logger.info(html);;
}

