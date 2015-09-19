'use strict';

var assert				= require('chai').assert;
var ArgumentsController = require('../bin/lib_1.1/ArgumentsController');
var CommandRouter		= require('../bin/lib_1.1/CommandRouter');

var defaultArgs = ['node', 'picanha'];



describe('ArgumentsController', function() {

	it('Contructor', function() {
		let AC;

		defaultArgs.push('grill');

		AC = new ArgumentsController(defaultArgs);

		assert.instanceOf(AC.router, CommandRouter);

		defaultArgs.pop();
	});

});