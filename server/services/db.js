var mongoose = require('mongoose');

var self = module.exports = {

	init: function(connectionString) {

		var db = mongoose.connect(connectionString, function(err) {
			if (err) {
				throw err;
			} else {
				console.log('\nConnected to mongodb...'.green);
				// console.log(db);
				return db;
			}
		});

	}

};