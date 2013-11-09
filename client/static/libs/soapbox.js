(function() {

	SOAPBOX.init = function() {
		// console.log(SOAPBOX);
		console.log('Soapbox!')
		SOAPBOX.initSocket();
	};

	SOAPBOX.initSocket = function() {

		var socket = io.connect('http://' + SOAPBOX.baseUrl);
		var $chatInput = $('#chatInput');
		var $chatLog = $('#chatLog');

		window.socket = socket;

		// chat message
		socket.on('sendChatMessageToAll', function(data) {
			if (data.gameId === 'gameId') {
				// $chatLog.append('<p><span class="playerTwo">' + data.user + ':</span> ' + data.message + '</p>');
				$chatLog.append('<p><span class="playerOne">[PLAYER 2]:</span> ' + data.message + '</p>');
				$chatLog.scrollTop($chatLog[0].scrollHeight);
			}
		});

		$chatInput.on('keyup', function(event) {
			var code = (event.keyCode ? event.keyCode : event.which);
			var inputValue;

			// console.log(code);

			// Enter keycode
			if (code == 13) {
				inputValue = $chatInput.val();
				$chatInput.val('');
				// $chatLog.append('<p><span class="playerOne">' + user + ':</span> ' + inputValue + '</p>');
				$chatLog.append('<p><span class="playerOne">[PLAYER 1]:</span> ' + inputValue + '</p>');
				// console.log(socket.broadcast);
				$chatLog.scrollTop($chatLog[0].scrollHeight);
				// socket.emit('sendChatMessage', {
				// 	user: user,
				// 	gameId: gameId,
				// 	message: inputValue
				// });
				socket.emit('sendChatMessage', {
					user: 'user',
					gameId: 'gameId',
					message: inputValue
				});
			}
		});

	};

})();