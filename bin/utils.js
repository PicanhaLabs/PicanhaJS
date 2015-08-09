var fs		= require('fs'),
	Promise = require('promise'),
	ncp 	= require('ncp').ncp,
	path	= require('path');

/**
 * Recursive copy that returns promise
 * @param src Source path to copy recursively
 * @param dest destiny path that source copy will be created
 * @returns {Promise}
 */
exports.recursiveCopy = function (src, dest) {
	return new Promise(function(resolve) {
		ncp(src, dest, function(error) {
			if( error )
				throw error;

			resolve();
		});
	});
};

/**
 * Register the partials on handlebars
 */
exports.registerPartials	= function(handlebars, srcPath) {
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
exports.recursiveMkdir		= function(srcPath) {
	
	var paths = srcPath.split(path.sep), current = '', exists;
	
	paths.forEach(function(p){
		
		current = path.join(current, p);
		exists	= fs.existsSync(current);
		
		if( !exists ) {
			fs.mkdirSync( current );
		}		
		
	});
	
};

/**
 * Pads the number with zeros
 */
exports.padNumber			= function(num, size) {
	var s = String(num);
	while (s.length < (size || 2))
		s = "0" + s;

	return s;
};

function extend( defaultobj, customobj ) {
	
	for (var prop in customobj) {
		if (Object.prototype.toString.call(customobj[prop]) == '[object Object]' 
			&& defaultobj.hasOwnProperty(prop))
			defaultobj[prop] = extend(defaultobj[prop], customobj[prop]);
		else
			defaultobj[prop]  = customobj[prop];
	}

	return defaultobj
};

exports.extend = extend;

exports.formatData = function(date) {
	var monthNames = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"
	];

	var day			= date.getDate(),
		monthIndex	= date.getMonth(),
		year		= date.getFullYear(),
		ordinalDay	= day.toString().slice(-1);

	if (parseInt(ordinalDay) === 1)
		ordinalDay += 'st';
	else if (parseInt(ordinalDay) === 2)
		ordinalDay += 'nd';
	else
		ordinalDay += 'th';

	return monthNames[monthIndex] + ' ' + ordinalDay + ', ' + year;
}