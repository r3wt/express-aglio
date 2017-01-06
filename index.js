var _ = require('lodash');
var await = require('async-await-callables'); // see https://www.npmjs.com/package/async-await-callables for api
var aglio = require('aglio');

var _options = {
	
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
	
	var appListen = app.listen,
		appListenArguments = [];
	
	app.listen = function(){
		options.log('app.listen (deferred)');
		appListenArguments = arguments;
	};
	require('./lib/validateOptions')(options);
	
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
			
			//sixth and final step: setup watch and routes
			if(options.watch){
				//build docs on every change.
				var watch = require('node-watch');
				watch(options.source,buildFn);
				options.log('express-aglio: watching filesystem for changes');
			}
			if(options.expose){
				var express = require('express');
				options.log(options);
				app.use(options.uri,express.static(options.serveDir));
				
			}
			
			var routes = app._router.stack;
			options.log(routes);
  
			app.listen = appListen;
			options.log('app.listen (real)');
			app.listen.apply(app,appListenArguments);
		});
		
	});
	
};