[![Build Status](https://travis-ci.org/PicanhaLabs/PicanhaJS.svg?branch=master)](https://travis-ci.org/PicanhaLabs/PicanhaJS) [![Code Climate](https://codeclimate.com/github/PicanhaLabs/PicanhaJS/badges/gpa.svg)](https://codeclimate.com/github/PicanhaLabs/PicanhaJS)  ![Dependencies](https://david-dm.org/PicanhaLabs/PicanhaJS.svg)

<img src="http://blog.picanhalabs.com/img/picanhalabs.svg" alt="Picanha Labs logo" width="200px">


## Main Commands

### Install

```
npm install -g picanhajs
```

### Create

```
mkdir yourpath
cd yourpath
picanha beginbbq
```

### Generate

```
cd yourpath
picanha grill
```

OR

```
cd yourpath
picanha
```

You can also generate your build on developer mode this way:

```
cd yourpath
picanha grill dev
```

###

## Structure

### _posts

Here will be your posts / contents. As other static generators, they will be written in markdown.

Everything you put on frontmatter will be available as variable on templates.


### _templates

You can have as much templates as you want. Each template will be in a folder in this directory.

Sure you can make your own template also. 

You have to configure in your `picanha.json` which template is gonna be used


### _build

This folder will be generated. You can just copy its contents to your server and this your site is working.


## picanha.json

Put your configuration in this file. Place this file in your project's root.


### dist

Name of the folder where build html will be created.

**default**: "./_build"

### posts.source

Name of the path where posts will be found.

**default**: "./_posts"

### posts.dateformat

Format of the 'date' attribute you will provide on frontmatter of posts.

**default**: "DD/MM/YYYY"

### posts.dist.path

Friendly url to be generated for each posts.

*Variables available*: year, month, day, name 

**default**: ":year/:month/:day/:name/"

### posts.dist.name

Name of the file generated for each post.

**default**: "index.html"

### template.path

Name of the path where choosen template will be found

**default**: "./_templates/default_theme/"

### template.home

Name of file that will be rendered as your home page

**default**: "home.html"

### template.partials

Name of folder where your template's partials will be found

**default**: "partials"

### template.static

List of folders used to store your template's static files

**default**: ["css", "js", "img"]

### template.static

List of folders used to store your template's static files

**default**: ["css", "js", "img"]

### template.layouts

List of layouts you will use in your frontmatter. You must have html files in your template with this names.

**default**: ["post", "page"]

### template.globals

Everything you set here will be available on your template.

*reserved word*:
- **omitfilename** [bool]: this will ommit the name of the file on url of posts
- **dev** [object]: properties setted in this object will be available when **grill** command is executed in dev mode.
- **prod** [object]: properties setted in this object will be available when **grill** command is executed in non-dev mode.

**default**: {}

### defaultAuthorSizes

List of sizes used for get authors avatar

**default**: {
				"xsmall"	: 40,
				"small"		: 60,
				"medium"	: 100,
				"large"		: 150,
				"xlarge"	: 200
			}

### authors

List of authors. Every information about each one will be available on template.

**default**: [
				{
					"name" 		: "PicanhaLabs",
					"email" 	: "grill@picanhalabs.com",
					"github"	: "https://github.com/PicanhaLabs"
				}
			]

### picanha.json example

```
{
	"dist"		: "./_build/",
	"posts"		: {
		"dateformat": "DD/MM/YYYY",
		"dist"		: { 
			"path"		: ":year/:month/:day/:name/",
			"name"		: "index.html"
		},
		"source"	: "./_posts"
	},
	"template"	: {
		"path"		: "./_templates/default_theme/",
		"home"		: "home.html",
		"partials"	: "partials",
		"static"	: ["css", "js", "img"],
		"layouts"	: ["post", "page"],
		"globals"	: {}
	},
	"defaultAuthorSizes" : {
		"xsmall"	: 40,
		"small"		: 60,
		"medium"	: 100,
		"large"		: 150,
		"xlarge"	: 200 
	},
	"authors" : [
		{
			"name" 		: "PicanhaLabs",
			"email" 	: "grill@picanhalabs.com",
			"github"	: "https://github.com/PicanhaLabs"
		}
	]
}
```
