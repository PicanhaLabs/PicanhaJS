---
title: Primeiro Post
author: Gabriel Alan
categories: Primeiro, Post
tags: Post, Content, Tag
template: page
---

## About

ASDASDASDASd

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