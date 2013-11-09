// forked from https://github.com/AndrewJutton/nodejs-gravatar
var crypto = require('crypto');
var querystring = require('querystring');

var self = module.exports = {

	getGravatar: function(email, options, callback) {
		var convertedQueryString = querystring.stringify(options);
		var result;
		var hash;
		if (convertedQueryString !== '') {
			result = '?' + convertedQueryString;
		}
		hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
		callback({
			profileJSON: 'http://www.gravatar.com/' + hash + '.json',
			avatarURL: 'http://www.gravatar.com/avatar/' + hash + result
		});
	}

};