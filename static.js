var fs = require('fs'),
	fm = require('front-matter'),
	marked = require('marked'),
    path = require('path'),
    handlebars = require('handlebars'),
	utils = require('./static/utils');

/**
 * @TODO reallocate this parameters to an .json config file
 */
var parameters = {
	dist: './_build/',
	posts: {
		dist: { 
			path: ':year/:month/:day/:name/',
			name: 'index.html'
		},
		source: './_posts'
	},
	template: {
		home: './_templates/home.html',
		post: './_templates/post.html',
		partials: './_templates/partials'
	}
};
	
utils.registerPartials( handlebars, parameters.template.partials );
	
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
	smartypants: false
});

var isFile, newFilePath, newFileName, len = 0, counter = 1, postsData = [], postTpl;

/**
 * Creates the index file
 */
function createHome(posts) {
	fs.readFile(parameters.template.home, 'utf8', function(fileErr, data){
		
		if( fileErr )
			throw fileErr;
		
		var tpl = handlebars.compile(data);
		
		var result = tpl({
			posts: posts
		});
		
		console.log('Creating the home index.html');
		
		fs.writeFile(path.join(parameters.dist, 'index.html'), result, function(writeError){
			if( writeError )
				throw writeError;
		});
	});
}

/**
 * Reads the posts files, and make the distribution post file
 */
fs.readdir(parameters.posts.source, function(readError, files){
	
	if( readError )
		throw readError;
	
	len = files.length;
	
	var postHtml = fs.readFileSync(parameters.template.post, {encoding: 'utf8'});
	
	postTpl = handlebars.compile(postHtml);
	
	files.forEach(function(file) {
	
		(function( filePath ){
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
					newFilePath = newFilePath.replace(':name', file.split('.')[0]);
					
					newFilePath = path.join(parameters.dist, newFilePath);
					
					newFileName = path.join(newFilePath, parameters.posts.dist.name);
					
					utils.recursiveMkdir(newFilePath);
					
					console.log('Creating post: ' + newFileName);
					
					result.url = newFileName.replace( path.normalize(parameters.dist), '' ).replace(/\\/g, '/');
					
					postsData.push(result);
					
					var html = postTpl({
						post: result
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
		})(path.join(parameters.posts.source, file));
		
	});
	
});