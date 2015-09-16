var AvailableCommands = {
	
	'beginbbq'	: {
		method		: 'createNewSite',
		suggests	: ['create', 'begin', 'bbq']  
	},

	'grill'		: {
		method		: 'compileExistingSite',
		suggests	: ['compile'] 
	}

};


module.exports = AvailableCommands;