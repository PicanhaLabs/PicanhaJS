#!/usr/bin/env node

process.title	= 'picanha';

var fs 			= require('fs'),
	command 	= process.argv.slice(2);
	path 		= require('path'),
	Promise 	= require('promise'),
	ncp 		= require('ncp').ncp,
	clientpath	= process.cwd(),
	libpath 	= process.mainModule.paths[2] + '/picanhajs';

if (command[0] === 'beginbbq') {
	console.log('Preparing BBQ.\n');
	
	var postsPormise = new Promise(function(resolve) {
		ncp(path.join(libpath, '/_posts'), path.join(clientpath, '/_posts'), function(error) {
			if( error )
				throw error;

			console.log('Seasoning the meat (in a right way, just salt and pepper)...');
			resolve();
		});
	});

	var templatesPormise = new Promise(function(resolve) {
		ncp(path.join(libpath, '/_templates'), path.join(clientpath, '/_templates'), function(error) {
			if( error )
				throw error;

			console.log('Lighting the fire...');
			resolve();
		});
	});
	

	Promise.all([postsPormise, templatesPormise]).then(function() {
		console.log('\nYou can start cooking!');
	});

} else {
	
	var fm			= require('front-matter'),
		marked		= require('marked'),
		highlight	= require('highlight.js'),
		handlebars	= require('handlebars'),
		utils		= require('./utils'),
		parameters	= require('./picanha.json');

	utils.registerPartials( handlebars, path.join(parameters.template.path, parameters.template.partials) );

	/**
	 * @TODO maybe this can be reallocated to the .json config file too
	 */
	marked.setOptions({
		renderer	: new marked.Renderer(),
		gfm			: true,
		tables		: true,
		breaks		: false,
		pedantic	: false,
		sanitize	: true,
		smartLists	: true,
		smartypants : false,
		highlight 	: function (code) {
			return highlight.highlightAuto(code).value;
		}
	});

	var postsData = [],
		isFile,
		newFilePath,
		newFileName,
		postTpl,
		pageTpl;

	postTpl = handlebars.compile(fs.readFileSync(path.join(parameters.template.path, parameters.template.post), {encoding: 'utf8'}));
	pageTpl = handlebars.compile(fs.readFileSync(path.join(parameters.template.path, 'page.html'), {encoding: 'utf8'}));

	/**
	 * Creates index file
	 */
	function createHome() {
		return new Promise(function(resolve, reject){
			fs.readFile(path.join(parameters.template.path, parameters.template.home), 'utf8', function(fileErr, data){
				
				if( fileErr )
					throw fileErr;
				
				var tpl		= handlebars.compile(data),	
					result	= tpl({
						posts	: postsData,
						globals : {
							baseurl: ''
						}
					});
				
				console.log('Creating home');
				
				fs.writeFile(path.join(parameters.dist, 'index.html'), result, function(writeError){
					if( writeError )
						throw writeError;
				});

				resolve();
			});
		});
	}

	function readDir( path ) {
		return new Promise(function(resolve, reject){
			
			fs.readdir(path, function(readError, files){
				if( readError )
					reject(readError);
					
				resolve(files);
			});
			
		});
	}

	function makePost( filePath ){
		var promise = new Promise(function(resolve) {

			fs.stat(filePath, function(statsError, stats){

				if( stats.isDirectory() )
					return true;
					
				if( statsError )
					throw statsError;		
					
				fs.readFile(filePath, 'utf8', function(fileErr, data){
					if (fileErr) 
						throw fileErr;
					
					var content		= fm(data),
						filename	= path.basename(filePath).split('.')[0],
						result		= content.attributes,
						ispage		= result.template === 'page';
						
					result.body		= marked(content.body);
					result.excerpt	= result.excerpt ? '<p>' + result.excerpt + '</p>' : result.body.match(/<p>.+<\/p>/i)[0];

					if( !ispage ) {

						newFilePath = parameters.posts.dist.path.replace(':year', stats.ctime.getFullYear());
						newFilePath = newFilePath.replace(':month', utils.padNumber(stats.ctime.getMonth() + 1, 2));
						newFilePath = newFilePath.replace(':day', utils.padNumber(stats.ctime.getDate(), 2));
						newFilePath = newFilePath.replace(':name', filename);
						
						newFilePath = path.join(parameters.dist, newFilePath);
						
						newFileName = path.join(newFilePath, parameters.posts.dist.name);

						postsData.push(result);

					} else {

						newFilePath = path.join(parameters.dist, filename);
						newFileName = path.join(newFilePath, parameters.posts.dist.name);

					}
					
					utils.recursiveMkdir(newFilePath);
					
					console.log('Creating: ' + newFileName);
					
					result.url	= newFileName.replace( path.normalize(parameters.dist), '' ).replace(/\\/g, '/');
					
					var tpl		= ispage ? pageTpl : postTpl,
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
		
		return promise;
	};

	function buildPosts(files){
		var p = [];

		return new Promise(function(resolve){
			
			files.forEach(function(file) {
				p.push(makePost(path.join(parameters.posts.source, file)));			
			});
	
			Promise.all(p).then(function() {
				resolve();
			});
		});
	};

	

	/**
	 * Reads the posts files, and make the distribution post file
	 */
	readDir(parameters.posts.source)
		.then(buildPosts)
		.then(createHome)
		.then(function() {
			parameters.template.static.forEach(function(current){
				ncp(path.join(clientpath, parameters.template.path, current), path.join(clientpath, parameters.dist, current));
			});				
		})
		.catch(console.log);
}