var CustomErrors	= require('./CustomErrors');

var Utils = {
	parameterCheck : function(type, arg) {
		if (!arg && arg !== 0 && arg !== false && arg !== '')
			throw new CustomErrors.ParameterNotFound();
		else if (!(arg instanceof type))
			throw new TypeError("Expected an " + type.toString() + " as parametes for this constructor.");
	}
};

module.exports = Utils;
