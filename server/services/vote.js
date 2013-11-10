var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var SessionController = require(rootDir + '/server/controllers/session');

var _currentVotes = 0;

var self = module.exports = {

	createSession: function(userId, callback){
		SessionController.createSession(userId, function(session){
			if (typeof callback === 'function') {
				callback(session);
			}
		});
	},

	deleteSession: function(userId, callback) {
		SessionController.deleteSession(userId, function(session){
			if (typeof callback === 'function') {
				callback(session);
			}
		});
	},

	getVoteCount: function(userId, callback){
		// get votes
		SessionController.getSession(userId, function(session){
			console.log(session.votes);
			callback(session.votes);
		});
	},

	upvote: function(userId, callback){
		// +1
		self.getVoteCount(userId, function(votes){
			SessionController.updateSession(userId, votes + 1, function(session){
				if (typeof callback === 'function') {
					callback(session);
				}
			});	
		});		
	},

	downvote: function(userId, callback){
		// --
		self.getVoteCount(userId, function(votes){
			SessionController.updateSession(userId, votes - 1, function(session){
				if (typeof callback === 'function') {
					callback(session);
				}
			});	
		});
	}
}