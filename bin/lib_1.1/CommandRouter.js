'use strict';

class CommandRouter {

	constructor(args) {
		this.availableCommands = {
			'beginbbq'	: this.createNewSite.bind(this),
			'grill'		: this.compileExistingSite.bind(this)
		};

		this.command = args[0] || 'beginbbq';
	}

	executeAction() {
		if (!this.availableCommands.hasOwnProperty(this.command))
			throw new Error('Command not found');

		this.availableCommands[this.command]();
	}

	createNewSite() {
		console.log('creating a new site');
	}

	compileExistingSite() {
		console.log('compiling site');
	}

}

module.exports = CommandRouter;