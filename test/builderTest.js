var assert = require('chai').assert,
	Promise = require('promise'),
	path 	= require('path'),
	fs 		= require('fs'),
	defaultparams = require('../bin/picanha.json');

var Creator = require('../bin/builder');

var instance = new Creator({ libpath: '', clientpath: '', commandOpt: []});

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
			"dev" : {
				"omitfilename" : false
			},
			"prod" : {
				"omitfilename" : true
			}
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
			it('receives a function to compile html', function(){
				instance.setTemplateCompiler(function(data){
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
		
		describe('createHome', function(){
			
			describe('success', function(){
				it('should create the home html', function(done){
					instance.createHome().then(function(){
						assert.isTrue(
							fs.existsSync(path.join(instance.parameters.template.path, instance.parameters.template.home)), 
							'the home has been created'
						);
						done();
					});
				});
			});
			
			describe('file not found', function(){
				it('should reject an promise file found error', function(done){
					var old = instance.parameters.template.path;
					instance.parameters.template.path = './path/to/error';
					instance.createHome().catch(function(){
						done();
					});
					instance.parameters.template.path = old;
				});
			});
			
			describe('write error', function(){
				it('should reject an promise on cant write file', function(done){
					var old = instance.parameters.dist;
					instance.parameters.dist = './path/to/error';
					instance.createHome().catch(function(){
						instance.parameters.dist = old;
						done();
					});
				});
			});
		});
		
		describe('sortPosts', function(){
			it('should be a function that sort by creation date', function(){
				assert.isFunction(instance.sortPosts);
				
				var result = instance.sortPosts(
					{creationdate: 5},
					{creationdate: 10}
				);
				
				assert.strictEqual(result, 5);
			});
		});
		
		describe('setGlobals', function(){
			it('should create globals object', function(){
				instance.setGlobals();
				assert.isObject(instance.globals);
			});
		});

		describe('createAuthors', function(){
			it('should create the authors array', function(){
				instance.createAuthors();
				assert.isArray(instance.globals.authors);
			});
		});
		
		describe('findAuthor', function(){
			it('should found an author with his e-mail', function(){
				var founded = instance.findAuthor(instance.parameters.authors[0].email);
				assert.strictEqual(founded.email, instance.parameters.authors[0].email);
			});
			
			it('should return an default if dont found an author', function(){
				var email = 'defaultthatnoexists@notfounddomain.com.xsxsxs',
					founded = instance.findAuthor(email);
				assert.strictEqual(founded.email, email);
			});
		});

	});
});