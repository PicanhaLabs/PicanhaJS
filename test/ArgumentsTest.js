'use strict';

var assert				= require('chai').assert;
var ArgumentsController = require('../bin/lib_1.1/ArgumentsController');

var defaultArgs = ['node', 'picanha'];



describe('ArgumentsController', function() {

	it('Contructor', function() {
		let AC;

		defaultArgs.push('grill');

		AC = new ArgumentsController(defaultArgs);

		assert.isDefined(AC.router);

		defaultArgs.pop();
	});

	it('Contructor 2', function() {
		let AC;

		defaultArgs.push('grill');

		AC = new ArgumentsController(defaultArgs);

		assert.isNotNull(AC.router);

		defaultArgs.pop();
	});

});