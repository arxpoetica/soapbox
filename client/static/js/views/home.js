(function() {

	var $email;

	SOAPBOX.initHome = function(options) {

		$email = $('#email');
		$message = $('#message');

		$email.on('keydown', function(event) {
			if (event.which == 13) {

				var email = encodeURI($email.val());

				$message.text('...signing up...');

				$.getJSON('/api/signup/' + email, function(json) {
					var user = json.user;
					// console.log(user);
					// localStorage.setItem('user', JSON.stringify(json.user));
					localStorage.setItem('email', email);
					localStorage.setItem('avatarURL', user.avatarURL);
					localStorage.setItem('profileJSON', user.profileJSON);
					// localStorage.setItem('reputation', user.reputation);
					location.href = '/box/nko';
				});

			}
		});

		// initialize home here...
		console.log('home', options);

		//check for RTC support
		if(!window.webkitRTCPeerConnection && !window.mozRTCPeerConnection) {
			$('.signup').hide();
			$('.nosupport').show();
		}

	};

})();