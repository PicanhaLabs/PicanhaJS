'use strict';

// Dependencies
var _			= require('underscore'),
	path 		= require('path');

class Creator {
	constructor(config) {
		if (!config)
			throw Error('Missing config param.');

		var options = config;

		this.paths = {
			lib: options.libpath,	
			cli: options.clientpath	
		};
	}

	get toCopy() {
		return ['/_posts', '/_templates'];
	}

	create(copyFn, verbose) {
		let me			= this,
			promises	= [];

		if (verbose)
			me.log('\n\x1b[31mPreparing BBQ.\x1b[0m\n');


		_.each(me.toCopy, function(current) {
			let p1 = path.join(me.paths.lib, current),
				p2 = path.join(me.paths.cli, current),
				cp = copyFn(p1, p2);

			promises.push(cp);
		});
	
		Promise.all(promises).then(function() {
			if( verbose )
				me.log('\x1b[36mYou can start cooking!\x1b[0m');
		});
	}
}

module.exports = Creator; 