var fs = require('fs'),
	path = require('path'),
    assert = require('chai').assert;

var utils = require('../bin/utils');

describe('Utils functions', function() {
    
    before(function(){
        fs.mkdir(path.normalize('./testDir'));
    });
    
    after(function(){
        fs.rmdir(path.normalize('./testDir'));
        fs.rmdir(path.normalize('./testDirCopy'));
        fs.rmdirSync(path.normalize('./testRecursive/RecursiveTest'));
        fs.rmdir(path.normalize('./testRecursive'));
    });
	
	describe('extend', function() {
		it('should copy an object to another', function(){
			var extend1 = utils.extend({a:1}, {a:2});
			var extend2 = utils.extend({a:1, b:'banana'}, {b:'maca'});
			var extend3 = utils.extend({a:1, b:'banana', c:{d:1}}, {a:1, b:'banana', c:{d:2}});
			
			assert.deepEqual(extend1, {a:2});
			assert.deepEqual(extend2, {a:1, b:'maca'});
			assert.deepEqual(extend3, {a:1, b:'banana', c:{d:2}});
		});
	});
	
	describe('padNumber', function() {
		it('should pad a number with zeros', function(){
			assert.strictEqual(utils.padNumber(2, 2), '02', 'Padding 2 with size 2');
			assert.strictEqual(utils.padNumber(22, 2), '22', 'Padding 22 with size 2');
			assert.strictEqual(utils.padNumber(1, 5), '00001', 'Padding 1 with size 5');
		});
	});
	
	describe('recursiveMkdir', function() {
		it('should create recursively an dir', function(){
			utils.recursiveMkdir(path.normalize('./testRecursive/RecursiveTest'));
			
			assert.strictEqual(fs.existsSync(path.normalize('./testRecursive/RecursiveTest')), true, 'the created path must exist');
		});
	});
    
    describe('recursiveCopy', function() {
        it('should copy 1 folder to other place', function(done){
            utils.recursiveCopy(path.normalize('./testDir'), path.normalize('./testDirCopy')).then(function(d){
                fs.exists(d, function(result){
                   done();
                });
            });
        });
    });
	
	describe('registerPartials', function(){
		it('should read an folder an register the files', function(done){
			var tplEngine = {
				done: false,
				registerPartial: function() {
					/* mocha done cant be called two times */
					if( !this.done ) {
						this.done = true;
						done();
					}
				}	
			};
			
			utils.registerPartials(tplEngine, './test');
		});
	});
});