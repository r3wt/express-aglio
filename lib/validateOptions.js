var fs = require('fs');

module.exports = function(options){
	
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
	
	if(typeof log !== 'function'){
		throw new Error('express-aglio: options.log must be a function. to disable built in logger use options.debug = false.');
	}
	
};