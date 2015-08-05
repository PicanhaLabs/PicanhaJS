#!/usr/bin/env node

process.title	= 'picanha';

var fs 			= require('fs'),
	cmd		 	= process.argv.slice(2);
	Command		= require('./command'),
	path 		= require('path'),
	Promise 	= require('promise'),
	utils		= require('./utils'),
	ncp 		= require('ncp').ncp,
	clientpath	= process.cwd(),
	libpath 	= process.mainModule.paths[2] + '/picanhajs';

var commander = new Command({ libpath: libpath, clientpath: clientpath });

if (cmd[0] === 'beginbbq') {

	commander.create(utils.recursiveCopy);

} else {
	
	var fm			= require('front-matter'),
		marked		= require('marked'),
		highlight	= require('highlight.js'),
		handlebars	= require('handlebars'),
		Builder		= require('./builder'),
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

	var builder = new Builder();

	builder.setParameters(parameters);

	builder.setFrontMatterCompiler(fm);

	builder.setPostCompiler(marked);

	builder.setTemplateCompiler(function( data ) {
		var tpl = handlebars.compile(data);
		return tpl;
	});

	builder.execute();
}