var self = module.exports = {

	setRoutes: function(app) {

		var globals = app.get('globals');

		app.get('/api/signup', function(req, res) {
			res.render('api/json', {
				jsonObject: {
					whatever: 'whatever'
				}
			});
		});

	}

};