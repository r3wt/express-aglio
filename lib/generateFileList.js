var fs = require('fs');

module.exports = function(options,callback){
	
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

function validateEach(files){
	
	files.forEach(function(file){
		
		if(!file.source.slice((file.source.lastIndexOf(".") - 1 >>> 0) + 2) == 'apib'){
			
		}
		
		if(!file.output.slice((file.output.lastIndexOf(".") - 1 >>> 0) + 2) == 'html'){
			
		}
		
	});
	
};
