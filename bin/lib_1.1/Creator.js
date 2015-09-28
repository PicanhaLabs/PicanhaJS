'use strict';


// Dependencies
var _			= require('underscore'),
	path 		= require('path'),
	Utils		= require('./Utils'),
	clientpath	= process.cwd(),
	libpath 	= process.mainModule.paths[2] + '/picanhajs';


class Creator {
	constructor() {
		this.paths = {
			lib: libpath,	
			cli: clientpath	
		};
	}

	get toCopy() {
		return ['/_posts', '/_templates'];
	}

	create() {
		let me			= this,
			promises	= [];


		console.log('\n\x1b[31mPreparing BBQ.\x1b[0m\n');


		_.each(me.toCopy, (current) => {
			let p1 = path.join(me.paths.lib, current),
				p2 = path.join(me.paths.cli, current),
				cp = Utils.recursiveCopy(p1, p2);

			promises.push(cp);
		});
	

		Promise.all(promises).then( () => console.log('\x1b[36mYou can start cooking!\x1b[0m') });
	}
}

module.exports = Creator; 