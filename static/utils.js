var fs = require('fs'), 
	path = require('path');

/**
 * Register the partials on handlebars
 */
exports.registerPartials = function(handlebars, srcPath) {
	var filePath;
	
	fs.readdir(srcPath, function(readError, files){
		
		if( readError )
			return true;
		
		files.forEach(function(file) {
			
			filePath = path.join(srcPath, file);
			
			fs.readFile(filePath, 'utf8', function(fileErr, data){
				if (fileErr) 
					throw fileErr;
					
				handlebars.registerPartial(file.replace(path.extname(file), ''), data);
			});
			
		});
		
	});	
};

/**
 * Create dir recursively
 */
exports.recursiveMkdir = function(srcPath) {
	
	var paths = srcPath.split(path.sep), current = '', exists;
	
	paths.forEach(function(p){
		
		current = path.join(current, p);

		exists = fs.existsSync(current);
		
		if( !exists ) {
			fs.mkdirSync( current );
		}		
		
	});
	
};

/**
 * Pads the number with zeros
 */
exports.padNumber = function(num, size) {
	var s = String(num);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
};