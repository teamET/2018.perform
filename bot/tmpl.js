const ejs=require('ejs');
const ejsLint=require('ejs-lint');
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
        return JSON.parse(fs.readFileSync("./public/"+filename+".json", 'utf8'));
    }catch(e){
        utils.err(e);
        return ;
    }
}

function load_template(filename){
	var file=path.join(__dirname,"./private/views/"+filename+".ejs");
	var data="";
	try{
		return fs.readFileSync(file,'utf-8');
	}catch(e){
		utils.err(e.message);
		return ;
	}
}

function save_html(name,html){
	fs.writeFile(path.join(__dirname,'/public/views/'+name+'.html'),html,(err)=>{
		 if(err){     
			 console.log("error occured"+err.message);
			 throw err;
		 }else{
			utils.log('write file successed');
		}
	});
}

function make_template(filename){
    var data=load_data(filename);
	var template=load_template(filename);
	utils.log('make_tempalte',data,template);
    utils.log(ejsLint(template));
	var html=ejs.render(template,{data: data},(err,str)=>{
		if(err){
			utils.err('ejs error',err);
		}
		utils.log('ejs results',str);
	});
    html=minify(html,{
        minifyJS:true,
        removeComments:true,
        collapseWhitespace:true,
    })
	save_html(filename,html);
	return html
}

module.exports={
	make:make_template
}


if(require.main===module){
    make_template("shop");
}
