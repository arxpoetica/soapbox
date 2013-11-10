var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();

var gravatar = require(rootDir + '/server/services/gravatar');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var topReputation = 1000;

var self = module.exports = {

	createUser: function(email, callback) {

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
	},

	getRankedUsers: function(callback) {
		User.find({}, function(err, users) {
			callback(users.sort('field -reputation'));
		});
	}

	updateUserRep: function(email, reputation, time, callback) {
		if ( time < 15 ) {
			// User was yanked.  Decrease by 5%
			reputation = (reputation * .95);
		} else if ( time == 15) {
			// User only spoke for 15 seconds.
			// No change to reputation necessary.
			reputation = reputation;
		} else {
			// User was given additional time.
			// First, get the number of 5 second increments
			addedTime = floor((time - 15) / 5);
			// Add a percentage of current reputation based on
			// the number of 5 second intervals the speaker
			// was given by their peers
			reputation = ((topReputation / ( reputation * 4 )) * addedTime);
		}
		User.update({ email: email }, {reputation: reputation}, {multi: true}, function(err, users){
			callback(user);
		});
	}

};