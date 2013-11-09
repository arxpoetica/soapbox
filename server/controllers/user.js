var mongoose = require('mongoose');
var User = mongoose.model('User');

var self = module.exports = {

	list: function(callback) {
		User.find({}, function(err, users) {
			callback(users);
		});
	}

};