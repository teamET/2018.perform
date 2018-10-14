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
	var file=path.join(__dirname,"./private/views/"+filename+".ejs");
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
	})

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

function make_template(filename){
    var data=load_data(filename);
	var template=load_template(filename);
    var html=render_ejs(template,data);
	save_html(filename,html);
}

function make_gallery(){
    var data=load_data("shop");
	var template=load_template("gallery");
    var html=render_ejs(template,data);
	save_html("gallery",html);
}

module.exports={
	make:make_template,
	make_gallery:make_gallery
}


if(require.main===module){
    make_template("shop");
    make_gallery();
}
