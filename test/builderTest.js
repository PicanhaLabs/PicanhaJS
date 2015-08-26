var assert = require('chai').assert,
	Promise = require('promise'),
	path 	= require('path'),
	defaultparams = require('../bin/picanha.json');

var Creator = require('../bin/builder');

var instance = new Creator({ libpath: '', clientpath: '' });

/*
{
	"dist"		: "./_build/",
	"posts"		: {
		"dist"		: { 
			"path"		: ":year/:month/:day/:name/",
			"name"		: "index.html"
		},
		"source"	: "./_posts"
	},
	"template"	: {
		"path"		: "./_templates/default_theme/",
		"home"		: "home.html",
		"post"		: "post.html",
		"partials"	: "partials",
		"static"	: ["css", "js", "img"],
		"globals"	: {
			"baseurl"	: "http://static.local/_build/"
		}
	}
}
*/
instance.setParameters(defaultparams);

describe('Builder', function(){
	
	describe('Instance', function(){
		it('receives the lib path and client path', function(){
			assert.isString(instance.paths.lib);
			assert.isString(instance.paths.cli);
		});
		
		describe('getFiles', function(){
			it('read and get a post list', function(done){
				instance.getFiles().then(function(list){
					assert.isArray(list);
					done();
				});
			});
			
			it('should reject a promise if path does not exists', function(done){
				var old = instance.parameters.posts.source;
				instance.parameters.posts.source = './errorpath';
				instance.getFiles().catch(function(){
					done();
				});
				instance.parameters.posts.source = old;
			});
		});
		
		describe('setTemplateCompiler', function(){
			it('receives a function to compile html', function(done){
				var foi = false;
				
				instance.setTemplateCompiler(function(data){
					if( !foi )
						done();
					foi = true;
					assert.isString(data);
					return function() {}
				});
			});
			
			it('pre-compile post and page', function(){
				assert.isFunction( instance.templates.post );
				assert.isFunction( instance.templates.page );
			});
		});
		
		describe('readStoreTemplate', function(){
			it('read and compile a template', function(){
				var fn = function(){
					instance.readStoreTemplate('errorfile');
					
					if( !instance.templates.errorfile )
						throw new Error('template not found');	
				};
				
				assert.throw(fn, Error);
			});
		});
		
		describe('setFrontMatterCompiler', function(){
			it('receives a function to compile front-matter', function(){
				var frontMatterCompiler = function(data) {
					return data;
				}
				
				instance.setFrontMatterCompiler(frontMatterCompiler);
				
				assert.strictEqual(instance.frontMatterCompiler, frontMatterCompiler);
			});
		});
		
		describe('setCopyFn', function(){
			it('receives a function to copy folders and files', function(){
				instance.setCopyFn(function(){
					return true;
				});
			});
		});
		
		describe('setPostCompiler', function(){
			it('should receive an function to compile markdown', function(){
				instance.setPostCompiler(function(md){
					assert.isString(md);
					return md;
				});
			});
		});
		
		describe('makePostPath', function(){
			it('should create the post folder path', function(){
				instance.parameters.posts.dist.path = ":year/:month/:day/:name/";
				
				assert.strictEqual(
					instance.makePostPath('test', {year:2015, month:0, date:1}),
					path.normalize('_build/2015/01/01/test/index.html')
				);
			});
		});
		
		describe('makePagePath', function(){
			it('should create the page folder path', function(){
				assert.strictEqual(
					instance.makePagePath('test'),
					path.normalize('_build/test/index.html')
				);
			});
		});
	});
});