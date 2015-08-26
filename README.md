<img src="http://blog.picanhalabs.com/img/picanhalabs.svg" alt="Picanha Labs logo" width="200px">

[![Build Status](https://travis-ci.org/PicanhaLabs/PicanhaJS.svg?branch=master)](https://travis-ci.org/PicanhaLabs/PicanhaJS) [![Code Climate](https://codeclimate.com/github/PicanhaLabs/PicanhaJS/badges/gpa.svg)](https://codeclimate.com/github/PicanhaLabs/PicanhaJS)  ![Dependencies](https://david-dm.org/PicanhaLabs/PicanhaJS.svg)

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
picanha
```

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
