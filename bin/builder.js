var fs 			= require('fs'),
	Promise 	= require('promise'),
	utils 		= require('./utils'),
	path 		= require('path');

function Builder() {
}

Builder.prototype = {
	
	postsData: [],

	parameters: {},

	frontMatterCompiler: null,

	templateCompiler: null,

	postCompiler: null,

	get postTemplate() {
		return this.templateCompiler(fs.readFileSync(path.join(this.parameters.template.path, 'post.html'), {encoding: 'utf8'}));
	},

	get pageTemplate() {
		return this.templateCompiler(fs.readFileSync(path.join(this.parameters.template.path, 'page.html'), {encoding: 'utf8'}));
	},

	setParameters: function(params){
		this.parameters = params;
	},

	setFrontMatterCompiler: function( compiler ){
		this.frontMatterCompiler = compiler;
	},

	setPostCompiler: function( compiler ){
		this.postCompiler = compiler;
	},

	setTemplateCompiler: function( compiler ){
		this.templateCompiler = compiler;
	},

	getFiles: function() {
		var me = this;

		return new Promise(function(resolve, reject){
			
			fs.readdir(me.parameters.posts.source, function(readError, files){
				if( readError )
					reject(readError);
					
				resolve(files);
			});
			
		});
	},

	buildPosts: function(files){
		var me = this, p = [];

		return new Promise(function(resolve){
			
			files.forEach(function(file) {
				p.push(me.makePost(path.join(me.parameters.posts.source, file)));			
			});
	
			Promise.all(p).then(function() {
				resolve();
			});
		});
	},

	makePost: function( filePath ) {
		var me = this, newFilePath, newFileName;

		return new Promise(function(resolve) {

			fs.stat(filePath, function(statsError, stats){

				if( stats.isDirectory() )
					return true;
					
				if( statsError )
					throw statsError;
					
				fs.readFile(filePath, 'utf8', function(fileErr, data){
					if (fileErr) 
						throw fileErr;
					
					var content		= me.frontMatterCompiler(data),
						filename	= path.basename(filePath).split('.')[0],
						result		= content.attributes,
						ispage		= result.template === 'page';
						
					result.body		= me.postCompiler(content.body);
					result.excerpt	= result.excerpt ? '<p>' + result.excerpt + '</p>' : result.body.match(/<p>.+<\/p>/i)[0];

					if( !ispage ) {

						newFilePath = me.parameters.posts.dist.path.replace(':year', stats.ctime.getFullYear());
						newFilePath = newFilePath.replace(':month', utils.padNumber(stats.ctime.getMonth() + 1, 2));
						newFilePath = newFilePath.replace(':day', utils.padNumber(stats.ctime.getDate(), 2));
						newFilePath = newFilePath.replace(':name', filename);
						
						newFilePath = path.join(me.parameters.dist, newFilePath);
						
						newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

						me.postsData.push(result);

					} else {

						newFilePath = path.join(me.parameters.dist, filename);
						newFileName = path.join(newFilePath, me.parameters.posts.dist.name);

					}
					
					utils.recursiveMkdir(newFilePath);
					
					console.log('\x1b[36mCreating: \x1b[0m' + newFileName);
					
					result.url	= newFileName.replace( path.normalize(me.parameters.dist), '' ).replace(/\\/g, '/');
					
					var tpl		= ispage ? me.pageTemplate : me.postTemplate,
						html	= tpl({
							post: result,
							globals: {
								baseurl: ispage ? '../' : '../../../../'
							}
						});				
					
					fs.writeFile(newFileName, html, function(writeError){
						if( writeError )
							throw writeError;
					});
					
					resolve();
				});
				
			});
		});
	},

	createHome: function() {
		var me = this;

		return new Promise(function(resolve, reject){
			fs.readFile(path.join(me.parameters.template.path, me.parameters.template.home), 'utf8', function(fileErr, data){
				
				if( fileErr )
					throw fileErr;
				
				var tpl		= me.templateCompiler(data),	
					result	= tpl({
						posts	: me.postsData,
						globals : {
							baseurl: ''
						}
					});
				
				console.log('\x1b[36mCreating:\x1b[0m home');
				
				fs.writeFile(path.join(me.parameters.dist, 'index.html'), result, function(writeError){
					if( writeError )
						throw writeError;
				});

				resolve();
			});
		});
	},

	execute: function() {
		var me = this;

		me.getFiles()
			.then(me.buildPosts.bind(me))
			.then(me.createHome.bind(me))
			.then(function() {
				me.parameters.template.static.forEach(function(current){
					ncp(path.join(clientpath, me.parameters.template.path, current), path.join(clientpath, me.parameters.dist, current));
				});				
			})
			.catch(console.log);
	}
};

module.exports = Builder;