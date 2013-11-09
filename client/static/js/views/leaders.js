(function() {

	var $email;

	SOAPBOX.initLeaders = function(options) {

		$.getJSON('/api/listUsers', function(json) {
			var users = json.users;
			console.log(users);
		});


		// initialize leaders here...
		console.log('leaders', options);

	};

})();