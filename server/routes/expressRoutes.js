var rootDir = process.cwd();


var self = module.exports = {

	setRoutes: function(app) {

		var globals = app.get('globals');

		app.get('/', function(req, res) {
			res.render('home', {
				title: 'Soapbox',
				globals: globals
			});
		});

		app.get('/boxes/:roomId', function(req, res) {
			console.log(req.params);
			res.render('box', {
				title: 'Room ' + req.params.roomId + ' | Soapbox',
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