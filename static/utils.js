
/**
 * Create dir recursively
 */
exports.recursiveMkdir = function(srcPath) {
	
	var fs = require('fs'), path = require('path');
	
	var paths = srcPath.split(path.sep), current = '', exists;
	
	paths.forEach(function(p){
		
		current = path.join(current, p);

		exists = fs.existsSync(current);
		
		if( !exists ) {
			fs.mkdirSync( current );
		}		
		
	});
	
};