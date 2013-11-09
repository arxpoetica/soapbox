var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();

var gravatar = require(rootDir + '/server/services/gravatar');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var self = module.exports = {

	getUser: function(email, callback) {

		var query = User.findOne({ 'email': email });

		query.exec(function(err, oldUser) {
			if (oldUser) {
				console.log('Preexisting user.'.yellow);
				if(typeof callback == 'function') { callback(oldUser); }
			} else {
				gravatar.getGravatar(email, { size: 200 }, function(userGravatar) {
					var newUser = new User();
					newUser.email = email;
					newUser.profileJSON = userGravatar.profileJSON;
					newUser.avatarURL = userGravatar.avatarURL;
					newUser.reputation = 100;
					newUser.save(function(err) {
						if (err) {
							throw err;
						}
						console.log('New user.'.yellow);
						if(typeof callback == 'function') { callback(newUser); }
					});
				});
			}
		});

	},

	list: function(callback) {
		User.find({}, function(err, users) {
			callback(users);
		});
	}

};