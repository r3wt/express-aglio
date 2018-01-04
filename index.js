const _ = require('lodash');
const await = require('async-await-callables'); // see https://www.npmjs.com/package/async-await-callables for api
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


module.exports = function( app, options ) {
	
	//first step: parse and validate options.
	options = _.extend({},_options,options);	
	
	require('./lib/validateOptions')(options);
    
    var outputIsDir = fs.lstatSync(options.output).isDirectory();
    options.serveDir = options.output;
    
    if(!outputIsDir){
		options.serveDir = options.serveDir.split('/');
		options.serveDir.pop();
		options.serveDir = options.serveDir.join('/') +'/';
	}
    
    //mount doc route immediately
    if(options.expose){
        var express = require('express');
        options.log(options);
        app.use(options.uri,express.static(options.serveDir));
    }
	
	
	//second step: generate the file list
	require('./lib/generateFileList')(options,function(fileList){
		
		//third step: generate the build step
		var build = [];
		fileList.forEach(function(fStruct){
			build.push(function(next){
					aglio.renderFile( fStruct.source, fStruct.output,options.aglioOptions,function (err, warnings) {
					if(err){
						options.log('express-aglio: error building doc from source file `%s`'+"\r\n",fStruct.source);
						options.log('express-aglio: aglio error details '+"\r\n");
						options.log(err);
						next(err);
					}else{
						next();
					}
				});	
			});
		});
		
		//fourth step: run first build
		var buildFn = function(next){ 
		
			await(build,function(errors,results){
				
				if(errors){
					options.log('express-aglio: error building docs; some docs did not compile successfully.');
				}else{
					options.log('express-aglio: docs built successfully');
				}
				if(typeof next == 'function') next(); //closes #1
			});
			
		};
		
		//fifth step: make first build
		await([buildFn],function(){
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