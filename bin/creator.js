var Promise 	= require('promise'),
	path 		= require('path');

function Creator( config ) {
	var options = config || {};

	this.paths = {
		lib: options.libpath,	
		cli: options.clientpath	
	};
}

Creator.prototype = {

	/**
	 * Default paths that will be copied on create
	 */
	get toCopy() {
		return ['/_posts', '/_templates'];
	},
	
	/**
	 * Method to beginbbq Creator
	 */
	create: function( copyFn ) {
		var me = this, promises = [];

		console.log('\n\x1b[31mPreparing BBQ.\x1b[0m\n');

		me.toCopy.forEach(function(current) {
			promises.push(copyFn( path.join(me.paths.lib, current), path.join(me.paths.cli, current) ));
		});
	
		Promise.all(promises).then(function() {
			console.log('\x1b[36mYou can start cooking!\x1b[0m');
		});
	}
};

module.exports = Creator; 