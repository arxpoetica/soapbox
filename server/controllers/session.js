var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var gravatar = require(rootDir + '/server/services/gravatar');
var mongoose = require('mongoose');
var Session = mongoose.model('Session');

var self = module.exports = {

	createSession: function(userId, callback) {
		var query = Session.findOne({ 'userId': userId });

		query.exec(function(err, oldId) {
			if (oldId) {
				console.log('Preexisting session.'.yellow);
				if (typeof callback == 'function') { callback(oldId); }
			} else {
				var newSession = new Session();
				newSession.userId = userId;
				newSession.votes = 0;
				newSession.queue = [];
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

	deleteSession: function(userId, callback) {
		var query = Session.remove({ 'userId': userId });

		query.exec(function(err, oldId) {
			if (oldId) {
				console.log('Deleting session.'.yellow);
				if (typeof callback == 'function') { callback(newSession); }
			} else {
				console.log('No session.'.yellow);
				if (typeof callback == 'function') { callback(oldId); }
			}
		});
	},

	getSession: function(userId, callback) {
		var query = Session.findOne({ 'userId': userId});

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

	updateSessionVotes: function(userId, votes, callback) {
		Session.update({ 'userId': userId }, { 'votes': votes }, { multi: true }, function(err, session){
			if (err) {
				throw err;
			} else {
				if (typeof callback == 'function') { callback(session); }
			}
		});
	},

	updateSessionQueue: function(userId, queue, callback) {
		Session.update({ 'userId': userId }, { 'queue': queue }, { multi: true }, function(err, session){
			if (err) {
				throw err;
			} else {
				if (typeof callback == 'function') { callback(session); }
			}
		});
	}

}