'use strict';

// Dependencies
var _					= require('underscore'),
	AvailableCommands	= require('./AvailableCommands'),
	helpString			= require('./helpString'),
	Creator				= require('./Creator');

class CommandRouter {

	constructor(args) {
		this.command = args[0] || 'grill';
	}

	executeAction() {
		if (!AvailableCommands.hasOwnProperty(this.command)) {
			this.suggestCommand();
			return false;
		}

		this[AvailableCommands[this.command]['method']]();
	}

	suggestCommand() {
		var me = this,
			suggest;

		_.every(AvailableCommands, function (element, index) {
			suggest = _.contains(element.suggests, me.command) ? index : false;
			return !suggest;
		});

		if (suggest) {
			console.warn('Command "' + me.command + '" was not found. Did you mean "' + suggest + '" ?');
			return false;
		} else {
			throw new Error('Command unknown: ' + me.command);
		}
	}

	createNewSite() {
		new Creator().create();
	}

	compileExistingSite() {
		console.log('compiling site');
	}

	showHelp() {
		console.log(helpString);
	}

}

module.exports = CommandRouter;