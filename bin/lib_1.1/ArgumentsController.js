'use strict';

// Dependencies
var CommandRouter	= require('./CommandRouter');

class ArgumentsController {

	constructor(args) {
		this.router = new CommandRouter(args.slice(2));
	}

}

module.exports = ArgumentsController; 