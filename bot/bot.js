const dotenv=require("dotenv").config();
require('date-utils');
const fs = require("fs");
const puppeteer = require("puppeteer");
const request = require("request");
const jsdom=require("jsdom");
const {RTMClient}=require("@slack/client");
const utils= require("./utils.js");
var im = require('imagemagick');
require('date-utils');
const tmpl= require("./tmpl.js");

//load json
const account= require("./private/id2mogiid.json");
const shop= require("./public/shop.json");

//load env
const SLACK_TOKEN=process.env.SLACK_TOKEN;
const rtm=new RTMClient(SLACK_TOKEN);
const DEV_SERVER=process.env.DEV_SERVER;

var slack_id;
var shop_name,shop_id;
var timetable_data;
var events;
var timetable;
var arr;
var list;
var photos=[];
var tag;
var event_text;
var news;
var img_list;
function create_json(){
    var events_data,img_list_data;
	try {
		tag=JSON.parse(fs.readFileSync("./public/tag.json"));
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
			"display_time":"display_time",
			"duration":"duration",
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
     try {
        news_data = fs.readFileSync("./public/news.json");
        news = JSON.parse(news_data);
    }catch(e){
        news = events;
        fs.writeFileSync('./public/news.json',JSON.stringify(news));		
    }
    try {
        img_list_data = fs.readFileSync("./private/img_list.json");
        img_list = JSON.parse(img_list_data);
    }catch(e){
        console.log(e);
    }
}

function backup(name,data){
    utils.log("name : ```"+data+"```");
    fs.writeFileSync("./public/"+name+".json",JSON.stringify(data));
}
function backup2(name,data){
    utils.log("name : ```"+data+"```");
    fs.writeFileSync("./private/"+name+".json",JSON.stringify(data));
}
function save_shop_image(event,shop_id){
    utils.log(event.files[0].url_private_download);
    console.log(event.files[0].url_private_download);
    var title = event.files[0].url_private_download.split('/').pop();
    console.log("title",title);
    file=utils.download(shop_id,title,event.files[0].url_private_download);
    console.log(shop);
    console.log(shop_id);
    console.log(shop[shop_id]);
    img_list.push({"shop_id":shop_id,"img_name":title});
//    shop[shop_id].image.push(title);
    slack("公開の許可をお願いします。\n```shop_id : "+shop_id+" , image_name : "+title+"```","GCS4TEWGZ");
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

function resize(shop_id,file){
    im.resize({
        srcData: fs.readFileSync('./private/raw/'+shop_id+'/'+file, 'binary'),
        width:   256
    }, function(err, stdout, stderr){
        if (err) throw err
        fs.writeFileSync('./public/'+shop_id+'/'+file, stdout, 'binary');
        console.log('image is resized.')
    });
}

function convert(data){
	  var Data = data.split(':');
	  Data[1] = (Data[1]/60).toFixed(2).slice(-3);
      Data = Data.join('');
	  return Data;
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

function admin(event){
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

function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

rtm.on("hello",(event)=>{
    utils.log("hello slack");
    console.log("start slack process");
});

rtm.on("message",(event)=>{
    var channel = event.channel;
    console.log("event",event);
    if(event.text){event.text = event.text.replace('　',' ');}
    var ts = parseInt(event.ts);
	var dt = new Date();
	var form_time = dt.toFormat("YYYY/MM/DD/HH24:MI");
    var shopd=get_mogiid(event);
	if(event.channel=="GCS4TEWGZ"){
//		admin(event);
        if(event.text.split(' ')[0]=="add"){
            resize(event.text.split(' ')[1],event.text.split(' ')[2]);
            shop[event.text.split(' ')[1]].image.push(event.text.split(' ')[2]);
            img_list.push({"shop_id":event.text.split(' ')[1],"img_name":event.text.split(' ')[2]});
            for(var i in img_list){
                if(img_list[i].img_name == event.text.split(' ')[2]){
                    img_list.splice(i,1);
                    break;
                }
            }
            slack("画像を公開します","GCS4TEWGZ");
        }else if(event.text.split(' ')[0]=="del"){
            fs.unlinkSync("./public/"+event.text.split(' ')[1]+"/"+event.text.split(' ')[2]);
    		var cnt = shop[shop_id].image.indexOf(event.text.split(' ')[2]);
			shop[shop_id].image.splice(cnt,1);
            slack("画像を削除しました","GCS4TEWGZ");
        }else if(event.text.split(' ')[0]=='show'){
            if(img_list.length>0) slack("```"+JSON.stringify(img_list)+"```","GCS4TEWGZ"); 
            else slack("現在、許可待ちの画像はありません","GCS4TEWGZ");
        }else if(event.text.split(' ')[0]=='cancel'){
            var length = img_list.length;
            for(var i in img_list){
                if(img_list[i].img_name == event.text.split(' ')[2]){
                    img_list.splice(i,1);
                    break;
                }
            }
            if(i==length) slack("一致する画像がありません","GCS4TEWGZ");
            else slack("キャンセルしました","GCS4TEWGZ");
        }
        backup("shop",shop);
        backup2("img_list",img_list);
		return;
	}else if(event.channel=="CD0KZSRQ9"){
		if(event.files){
			photos.push(utils.download("photo_club",event.files[0].title,event.files[0].url_private_download));
            slack("公開の許可をお願いします。\nshop_id : photo_club , image_name : "+event.files[0].title,"GCS4TEWGZ");
            slack(JSON.stringify(photos),event.channel);
		}
		return;
	}else if(shopd){
        shop_id=shopd[0];
        shop_name=shopd[1];
        if(!shop[shop_id]) shop[shop_id]={"shopname":shop_name,"goods":[],"image":[],"label":[],"boothId":channel};
        if(!shop[shop_id].shopname) shop[shop_id].shopname=shop_name;
        if(!shop[shop_id].boothId) shop[shop_id].boothId = account[channel].boothid;
        console.log(shop_id,shop_name);
    }else{
        return;
    }
    slack_id = event.user;
    if(event.attachments){
        var title = (event.attachments[0].files[0].url_private_download).split('/').pop();
        resize(shop_id,title);
    }
    if(event.text.split(" ")[0]===".help"){
        slack("\`\`\`"+shop_name+"\`\`\`",event.channel);
        utils.help(event);
    }else if(event.text.split(" ")[0]===".text"){
        shop[shop_id].text = event.text.slice(6);
        shop[shop_id].tstamp = ts;
        slack("テキストが登録されました.",channel);
    }else if(event.text.split(" ")[0]===".entry"){
		var Name = event.text.split(' ');
		Name.shift();
		shop[shop_id].shopname = Name.join(' ');
        slack("店舗名が登録されました.",channel);
    }else if(event.text.split(' ')[0]==='.goods'){
        if(event.text.split(' ').length != 3){
            slack('商品名または値段の入力方法に誤りがあります.\ne.g.\n.goods <goods name> <price>',channel);
            return ;
        }
        var cnt;
        var Name = event.text.split(' ')[1];
        var Price = event.text.split(' ')[2];
        console.log(shop);
        console.log(shop[shop_id].goods[0]);
        for(cnt=0;cnt<shop[shop_id].goods.length;cnt++){
            if(shop[shop_id].goods[cnt]["name"] == Name){
                shop[shop_id].goods[cnt]["first_price"] = shop[shop_id].goods[cnt]["price"];
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
    }else if(event.text.split(' ')[0]==='.del_goods'){
		var cnt;
		var Name = event.text.split(" ")[1];
		for(cnt=0;cnt<shop[shop_id].goods.length;cnt++){
	        if(shop[shop_id].goods[cnt]["name"] == Name){
	            shop[shop_id].goods.splice(cnt,1);
	            slack("商品を削除しました.",channel);
	            return ;
        	}
    	}
    }else if(event.text.split(' ')[0]==='.del_price'){
		var cnt;
		var Name = event.text.split(" ")[1];
		for(cnt=0;cnt<shop[shop_id].goods.length;cnt++){
	        if(shop[shop_id].goods[cnt]["name"] == Name){
	            delete shop[shop_id].goods[cnt].first_price;
	            slack("初期の値段を削除しました.",channel);
	            return ;
        	}
    	}
    }else if(event.text.split(' ')[0]==='.show_tag'){
        tag_message(tag,channel);
    }else if(event.text.split(' ')[0]==='.del_tag'){
		var tags = event.text.split(' ');
        var cnt;
		tags.shift();
        for(let i in tags){
			cnt = shop[shop_id].label.indexOf(tags[i])
            if(cnt!==-1){
                shop[shop_id].label.splice(cnt,1);
                shop[shop_id].tstamp = ts;
        		slack("タグが削除されました.",channel);
            }
        }
    }else if(event.text.split(' ')[0]==='.del_img'){
		var cnt = shop[shop_id].image.indexOf(event.text.split(' ')[1]);
		if(cnt>=0){
			shop[shop_id].image.splice(cnt,1);
			slack("画像を削除しました.",channel);
            if(isExistFile("./public/"+shop_id+"/"+event.text.split(' ')[1])=='true') fs.unlinkSync("./public/"+shop_id+"/"+event.text.split(' ')[1]);
			return ;
		}else{
			slack("一致する画像がありません.",channel);
			return ;
		}
    }else if(event.text.split(' ')[0]==='.rewiew'){
        screen('./private/view/'+shop_id,shop_id);
    }else if(event.text.split(' ')[0]==='.show'){
        slack("```"+
            "name : "+JSON.stringify(shop[shop_id]["shopname"])+"\n"+
            "goods : "+JSON.stringify(shop[shop_id]["goods"])+"\n"+
            "image : "+JSON.stringify(shop[shop_id]["image"])+"\n"+
            "label : "+shop[shop_id]["label"]+"\n"+
            "```",event.channel);
    }else if(event.text.split(' ')[0]==='.event'){
        try{
            if(event.text.split(' ').length != 8){
                slack('registed data is invarid.\n'+
                    'e.g.\n'+
                    '.event <date> <start_time> <end_time> <place> <name> <content> <from>\n'+
                    'ex.\n'+
                   '.event 22 18:00 19:00 第一体育館 後夜祭 演出部門によるプロジェクションマッピング 演出部門',
                        channel);
                return ;
            }
            var date = event.text.split(' ')[1];
            var start_time = event.text.split(' ')[2];
            var end_time = event.text.split(' ')[3];
            var place = event.text.split(' ')[4];
            var name = event.text.split(' ')[5];
            var content = event.text.split(' ')[6];
            var from = event.text.split(' ')[7];
            var time = '2018/10/'+date+'/'+start_time+':00';
			var display_time = convert(start_time);
			var duration = (convert(end_time)-convert(start_time)).toFixed(2);
            events[events.length] = {"id":events.length,"date":date,"time":time,"display_time":display_time,"duration":duration*1,"start_time":start_time,"end_time":end_time,"place":place,"name":name,"content":content,"from":from,"tstamp":ts};
            if(events[0].id == "id") events.shift();
    	    events = utils.json_sort(events);
            slack("イベントが登録されました.",channel);			
        }catch(e){
            console.log(e);
			slack("想定外のエラーが発生しました",channel);
        }
    }else if(event.text.split(' ')[0]==='.news'){
        var from = event.text.split(' ')[1];
		var content = event.text.split(' ')[2];
		var start_time = form_time.slice(11,16);
		var date = form_time.slice(8,9);
        console.log(news);
		news[news.length] = {"id":news.length,"date":date,"time":form_time,"display_time":convert(start_time),"duration":"-1","start_time":start_time,"end_time":"-1","place":"-1","name":"-1","content":content,"from":from,"tstamp":ts};
        news = utils.news_sort(news);
        slack("ニュースが登録されました.",channel);	
    }else if(event.text.split(' ')[0]==='.show_event'){
        var events_text = JSON.stringify(events,null,'\t')
        slack(events_text,channel);
    }else if(event.text.split(' ')[0]==='.show_news'){
        var newss_text = JSON.stringify(news,null,'\t')
        slack(newss_text,channel);
    }else if(event.text.split(',')[0]==='.read_event'){
    	var event_text = event.text.split(',');
    	event_text.shift();
    	for(let item of event_text) slack(item,channel);
    }else if(event.text.split(' ')[0]==='.resize'){
        try{
            for(let i in shop[shop_id].image){
                console.log(shop[shop_id].image[i]);
                resize(shop_id,shop[shop_id].image[i]);
            }
//            slack(リサイズが終わりました);
        }catch(e){
             console.log(e);
        }
    }else if(event.text.split(' ')[0]==='.tag'){
        var tags = event.text.split(' ');
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
                if((tags[i]==tag[j].id)&&(shop[shop_id].label.indexOf(tag[j].id)==-1)){
                    console.log("tag",tag[j].id);
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
    }else if(event.text.split(' ')[0]==='.tag_help'){
        tag_message(tag,channel);
    }else if(event.text.split(' ')[0]==='.tag_save'){
        try{
            var tags = {"id":tag.length,"tag":event.text.split(' ')[1]};
            tag.push(tags);
        }catch(e){
            console.log(e);
        }
    }
    if(event.files !== undefined){
        save_shop_image(event,shop_id);
    }
    backup("shop",shop);
    backup("tag",tag);
    backup("events",events);
    backup("news",news);

    tmpl.make_shop_json();
    tmpl.make("shop","shop");
    tmpl.make("news","news");
    tmpl.make("shop","gallery");
});

if(require.main ===module);{
    if(SLACK_TOKEN === undefined){
        console.log("slack token is not defined");
    }
    console.log(account);
    utils.log("start process");
    create_json();
    list = utils.read_list();
    rtm.start();
}
