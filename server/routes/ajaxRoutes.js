var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var UserController = require(rootDir + '/server/controllers/user');

var self = module.exports = {

	setRoutes: function(app) {

		var globals = app.get('globals');

		app.get('/api/signup/:email', function(req, res) {
			UserController.createUser(req.params.email, function(user) {
				res.render('api/json', {
					jsonObject: {
						user: user
					}
				});
			});
		});

	}

};