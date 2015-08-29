var assert = require('chai').assert,
	Promise = require('promise');

var Creator = require('../bin/creator');

Creator.prototype.log = function(){};

describe('Creator', function(){
	
	describe('Prototype', function(){
		it('should have an method called "create"', function(){
			assert.isFunction(Creator.prototype.create);
		});
	});
	
	describe('Instance', function(){
		it('receives the lib path and client path', function(){
			var instance = new Creator({ libpath: '', clientpath: '' });
			assert.isString(instance.paths.lib);
			assert.isString(instance.paths.cli);
		});
		
		it('has two paths to copy', function(){
			var instance = new Creator({ libpath: '', clientpath: '' });
			assert.isArray(instance.toCopy);
			assert.strictEqual(instance.toCopy.length, 2);
		});
		
		it('should create the default structure', function(done){
			var instance = new Creator({ libpath: '', clientpath: '' }),
				feito = false,
				copyFn  = function() {
					if( !feito ) {
						feito = true;
						done();
					}
				};
			
			instance.create(copyFn);
		});

		it('should create the default structure', function(done){
			var instance = new Creator({ libpath: '', clientpath: '' }),
				feito = false,
				copyFn  = function() {
					if( !feito ) {
						feito = true;
						done();
					}
				};
			
			instance.create(copyFn, true);
		});

		it('should create the default structure. empty param.', function(){
			assert.throw(Creator, 'Missing config param.');
		});
	});
});