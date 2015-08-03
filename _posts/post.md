---
title: Primeiro Post
author: Gabriel Alan
categories: Primeiro, Post
tags: Post, Content, Tag
---

## Read dir

First post excerpt

```js
function readDir( path ) {
	return new Promise(function(resolve, reject){
		
		fs.readdir(path, function(readError, files){
			if( readError )
				reject(readError);
				
			resolve(files);
		});
		
	});
}
```

## Other Title
### Other Title
#### Other Title