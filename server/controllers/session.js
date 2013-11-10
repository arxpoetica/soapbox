var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var gravatar = require(rootDir + '/server/services/gravatar');
var mongoose = require('mongoose');
var Session = mongoose.model('Session');

var self = module.exports = {

	createSession: function(userId, callback) {
		var query = Session.findOne({ '_id': userId });

		query.exec(function(err, oldId) {
			if (oldId) {
				console.log('Preexisting session.'.yellow);
				if (typeof callback == 'function') { callback(oldId); }
			} else {
				var newSession = new Session();
				newSession.userId = userId;
				newSession.votes = 0;
				newSession.save(function(err) {
					if (err) {
						throw err;
					}
					console.log('New session.'.yellow);
					if (typeof callback == 'function') { callback(newSession); }
				});
			}
		});
	},

	getSession: function(userId, callback) {
		var query = Session.findOne({ '_id': userId});

		query.exec(function(err, session) {
			if (session) {
				console.log('Got a session.');
				if (typeof callback == 'function') { callback(session); }

			} else {
				console.log('No session found.'.yellow);
				if (err) {
					throw err;
				}
			}
		});
	},

	updateSession: function(userId, votes, callback) {
		Session.update({ '_id': userId }, { 'votes': votes }, { multi: true }, function(err, session){
			if (err) {
				throw err;
			} else {
				if (typeof callback == 'function') { callback(session); }
			}
		});
	}

}