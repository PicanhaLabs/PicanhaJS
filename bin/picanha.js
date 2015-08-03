#!/usr/bin/env node

process.title	= 'picanha';

var fs 			= require('fs'),
	command 	= process.argv.slice(2);
	path 		= require('path'),
	Promise 	= require('promise'),
	ncp 		= require('ncp').ncp,
	clientpath	= process.cwd(),
	libpath 	= process.mainModule.paths[1] + '/picanhajs';

if (command[0] === 'create') {
	console.log('Preparing BBQ.\n');
	
	var postsPormise = new Promise(function(resolve) {
		ncp(libpath + '/_posts', clientpath + '/_posts', function() {
			console.log('Seasoning the meat...');
			resolve();
		});
	});

	var templatesPormise = new Promise(function(resolve) {
		ncp(libpath + '/_templates', clientpath + '/_templates', function() {
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

	var len			= 0,
		counter		= 1,
		postsData	= [],
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
	function createHome(posts) {
		fs.readFile(path.join(parameters.template.path, parameters.template.home), 'utf8', function(fileErr, data){
			
			if( fileErr )
				throw fileErr;
			
			var tpl		= handlebars.compile(data),	
				result	= tpl({
					posts	: posts,
					globals : {
						baseurl: ''
					}
				});
			
			console.log('Creating home');
			
			fs.writeFile(path.join(parameters.dist, 'index.html'), result, function(writeError){
				if( writeError )
					throw writeError;
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

	function makePost( filePath, len ){
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
				
				/**
				 * Temporary my ass * solution for this callback hell
				 * For create the home/index file, we must all posts data
				 */
				if( counter >= len )
					createHome(postsData);
				
				counter++;
			});
			
		});
	};

	function buildPosts(files){
		
		len = files.length;
		
		files.forEach(function(file) {
		
			makePost(path.join(parameters.posts.source, file), len);
			
		});
		
	};

	parameters.template.static.forEach(function(current){
		ncp(path.join(clientpath, parameters.template.path, current), path.join(clientpath, parameters.dist, current));
	});

	/**
	 * Reads the posts files, and make the distribution post file
	 */
	readDir(parameters.posts.source)
		.then(buildPosts)
		.catch(console.log);
}