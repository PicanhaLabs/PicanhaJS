'use strict';

var assert				= require('chai').assert;
var ArgumentsController = require('../bin/lib_1.1/ArgumentsController');
var CommandRouter		= require('../bin/lib_1.1/CommandRouter');
var CustomErrors		= require('../bin/lib_1.1/CustomErrors');

var ParameterNotFound = CustomErrors.ParameterNotFound;

var defaultArgs = ['node', 'picanha'];



describe('ArgumentsController', function() {

	it('Contructor', function() {
		let AC;

		defaultArgs.push('grill');

		AC = new ArgumentsController(defaultArgs);

		assert.instanceOf(AC.router, CommandRouter);

		defaultArgs.pop();
	});

	it('Contructor no Parameter', function() {
		function t1(){
			return new ArgumentsController();
		}
		function t2(){
			return new ArgumentsController(null);
		}
		function t3(){
			return new ArgumentsController(undefined);
		}

		assert.throws(t1, ParameterNotFound);
		assert.throws(t2, ParameterNotFound);
		assert.throws(t3, ParameterNotFound);
	});

	it('Contructor wrong Parameter type', function() {
		function t1(){
			return new ArgumentsController({});
		}
		function t2(){
			return new ArgumentsController(0);
		}
		function t3(){
			return new ArgumentsController(123);
		}
		function t4(){
			return new ArgumentsController(false);
		}
		function t5(){
			return new ArgumentsController(true);
		}
		function t6(){
			return new ArgumentsController("");
		}
		function t7(){
			return new ArgumentsController(" ");
		}
		function t8(){
			return new ArgumentsController("lipsum");
		}

		assert.throws(t1, TypeError);
		assert.throws(t2, TypeError);
		assert.throws(t3, TypeError);
		assert.throws(t4, TypeError);
		assert.throws(t5, TypeError);
		assert.throws(t6, TypeError);
		assert.throws(t7, TypeError);
		assert.throws(t8, TypeError);
	});

});