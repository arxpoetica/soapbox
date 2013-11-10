var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var SessionController = require(rootDir + '/server/controllers/session');

var _currentVotes = 0;

var self = module.exports = {
	getVoteCount: function(userId, callback){
		// get votes
		SessionController.getSession(userId, function(err, session){
			return session.votes;
		});
	},

	upvote: function(userId, callback){
		// +1
		_currentVotes = this.getVoteCount(userId) + 1;
		SessionController.updateSession(userId, _currentVotes, function(err, session){
			if (typeof callback === 'function') {
				callback(session);
			}		})
	},

	downvote: function(userId, callback){
		// --
		_currentVotes = this.getVoteCount(userId) - 1;
		SessionController.updateSession(userId, _currentVotes, function(err, session){
			if (typeof callback === 'function') {
				callback(session);
			}
		})
	}
}