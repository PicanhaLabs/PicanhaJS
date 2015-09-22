'use strict';



// dependencies
var assert				= require('chai').assert,
	_					= require('underscore');



// classes
var ArgumentsController = require('../bin/lib_1.1/ArgumentsController'),
	CommandRouter		= require('../bin/lib_1.1/CommandRouter'),
	CustomErrors		= require('../bin/lib_1.1/CustomErrors');



// globals
var ParameterNotFound	= CustomErrors.ParameterNotFound,
	defaultArgs			= ['node', 'picanha'],
	str					= '';



describe('ArgumentsController', function() {

	afterEach(function() {
		console.log(str);
		str = '';
	});

	it('Constructor', function() {
		let AC;

		defaultArgs.push('grill');

		AC = new ArgumentsController(defaultArgs);

		assert.instanceOf(AC.router, CommandRouter);

		defaultArgs.pop();
	});

	it('Constructor no parameter', function() {
		assert.throws(function() {
			return new ArgumentsController();
		},
		ParameterNotFound);
	});

	it('Constructor empty parameter', function() {
		let emptyExamples = [
			null,
			undefined
		];
		
		_.each(emptyExamples, function(el) {
			str += '\tTesting ArgumentsController constructor for ' + el + ' parameter.\n';

			assert.throws(function() {
				return new ArgumentsController(el);	
			},
			ParameterNotFound);
		});
	});

	it('Constructor wrong parameter type', function() {
		let wrongTypesExamples = [
			{},
			0,
			123,
			false,
			true,
			"",
			" ",
			"lipsum"
		];

		_.each(wrongTypesExamples, function(el) {
			str += '\tTesting ArgumentConstroller constructor for ' + el + ' parameter.\n';

			assert.throws(function() {
				return new ArgumentsController(el);	
			},
			TypeError);	
		});
	});
});