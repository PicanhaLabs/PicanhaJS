'use strict';


// Dependencies
var _			= require('underscore'),
	path 		= require('path'),
	Utils		= require('./Utils'),
	clientpath	= process.cwd(),
	libpath 	= process.mainModule.paths[2] + '/picanhajs',
	color		= require('colors/safe');;


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


		console.log(color.red('Preparing BBQ!!'));


		_.each(me.toCopy, (current) => {
			let p1 = path.join(me.paths.lib, current),
				p2 = path.join(me.paths.cli, current),
				cp = Utils.recursiveCopy(p1, p2);

			promises.push(cp);
		});
	

		Promise.all(promises).then(() => console.log(color.cyan('You can start cooking!'));
	}
}

module.exports = Creator; 