var mongoose = require('mongoose');

var self = module.exports = {

	init: function() {


		var UserSchema = new mongoose.Schema({
			email: String,
			profileJSON: String,
			avatarURL: String,
			reputation: {
				type: Number,
				default: 100
			}
		});

		var ChatSchema = new mongoose.Schema({
			gameId: String,
			user: String,
			message: String
		});

		var SessionSchema = new mongoose.Schema({
			userId: String,
			queue: Array,
			votes: {
				type: Number,
				default: 0
			}
		});

		var User = mongoose.model('User', UserSchema);
		var Chat = mongoose.model('Chat', ChatSchema);
		var Session = mongoose.model('Session', SessionSchema);

	}

};