const ejs=require('ejs');
const ejsLint=require('ejs-lint');
const jsonlint=require('jsonlint');
const fs=require('fs');
const minify=require('html-minifier').minify;
const path=require('path');
const utils=require('./utils');

/*
 * make()
 * @param   ./private/views/$(filename).ejs (template)
 *          ./public/$(filename).json (data)
 * @return ./public/views/$(filename).html (html)
 */

function load_data(filename){
    try{
        data=fs.readFileSync("./public/"+filename+".json", 'utf8');
	    utils.log('jsonlint',jsonlint.parse(data));
	    return JSON.parse(data);
    }catch(e){
        utils.err(e);
        return ;
    }
}

function load_template(filename){
	var file=path.join(__dirname,"./views/"+filename+".ejs");
	var data="";
	try{
		tmpl=fs.readFileSync(file,'utf-8');
	    utils.log("ejslint",ejsLint(tmpl));
		return tmpl;
	}catch(e){
		utils.err(e.message);
		return ;
	}
}

function save_html(name,html){
	html=minify(html,{
		minifyJS:true,
		removeComments:true,
		collapseWhitespace:true,
	});

	fs.writeFile(path.join(__dirname,'/public/views/'+name+'.html'),html,(err)=>{
		 if(err){     
			 utils.err("error occured"+err.message);
			 throw err;
		 }else{
			utils.log('write file successed');
		}
	});
}

function render_ejs(template,data){
	var html=ejs.render(template,{data: data},(err,str)=>{
		if(err){
			utils.err('ejs error',err);
		}
		utils.log('ejs results',str);
	});
    return html;
}

function make_template(input,output){
    utils.log("input data:",input,"output template,html:",output);
    var data=load_data(input);
	var template=load_template(output);
    var html=render_ejs(template,data);
	save_html(output,html);
}

function make_shop_json(){
    utils.log("shop.json,map_shop.ejs,map_shop.html");
    var shops={};
    var data=load_data("shop");
	var template=load_template("map_shop");
    for (id in data){
        shops[id]=render_ejs(template,data,{rmWhitespace:true});
        console.log(id,shops[id]);
    }
	fs.writeFile(path.join(__dirname,'/public/map_shop.json'),JSON.stringify(shops),(err)=>{
		 if(err){
			 utils.err("error occured"+err.message);
			 throw err;
		 }else{
			utils.log('write file successed');
		}
	});
}

module.exports={
	make:make_template,
    make_shop_json:make_shop_json
}


if(require.main===module){
    make_shop_json();
    make_template("shop","shop");
    make_template("news","news");
    make_template("shop","gallery");
}
