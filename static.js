var fs = require('fs'),
	fm = require('front-matter'),
	marked = require('marked'),
    path = require('path'),
	utils = require('./static/utils'),
	parameters = {
		dist: './_build/',
		posts: {
			dist: { 
				path: ':year/:month/:day/:name/',
				name: 'index.html'
			},
			source: './_posts'
		}
	};
	
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

var isFile, filePath, newFilePath, newFileName;

fs.readdir(parameters.posts.source, function(readError, files){
	
	if( readError )
		throw readError;
	
	files.forEach(function(file) {
	
		filePath = path.join(parameters.posts.source, file);
		
		fs.stat(filePath, function(statsError, stats){
	
			if( stats.isDirectory() )
				return true;
				
			if( statsError )
				throw statsError;		
				
			fs.readFile(filePath, 'utf8', function(fileErr, data){
				if (fileErr) 
					throw fileErr
				
				var content = fm(data);
				
				content.body = marked(content.body);
				
				newFilePath = parameters.posts.dist.path.replace(':year', stats.ctime.getFullYear());
				newFilePath = newFilePath.replace(':month', stats.ctime.getMonth());
				newFilePath = newFilePath.replace(':day', stats.ctime.getDay());
				newFilePath = newFilePath.replace(':name', file.split('.')[0]);
				
				newFilePath = path.join(parameters.dist, newFilePath);
				
				newFileName = path.join(newFilePath, parameters.posts.dist.name);
				
				utils.recursiveMkdir(newFilePath);
				
				console.log('Creating post: ' + newFileName);
				
				fs.writeFile(newFileName, content.body, function(writeError){
					if( writeError )
						throw writeError;
				});
			})	
			
		});
		
		return ;
		
	});
	
});