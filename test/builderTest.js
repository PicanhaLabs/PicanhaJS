var assert = require('chai').assert,
	Promise = require('promise'),
	path 	= require('path'),
	ncp		= require('ncp'),
	fs 		= require('fs'),
	utils 	= require('../bin/utils'),
	defaultparams = require('../bin/picanha.json'),
	fm				= require('front-matter'),
	marked			= require('marked'),
	parameters		= require('../bin/picanha.json'),
	handlebars		= require('handlebars');

var Creator = require('../bin/builder');

var instance = new Creator({ libpath: '', clientpath: '', commandOpt: 'prod'});
var instance2 = new Creator({ libpath: '', clientpath: '', commandOpt: 'dev'});

utils.registerPartials( handlebars, path.join(parameters.template.path, parameters.template.partials) );

marked.setOptions({
	renderer	: new marked.Renderer(),
	gfm			: true,
	tables		: true,
	breaks		: false,
	pedantic	: false,
	sanitize	: true,
	smartLists	: true,
	smartypants : false
});

var builder = new Creator({ 
	libpath		: '',
	clientpath	: '',
	commandOpt	: 'prod'
});

builder.setParameters(parameters);

builder.setFrontMatterCompiler(fm);

builder.setCopyFn(ncp);

builder.setPostCompiler(marked);

builder.setTemplateCompiler(function( data ) {
	var tpl = handlebars.compile(data);
	return tpl;
});

builder.setLogger(function(){});
instance.setLogger(function(){});
instance2.setLogger(function(){});

instance.setParameters(defaultparams);
instance2.setParameters(defaultparams);

describe('Builder', function(){
	
	before(function(){
        utils.deleteFolderRecursive(path.normalize('./_build'));
    });
	
	describe('Instance', function(){
		it('can be created without parameters', function(){
			var n = new Creator();
			
			assert.isUndefined(n.paths.lib);
			assert.isUndefined(n.paths.cli);
		});
		
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
				instance.copyFn();
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
				assert.isUndefined(instance.globals.prod);
				assert.isUndefined(instance.globals.dev);
			});

			it('should create globals object DEV', function(){
				instance2.setGlobals();
				assert.isObject(instance2.globals);
				assert.isUndefined(instance2.globals.prod);
				assert.isUndefined(instance2.globals.dev);
			});
		});

		describe('createAuthors', function(){
			it('should not receive the authors list', function(){
				instance.createAuthors();
				assert.strictEqual(instance.globals.authors.length, 0);
			});
			
			it('should create the authors array', function(){
				instance.createAuthors( instance.parameters.authors );
				assert.isArray(instance.globals.authors);
			});
		});
		
		describe('findAuthor', function(){
			it('should found an author with his e-mail', function(){
				var founded = instance.findAuthor(instance.parameters.authors[0].email);
				assert.strictEqual(founded.email, instance.parameters.authors[0].email);
			});
			
			it('should return an default if dont found an author', function(){
				var email = 'not and e-mail',
					founded = instance.findAuthor(email);
				assert.strictEqual(founded.email, email);
			});
		});
		
		describe('copyStatic', function(){
			it('should copy the static folder list to the dist folder', function(){
				instance.setCopyFn(ncp);
				instance.copyStatic().then(function(){
					var one = instance.parameters.template.static[0];
					
					assert.isTrue(
						fs.existsSync(path.join(instance.paths.cli, instance.parameters.dist, one))
					);
				});
				
			});
		});

		describe('write', function(){
			it('should reject a promise on try write a file on a non existent path', function(done){
				instance.write('./error/path', '').catch(function(){
					done();
				});
			});
		});

		describe('copy', function(){
			it('should reject a promise on try copy a inexistent file', function(done){
				instance.copy('./error/path', './error').catch(function(){
					done();
				});
			});
		});
		
		describe('buildPosts', function(){
			it('should call makePost for each founded file', function(done){
				instance.makePost = function() {
					return new Promise(function(resolve){ resolve() });	
				};
				
				instance.buildPosts(['a','b','c']).then(function(){
					done();
				});
			});
		});
		
		describe('execute', function(){
			it('should call hierarchically the functions to build the content', function(){
				instance.getFiles = function(){return new Promise(function(resolve){ resolve() });}
				instance.buildPosts = function(){return new Promise(function(resolve){ resolve() });}
				instance.createHome = function(){return new Promise(function(resolve){ resolve() });}
				instance.copyStatic = function(){return new Promise(function(resolve){ resolve() });}
				instance.execute();
			});
		});

		describe('makePost', function(){
			it('create the compiled post file', function(done){
				builder.setGlobals();
				builder.createAuthors(parameters.authors);
				builder.makePost(path.normalize('./_posts/first-post.md')).then(function(writed){
					setTimeout(function(){ //this has no fucking logic
						assert.strictEqual(fs.existsSync(writed), true);
						done();
					}, 10);
				});
			});
			
			it('should reject on file stats error', function(done){
				builder.makePost(path.normalize('./to/error.md')).catch(function(){
					done();
				});
			});
			
			it('should do nothing on receive a directory', function(){
				builder.makePost(path.normalize('./_posts'));
			});

			it('should do nothing on receive a directory', function(){
				delete instance.globals.omitfilename;
				builder.makePost(path.normalize('./_posts'));
			});
			
			it('should create a posts with minimum front matter', function(){
				builder.makePost(path.normalize('./_posts/no-info-post.md')).then(function(writed){
					assert.strictEqual(fs.existsSync(writed), true);
					done();
				});
			});
			
			it('should create a post with page layout', function(){
				builder.makePost(path.normalize('./_posts/about.md')).then(function(writed){
					assert.strictEqual(fs.existsSync(writed), true);
					done();
				});
			});
			
			it('should create a draft post', function(){
				builder.makePost(path.normalize('./_posts/draft.md')).then(function(writed){
					assert.include(writed, '-draft');
					assert.strictEqual(fs.existsSync(writed), true);
					done();
				});
			});
		});

	});
});