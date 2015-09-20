'use strict';

class ParameterNotFound extends Error {
	constructor() {
		super(arguments);
		this.name		= 'ParameterNotFound';
		this.message	= 'Parameter(s) were expected. None got.';
		this.stack		= (new Error()).stack;
	}
}

module.exports.ParameterNotFound = ParameterNotFound;