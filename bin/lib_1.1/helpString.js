// dependencies
var _ 					= require('underscore'),
	color				= require('colors/safe');
	AvailableCommands	= require('./AvailableCommands');



var help = '\n';

help += color.red.bold('PicanhaJS Command list. \n');
help += '------------------------------ \n\n';

_.each(AvailableCommands, function(element, index) {

	help += '* ' + color.cyan.underline(index) + '\n';
	help += '\t' + color.bold(element.description);
	help += '\n\n';

})

help += '\n\n';

module.exports = help;