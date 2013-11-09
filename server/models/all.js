var self = module.exports = {

	init: function(app, mongoose) {

		var UserSchema = new mongoose.Schema({
			name: String,
			email: String
		});

		var User = mongoose.model('User', UserSchema);

	}

};