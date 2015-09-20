'use strict';

// Dependencies
var CommandRouter	= require('./CommandRouter'),
	Utils			= require('./Utils');

class ArgumentsController {

	constructor(args) {
		try{
			Utils.parameterCheck(Array, args);
		} catch(e) {
			throw e;
		}

		this.router = new CommandRouter(args.slice(2));
	}

}

module.exports = ArgumentsController; 