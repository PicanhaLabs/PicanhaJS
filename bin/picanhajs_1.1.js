#!/usr/bin/env node
process.title		= 'picanha';

// Dependencies
var ArgumentsController	= require('./lib_1.1/ArgumentsController');

(function (proc) {
	var argumentsCtrl		= new ArgumentsController(proc.argv);

	argumentsCtrl.router.executeAction();
})(process);