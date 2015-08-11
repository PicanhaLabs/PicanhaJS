var assert = require('chai').assert,
	Promise = require('promise'),
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
		
		describe('setFrontMatterCompiler', function(){
			it('receives a function to compile front-matter', function(){
				var frontMatterCompiler = function(data) {
					return data;
				}
				
				instance.setFrontMatterCompiler(frontMatterCompiler);
				
				assert.strictEqual(instance.frontMatterCompiler, frontMatterCompiler);
			});
		});
	});
});