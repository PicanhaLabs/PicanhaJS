'use strict';

// Dependencies
var CustomErrors	= require('./CustomErrors'),
	ncp				= require('ncp').ncp;

var Utils = {
	parameterCheck : function(type, arg) {
		if (!arg && arg !== 0 && arg !== false && arg !== '')
			throw new CustomErrors.ParameterNotFound();
		else if (!(arg instanceof type))
			throw new TypeError("Expected an " + type.toString() + " as parametes for this constructor.");
	},

	recursiveCopy : function (src, dest) {
		return new Promise(function(resolve, reject) {
			ncp(src, dest, function(error) {
				if( error ){
					reject(error);
					return false;
				}

				resolve(dest);
			});
		});
	}
};

module.exports = Utils;
