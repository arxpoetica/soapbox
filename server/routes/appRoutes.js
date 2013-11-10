var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var UserController = require(rootDir + '/server/controllers/user');

var self = module.exports = {

	setRoutes: function(app) {

		var globals = app.get('globals');

		app.get('/', function(req, res) {
			res.render('home', {
				title: 'Soapbox',
				globals: globals
			});
		});

		app.get('/box/:roomId', function(req, res) {
			UserController.getRankedUsers(function(users) {
				res.render('box', {
					title: 'Box ' + req.params.roomId + ' | Soapbox',
					globals: globals,
					users: users
				});	
			});
		});

		app.get('/leaders', function(req, res) {
			UserController.getRankedUsers(function(users) {
				res.render('leaders', {
					title: 'Leaders | Soapbox',
					globals: globals,
					users: users
				});	
			});
		});

		app.get('/contact', function(req, res) {
			res.render('contact', {
				title: 'About The Team',
				globals: globals
			})
		})

		app.get('/wetried', function(req, res) {
			res.render('wetried', {
				title: 'Soapbox',
				globals: globals
			});
		})

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