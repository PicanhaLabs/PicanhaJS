var fs = require('fs'),
	fm = require('front-matter'),
	marked = require('marked'),
	path = require('path'),
	Promise = require('promise'),
	highlight = require('highlight.js'),
	ncp = require('ncp').ncp,
	handlebars = require('handlebars'),
	utils = require('./static/utils'),
	parameters = require('./config.json');
	
utils.registerPartials( handlebars, path.join(parameters.template.path, parameters.template.partials) );
	
/**
 * @TODO maybe this can be reallocated to the .json config file too
 */
marked.setOptions({
	renderer: new marked.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false,
	highlight: function (code) {
		return highlight.highlightAuto(code).value;
	}
});

var isFile, newFilePath, newFileName, len = 0, counter = 1, postsData = [], postTpl;

/**
 * Creates the index file
 */
function createHome(posts) {
	fs.readFile(path.join(parameters.template.path, parameters.template.home), 'utf8', function(fileErr, data){
		
		if( fileErr )
			throw fileErr;
		
		var tpl = handlebars.compile(data);
		
		var result = tpl({
			posts: posts,
			globals: {
				baseurl: ''
			}
		});
		
		console.log('Creating the home index.html');
		
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

function makePost( filePath, len, tpl ){
	fs.stat(filePath, function(statsError, stats){

		if( stats.isDirectory() )
			return true;
			
		if( statsError )
			throw statsError;		
			
		fs.readFile(filePath, 'utf8', function(fileErr, data){
			if (fileErr) 
				throw fileErr;
			
			var content = fm(data),
				result = content.attributes;
				
			result.body = marked(content.body);
			
			newFilePath = parameters.posts.dist.path.replace(':year', stats.ctime.getFullYear());
			newFilePath = newFilePath.replace(':month', utils.padNumber(stats.ctime.getMonth() + 1, 2));
			newFilePath = newFilePath.replace(':day', utils.padNumber(stats.ctime.getDate(), 2));
			newFilePath = newFilePath.replace(':name', path.basename(filePath).split('.')[0]);
			
			newFilePath = path.join(parameters.dist, newFilePath);
			
			newFileName = path.join(newFilePath, parameters.posts.dist.name);
			
			utils.recursiveMkdir(newFilePath);
			
			console.log('Creating post: ' + newFileName);
			
			result.url = newFileName.replace( path.normalize(parameters.dist), '' ).replace(/\\/g, '/');
			
			postsData.push(result);
			
			var html = tpl({
				post: result,
				globals: {
					baseurl: '../../../../'
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
			if( counter >= len ) {
				createHome(postsData);
			}
			
			counter++;
		})
		
	});
};

function buildPosts(files){
	
	len = files.length;
	
	var postHtml = fs.readFileSync(path.join(parameters.template.path, parameters.template.post), {encoding: 'utf8'});
	
	postTpl = handlebars.compile(postHtml);
	
	files.forEach(function(file) {
	
		makePost(path.join(parameters.posts.source, file), len, postTpl);
		
	});
	
};

parameters.template.static.forEach(function(current){
	ncp(path.join(parameters.template.path, current), path.join(parameters.dist, current));
});

/**
 * Reads the posts files, and make the distribution post file
 */
readDir(parameters.posts.source)
	.then(buildPosts)
	.catch(console.log);