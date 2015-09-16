var AvailableCommands = {
	
	'beginbbq'	: {
		method		: 'createNewSite',
		suggests	: ['create', 'begin', 'bbq'],
		description : 'Creates a new project.'
	},

	'grill'		: {
		method		: 'compileExistingSite',
		suggests	: ['compile'],
		description : 'Compile your project.'
	},

	'help'		: {
		method		: 'showHelp',
		suggests	: ['man'],
		description : 'Show help page.'
	}

};


module.exports = AvailableCommands;