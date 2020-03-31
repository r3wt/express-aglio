const aglio = require('aglio');
const watch = require('node-watch');
const path = require('path');
const fs = require('fs');

const _options = {
	
	source: '',//input path/file eg /docs/source/index.apib OR /docs/source
	output: '',//output path/file eg /docs/html/index.html OR /docs/html
	
	watch: true,
	expose: true,
	uri: '/docs',
	debug: true,
	log: function(){
		this.debug && console.log.apply(console,arguments);
	},
	aglioOptions:{}, //options to pass specifically to aglio
	
};


function validateOptions(options){
	
	var sourceStat = fs.statSync(options.source);
	
	if(!sourceStat.isDirectory() && !sourceStat.isFile()){
		throw new Error('express-aglio: options.source is not a file or directory. check path and try again.');
	}
	
	var outputStat = fs.statSync(options.output);
	
	if(!outputStat.isDirectory() && !outputStat.isFile()){
		throw new Error('express-aglio: options.output is not a file or directory. check path and try again.');
	}
	
	['watch','debug','expose'].forEach(function(prop){
		if(typeof options[prop] !== 'boolean'){
			throw new Error( 'express-aglio: options.%s must be a boolean value (true/false).'.replace('%s',prop) );
		}
	});
	
	if(typeof options.log !== 'function'){
		throw new Error('express-aglio: options.log must be a function. to disable built in logger use options.debug = false.');
	}
	
};


function generateFileList(options,callback){
	
	var sourceIsDir = fs.lstatSync(options.source).isDirectory();
	var outputIsDir = fs.lstatSync(options.output).isDirectory();
    
    options.serveDir = options.output;
	if(!outputIsDir){
		options.serveDir = options.serveDir.split('/');
		options.serveDir.pop();
		options.serveDir = options.serveDir.join('/') +'/';
	}
	
	if(sourceIsDir && outputIsDir){
		
		fs.readdir(options.source,function(err,files){
			if(err)
				options.log('express-aglio: error reading source directory.');
			else
				var fileList = [];
				files.forEach(function(file){
					if(file.slice((file.lastIndexOf(".") - 1 >>> 0) + 2) == 'apib'){
						fileList.push({
							source: file,
							output: file.replace('.apib','.html')
						});
					}
				});
				callback(fileList);
		});
		
	}
	else if(!sourceIsDir && !outputIsDir){
		
		var fileList = [{
			source: options.source,
			output: options.output,
		}];
		
		callback(fileList);
		
	}else{
		throw new Error('express-aglio: output and source must both be either directories or single files.');
	}
};



module.exports = function( app, __options ) {
	
	//first step: parse and validate options.
	const options = {..._options,...__options};	
	
	validateOptions(options);
    
    const outputIsDir = fs.lstatSync(options.output).isDirectory();
    options.serveDir = options.output;
    
    if(!outputIsDir){
		options.serveDir = options.serveDir.split('/');
		options.serveDir.pop();
		options.serveDir = options.serveDir.join('/') +'/';
	}
    
    //mount doc route immediately
    if(options.expose){
        const express = require('express');
        options.log('express-aglio: started with options:',options);
        app.use(options.uri,express.static(options.serveDir));
    }
	
	
	//second step: generate the file list
	generateFileList(options,fileList=>{

        const buildFn = () => {
            return Promise.all(fileList.map(fStruct=>{
			
                return new Promise((resolve,reject)=>{
                    aglio.renderFile( fStruct.source, fStruct.output,options.aglioOptions,function (err, warnings) {
                        if(err){
                            options.log('express-aglio: error building doc from source file `%s`'+"\r\n",fStruct.source);
                            options.log('express-aglio: aglio error details '+"\r\n");
                            options.log(err);
                            reject(err);
                        }else{
                            resolve();
                        }
                    });
                });


            }));
        }
		
		//third step: generate the build step
		buildFn().then(()=>{
            options.log('express-aglio: built docs(startup)');
			//sixth and final step: setup watch and routes
			if(options.watch){
				//build docs on every change.
				watch(path.dirname(options.source),buildFn);
				options.log('express-aglio: watching filesystem for changes');
			}
        });
		
	});
	
};