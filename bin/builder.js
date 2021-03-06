var fs 			= require('fs'),
	Promise 	= require('promise'),
	utils 		= require('./utils'),
	path 		= require('path'),
	crypto 		= require('crypto'),
	moment		= require('moment');

function Builder(config) {
	var options = config || {};

	this.paths	= {
		lib		: options.libpath,
		cli		: options.clientpath
	};

	this.cmdOpts = options.commandOpt;

	this.globals = {};
}

Builder.prototype = {
	
	postsData: [],

	parameters: {},

	frontMatterCompiler: null,

	templateCompiler: null,

	postCompiler: null,
	
	copyFn: function() {},
	
	log: console.log,

	/**
	 * Templates that will be used on build
	 */
	templates: { post: null, page: null },

	setLogger: function( fn ) {
		this.log = fn;
	},

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
			me.readStoreTemplate(current);
		});
	},
	
	/**
	 * Read and store a template
	 */
	readStoreTemplate: function(name) {
		var me = this;
		
		fs.readFile(path.join(me.parameters.template.path, name + '.html'), 'utf8', function(error, data) {
			if (error)
				throw error;

			me.templates[name] = me.templateCompiler(data);
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

	buildPosts: function(files) {
		var me = this, p = [];
		files.forEach(function(file) {
			p.push(me.makePost(path.join(me.parameters.posts.source, file)));			
		});

		return Promise.all(p);
	},

	setGlobals: function() {
		var me = this, glob;

		me.globals = {};

		for (glob in me.parameters.template.globals)
			me.globals[glob] = me.parameters.template.globals[glob];

		if (me.cmdOpts === 'dev' && me.globals.dev) {
			me.globals = utils.extend(me.globals, me.parameters.template.globals.dev);
		} else if (me.globals.prod) {
			me.globals = utils.extend(me.globals, me.parameters.template.globals.prod);
		}

		delete me.globals.prod;
		delete me.globals.dev;
	},

	/**
	 * Make the post compiling with the passed compiler
	 */
	makePost: function( filePath ) {
		var me = this, newFileName, globals = {}, content, filename, result, ispage, page, isdraft;

		return new Promise(function(resolve, reject) {

			fs.stat(filePath, function(statsError, stats) {

				if ( stats && stats.isDirectory())
					return true;
					
				if (statsError) {
					reject(statsError);
					return false;
				}
					
				fs.readFile(filePath, 'utf8', function(fileErr, data) {					

					content				= me.frontMatterCompiler(data);
					result				= content.attributes;
					ispage				= result.template !== 'post' && result.template;
					isdraft				= result.draft;
					
					me.globals.baseurl	= ispage ? '../' : '../../../../';
					
					result.date			= result.date ? moment(result.date, me.parameters.posts.dateformat) : moment();
					result.author		= me.findAuthor(result.author);
					result.creationdate = result.date.valueOf();
					result.creation		= utils.formatData(new Date(result.creationdate));

					page				= me.templateCompiler( me.postCompiler(content.body) );
						
					result.body			= page({ globals: me.globals });

					if( !result.excerpt ) {
						var paragraphs = result.body.match(/<p>.+<\/p>/i);

						if( paragraphs ) {
							result.excerpt = paragraphs[0];
						} else {
							result.excerpt = '';
							me.log('\033[31mThe post "' + result.title + '" does not have suficient informations to make an excerpt\x1b[0m');
						}
					} else {
						result.excerpt	= '<p>' + result.excerpt + '</p>';
					}

					result.description	= result.excerpt.replace(/(<([^>]+)>)/gi, '');

					filename			= path.basename(filePath).split('.')[0];

					
					if (isdraft)
						filename += '-draft';
					
					var dateObj = {year: result.date.year(), month: result.date.month(), date: result.date.date()};						

					if (!ispage)
						newFileName		= me.makePostPath(filename, dateObj);
					else
						newFileName		= me.makePagePath(filename);

					result.url			= newFileName.replace( path.normalize(me.parameters.dist), '' ).replace(/\\/g, '/');


					if (me.globals.omitfilename)
						result.url = result.url.replace(me.parameters.posts.dist.name, '');
					
					
					me.log('\x1b[36mCreating ' + (isdraft ? 'DRAFT' : '') + ': \x1b[0m' + newFileName);


					if( !ispage && !isdraft )
						me.postsData.push(result);

					var tpl		= !ispage ? me.templates.post : me.templates[result.template],
						html	= tpl({
							post	: result,
							globals : me.globals
						});				
					
					me.write(newFileName, html);
					
					resolve(newFileName);
				});
				
			});
		});
	},
	
	/**
	 * Write a file in promise way
	 */
	write: function( path, content ) {
		return new Promise(function(resolve, reject){
			fs.writeFile(path, content, function(writeError){
				if (writeError) {
					reject(writeError);
					return false;
				}
					
				resolve();
			});
		});
	},

	/**
	 * Mount and create the post path (if it does not exist)
	 */
	makePostPath: function(filename, params) {
		var me		= this, newFilePath, newFileName;

		newFilePath = me.parameters.posts.dist.path.replace(':year', params.year);
		newFilePath = newFilePath.replace(':month', utils.padNumber(params.month + 1, 2));
		newFilePath = newFilePath.replace(':day', utils.padNumber(params.date, 2));
		newFilePath = newFilePath.replace(':name', filename);
		
		newFilePath = path.join(me.parameters.dist, newFilePath);
		
		newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

		utils.recursiveMkdir(newFilePath);

		return newFileName;
	},

	/**
	 * Mount and create the page path (if it does not exist)
	 */
	makePagePath: function(filename) {
		var me		= this, newFilePath, newFileName;

		newFilePath = path.join(me.parameters.dist, filename);
		newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

		utils.recursiveMkdir(newFilePath);

		return newFileName;
	},

	sortPosts: function(post1, post2) {
		return post2.creationdate - post1.creationdate;
	},

	createHome: function() {
		var me = this;

		return new Promise(function(resolve, reject) {
			fs.readFile(path.join(me.parameters.template.path, me.parameters.template.home), 'utf8', function(fileErr, data) {
				if( fileErr ) {
					reject(fileErr);
					return;
				}
				
				me.postsData		= me.postsData.sort(me.sortPosts);
				me.globals.baseurl	= '';

				var tpl				= me.templateCompiler(data),	
					result			= tpl({
						posts	: me.postsData,
						globals : me.globals
					});
				
				me.log('\x1b[36mCreating :\x1b[0m home');
				
				fs.writeFile(path.join(me.parameters.dist, 'index.html'), result, function(writeError) {
					if( writeError ) {
						reject(writeError);
						return false;
					}
					
					resolve();					
				});
			});
		});
	},

	createAuthors : function( authors ) {
		var me		= this,
			hash;
		
		me.globals.authors	= authors || [];

		me.globals.authors.forEach(function(el) {
			var md5	= crypto.createHash('md5');
			hash 	= md5.update(el.email).digest("hex");

			for (var size in me.parameters.defaultAuthorSizes) {
				el['pathAvatar-' + size] = 'http://www.gravatar.com/avatar/' + hash + '?d=identicon&s=' + me.parameters.defaultAuthorSizes[size];
			}
		});
	},

	findAuthor : function(email) {
		var me		= this, result, md5, hash;

		result = me.globals.authors.filter(function(el) {
			return el.email === email;
		});

		if (!result.length) {
			md5				= crypto.createHash('md5');
			
			result			= {};
			result.email	= email;
			result.name		= email.split('@')[0];

			hash			= md5.update(email).digest("hex");

			for (var size in me.parameters.defaultAuthorSizes)
				result['pathAvatar-' + size] = 'http://www.gravatar.com/avatar/' + hash + '?d=identicon&s=' + me.parameters.defaultAuthorSizes[size];

		} else {
			result = result[0];
		}

		return result;
	},

	normalizeToIndex: function() {
		var me = this, exclude = ["is", "not", "yes", "aboard", "about", "above", "absent", "across", "after", "against", "along", "alongside", "amid", "amidst", "among", "anti", "around", "as", "at", "atop", "bar", "barring", "before", "behind", "below", "beneath", "beside", "besides", "between", "beyond", "but", "by", "circa", "counting", "concerning", "considering", "despite", "down", "during", "except", "excepting", "excluding", "following", "for", "from", "given", "gone", "in", "in front of", "inside", "instead of", "into", "less", "like", "mid", "minus", "near", "next", "of", "off", "on", "on top of", "onto", "opposite", "out of", "outside", "over", "past", "pending", "per", "plus", "pro", "regarding", "regardless of", "round", "save", "saving", "since", "the", "than", "through", "throughout", "till", "times", "to", "toward", "towards", "under", "underneath", "unlike", "until", "up", "upon", "versus", "via", "with", "within", "without", "worth", "all", "another", "any", "anybody", "anyone", "anything", "both", "each", "each other", "either", "everybody", "everyone", "everything", "few", "he", "her", "hers", "herself", "him", "himself", "his", "I", "it", "its", "itself", "little", "many", "me", "mine", "more", "most", "much", "my", "myself", "neither", "no one", "nobody", "none", "nothing", "one", "one another", "other", "others", "our", "ours", "ourselves", "several", "she", "some", "somebody", "someone", "something", "that", "their", "theirs", "them", "themselves", "these", "they", "this", "those", "us", "we", "what", "whatever", "which", "whichever", "who", "whoever", "whom", "whomever", "whose", "you", "your", "yours", "yourself", "yourselves"];
		
		var group = exclude.join('|').replace(/\s/, "\\s");
		
		me.postsData.map(function(data){
			if( data.author && typeof data.author.name !== 'undefined' ) {
				data.author = data.author.name;
			}
			
			delete data.url;
			delete data.date;
			delete data.banner;
			delete data.excerpt;
			delete data.creation;
			delete data.description;
			
			if( data.body ) {
				data.body = data.body.replace(/(<([^>]+)>)/gi, '');
				data.body = data.body.replace(new RegExp("\\s(" + group + ")(?![A-z0-9\\_\\-])", 'gi'), ' ');
			}
			
			return data;
		});
	},

	indexPosts: function() {
		var me = this;
		
		me.normalizeToIndex();
		
		return new Promise(function(resolve, reject){
			var content = JSON.stringify(me.postsData);
			
			fs.writeFile(path.join(me.parameters.dist, 'indexed.json'), content, function(writeError){
				if (writeError) {
					reject(writeError);
					return false;
				}

				resolve(content);
			});
		});
	},

	execute: function() {
		var me = this;
		me.setGlobals();
		me.createAuthors( me.parameters.authors );

		me.log('\x1b[36mCleaning\x1b[0m');

		utils.deleteFolderRecursive(me.parameters.dist);

		me.getFiles()
			.then(me.buildPosts.bind(me))
			.then(me.createHome.bind(me))
			.then(me.copyStatic.bind(me))
			.then(me.indexPosts.bind(me))
			.catch(me.log);
	},
	
	copyStatic: function() {
		var me = this, promises = [];
		
		me.parameters.template.static.forEach(function(current){
			promises.push(me.copy(
				path.join(me.paths.cli, me.parameters.template.path, current), 
				path.join(me.paths.cli, me.parameters.dist, current)
			));
		});
		
		return Promise.all(promises);
	},
	
	copy: function( from, to ) {
		var me = this;
		
		return new Promise(function(resolve, reject){
			me.copyFn(
				from, to,
				function(err) {
					if( err ) {
						reject(err);
						return false;
					}
					
					resolve();
				}
			);
		});
	}
};

module.exports = Builder;