var Promise 	= require('promise'),
	path 		= require('path');

function Command( config ) {
	this.paths = {
		lib: config.libpath,	
		cli: config.clientpath	
	};
}

Command.prototype = {
	
	builder: null,

	/**
	 * Default paths that will be copied on create
	 */
	get toCopy() {
		return ['/_posts', '/_templates'];
	},
	
	/**
	 * Method to beginbbq command
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

module.exports = Command; 