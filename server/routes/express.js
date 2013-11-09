var rootDir = process.cwd();


var self = module.exports = {

	setRoutes: function(app) {

		var globals = app.get('globals');

		app.get('/', function(req, res) {
			res.render('app', {
				title: 'Soapbox',
				globals: globals
			});
		});

        app.get('/rooms', function(req, res) {
			res.render('rooms', {
				title: 'Soapbox: Rooms',
				globals: globals
			});
		});

		// 404'd
		app.use(function(req, res, next) {
			// res.send(404, 'Sorry cant find that!');
			res.render('404', {
				title: '404 - Page Not Found',
				globals: globals
			});
		});

	}

};