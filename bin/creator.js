var Promise 	= require('promise'),
	path 		= require('path');

function Creator( config ) {
	if (!config)
		throw Error('Missing config param.');

	var options = config;

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

	log: console.log,
	
	/**
	 * Method to beginbbq Creator
	 */
	create: function( copyFn, verbose ) {
		var me = this, promises = [];

		if( verbose )
			me.log('\n\x1b[31mPreparing BBQ.\x1b[0m\n');

		me.toCopy.forEach(function(current) {
			var p1 = path.join(me.paths.lib, current),
				p2 = path.join(me.paths.cli, current),
				cp = copyFn(p1, p2);
			promises.push(cp);
		});
	
		Promise.all(promises).then(function() {
			if( verbose )
				me.log('\x1b[36mYou can start cooking!\x1b[0m');
		});
	}
};

module.exports = Creator; 