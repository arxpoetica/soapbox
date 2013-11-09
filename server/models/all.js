var self = module.exports = {

	init: function(app, mongoose) {

		var UserSchema = new mongoose.Schema({
			name: String,
			email: String
		});

		var ChatSchema = new mongoose.Schema({
			gameId: String,
			user: String,
			message: String
		});

		var User = mongoose.model('User', UserSchema);
		var Chat = mongoose.model('Chat', ChatSchema);

	}

};