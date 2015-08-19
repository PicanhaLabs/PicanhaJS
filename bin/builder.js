var fs 			= require('fs'),
	Promise 	= require('promise'),
	utils 		= require('./utils'),
	path 		= require('path'),
	crypto 		= require('crypto'),
	moment		= require('moment');

function Builder(config) {
	var options = config || {};

	this.paths	= {
		lib: options.libpath,	
		cli: options.clientpath	
	};
}

Builder.prototype = {
	
	postsData: [],

	parameters: {},

	frontMatterCompiler: null,

	templateCompiler: null,

	postCompiler: null,
	
	copyFn: function() {},

	/**
	 * Templates that will be used on build
	 */
	templates: { post: null, page: null },

	setCopyFn: function(fn) {
		this.copyFn = fn;
	},

	setParameters: function(params) {
		this.parameters = params;
	},

	setFrontMatterCompiler: function(compiler) {
		this.frontMatterCompiler = compiler;
	},

	setPostCompiler: function(compiler) {
		this.postCompiler = compiler;
	},

	/**
	 * Setter of template compiler
	 * This method takes advantage of the object and compiles the default templates
	 */
	setTemplateCompiler: function(compiler) {
		var me = this, toCompile = me.parameters.template.layouts;

		me.templateCompiler = compiler;

		toCompile.forEach(function(current) {
			(function(name) {
				fs.readFile(path.join(me.parameters.template.path, name + '.html'), 'utf8', function(error, data) {
					if (error)
						throw error;
		
					me.templates[name] = me.templateCompiler(data);
				});
			})(current);
		});
	},

	/**
	 * Get the post files and return promise
	 */
	getFiles: function() {
		var me = this;

		return new Promise(function(resolve, reject) {
			
			fs.readdir(me.parameters.posts.source, function(readError, files) {
				if( readError )
					reject(readError);
					
				resolve(files);
			});
			
		});
	},

	buildPosts: function(files){
		var me = this, p = [];

		return new Promise(function(resolve) {
			
			files.forEach(function(file) {
				p.push(me.makePost(path.join(me.parameters.posts.source, file)));			
			});
	
			Promise.all(p).then(function() {
				resolve();
			});
		});
	},

	/**
	 * Make the post compiling with the passed compiler
	 */
	makePost: function( filePath ) {
		var me = this, newFileName, globals, content, filename, result, ispage, page, isdraft;

		return new Promise(function(resolve) {

			fs.stat(filePath, function(statsError, stats) {

				if (stats.isDirectory())
					return true;
					
				if (statsError)
					throw statsError;
				
					
				fs.readFile(filePath, 'utf8', function(fileErr, data) {
					
					if (fileErr)
						throw fileErr;
					

					content				= me.frontMatterCompiler(data);
					result				= content.attributes;
					ispage				= result.template !== 'post' && result.template;
					isdraft				= result.draft;
					globals				= {
											baseurl : ispage ? '../' : '../../../../',
											authors : me.authors
										};

					result.date			= result.date ? moment(result.date, me.parameters.posts.dateformat) : moment();
					result.author		= me.findAuthor(result.author);
					result.creationdate = result.date.valueOf();
					result.creation		= utils.formatData(new Date(result.creationdate));

					page				= me.templateCompiler( me.postCompiler(content.body) );
						
					result.body			= page({ globals: globals });
					result.excerpt		= result.excerpt ? '<p>' + result.excerpt + '</p>' : result.body.match(/<p>.+<\/p>/i)[0];
					result.description = result.excerpt.replace(/<(\/)?.>/gi, '');

					filename			= path.basename(filePath).split('.')[0];

					
					if (isdraft)
						filename += '-draft';
					

					if (!ispage)
						newFileName		= me.makePostPath(filename, result.date);
					else
						newFileName		= me.makePagePath(filename, result.date);


					result.url			= newFileName.replace( path.normalize(me.parameters.dist), '' ).replace(/\\/g, '/');

					
					console.log('\x1b[36mCreating ' + (isdraft ? 'DRAFT' : '') + ': \x1b[0m' + newFileName);


					if( !ispage && !isdraft )
						me.postsData.push(result);
					
					
					var tpl		= !ispage ? me.templates.post : me.templates[result.template],
						html	= tpl({
							post	: result,
							globals : globals
						});				
					
					fs.writeFile(newFileName, html, function(writeError){
						if (writeError)
							throw writeError;
					});
					
					resolve();
				});
				
			});
		});
	},

	/**
	 * Mount and create the post path (if it does not exist)
	 */
	makePostPath: function(filename, momentDate) {
		var me		= this, newFilePath, newFileName;

		newFilePath = me.parameters.posts.dist.path.replace(':year', momentDate.year());
		newFilePath = newFilePath.replace(':month', utils.padNumber(momentDate.month() + 1, 2));
		newFilePath = newFilePath.replace(':day', utils.padNumber(momentDate.date(), 2));
		newFilePath = newFilePath.replace(':name', filename);
		
		newFilePath = path.join(me.parameters.dist, newFilePath);
		
		newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

		utils.recursiveMkdir(newFilePath);

		return newFileName;
	},

	/**
	 * Mount and create the page path (if it does not exist)
	 */
	makePagePath: function(filename, status) {
		var me		= this, newFilePath, newFileName;

		newFilePath = path.join(me.parameters.dist, filename);
		newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

		utils.recursiveMkdir(newFilePath);

		return newFileName;
	},

	createHome: function() {
		var me = this;

		return new Promise(function(resolve, reject) {
			fs.readFile(path.join(me.parameters.template.path, me.parameters.template.home), 'utf8', function(fileErr, data) {
				
				if( fileErr )
					throw fileErr;
				
				me.postsData = me.postsData.sort(function(post1, post2) {
					return post2.creationdate - post1.creationdate;
				});

				var tpl		= me.templateCompiler(data),	
					result	= tpl({
						posts	: me.postsData,
						globals : {
							baseurl: ''
						}
					});
				
				console.log('\x1b[36mCreating :\x1b[0m home');
				
				fs.writeFile(path.join(me.parameters.dist, 'index.html'), result, function(writeError) {
					if( writeError )
						throw writeError;
				});

				resolve();
			});
		});
	},

	createAuthors : function() {
		var me		= this,
			hash;
		
		me.authors	= me.parameters.authors || [];

		me.authors.forEach(function(el) {
			var md5	= crypto.createHash('md5');
			hash 	= md5.update(el.email).digest("hex");

			for (var size in me.parameters.defaultAuthorSizes) {
				el['pathAvatar-' + size] = 'http://www.gravatar.com/avatar/' + hash + '?d=identicon&s=' + me.parameters.defaultAuthorSizes[size];
			}
		});
	},

	findAuthor : function(email) {
		var me		= this, result, md5, hash;

		result = me.authors.filter(function(el) {
			return el.email === email;
		});

		if (!result.length) {
			md5				= crypto.createHash('md5');
			
			result			= {};
			result.email	= email;
			result.name		= email.split('@')[0] || email;

			hash			= md5.update(email).digest("hex");

			for (var size in me.parameters.defaultAuthorSizes)
				result['pathAvatar-' + size] = 'http://www.gravatar.com/avatar/' + hash + '?d=identicon&s=' + me.parameters.defaultAuthorSizes[size];

		} else {
			result = result[0];
		}

		return result;
	},

	execute: function() {
		var me = this;

		me.createAuthors();

		console.log('\x1b[36mCleaning\x1b[0m');

		utils.deleteFolderRecursive(me.parameters.dist);

		me.getFiles()
			.then(me.buildPosts.bind(me))
			.then(me.createHome.bind(me))
			.then(function() {
				me.parameters.template.static.forEach(function(current){
					me.copyFn(
						path.join(me.paths.cli, me.parameters.template.path, current), 
						path.join(me.paths.cli, me.parameters.dist, current)
					);
				});				
			})
			.catch(console.log);
	}
};

module.exports = Builder;