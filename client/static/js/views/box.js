(function() {

	// private variables
	var _socket, $chatInput, $chatLog;

	SOAPBOX.initBox = function(options) {

		// initialize the box here...
		console.log('box', options);
		SOAPBOX.initSocket();
		SOAPBOX.initChat();

	};

	SOAPBOX.initSocket = function() {

		_socket = io.connect('http://' + SOAPBOX.baseUrl);
		$chatInput = $('#chatInput');
		$chatLog = $('#chatLog');

		// window._socket = _socket;

	};

	SOAPBOX.initChat = function() {

		// chat message
		_socket.on('sendChatMessageToAll', function(data) {
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
				// console.log(_socket.broadcast);
				$chatLog.scrollTop($chatLog[0].scrollHeight);
				// _socket.emit('sendChatMessage', {
				// 	user: user,
				// 	gameId: gameId,
				// 	message: inputValue
				// });
				_socket.emit('sendChatMessage', {
					user: 'user',
					gameId: 'gameId',
					message: inputValue
				});
			}
		});

	};

	SOAPBOX.WHATISTHIS = function() {
		var hash = window.location.hash.replace('#', '');
		var meeting = new Meeting(hash);
		var remoteMediaStreams = document.getElementById('remote-media-streams');
		var localMediaStream = document.getElementById('local-media-stream');
		// on getting media stream
		meeting.onaddstream = function(e) {
			if (e.type == 'local') localMediaStream.appendChild(e.audio);
			if (e.type == 'remote') remoteMediaStreams.insertBefore(e.audio, remoteMediaStreams.firstChild);
		};
		// using firebase for signaling
		meeting.firebase = 'rtcweb';
		// if someone leaves; just remove his audio
		meeting.onuserleft = function(userid) {
			var audio = document.getElementById(userid);
			if (audio) audio.parentNode.removeChild(audio);
		};
		// check pre-created meeting boxes
		meeting.check();
		document.getElementById('setup-new-meeting').onclick = function() {
			// setup new meeting box
			meeting.setup('meeting box name');
			this.disabled = true;
			//this.parentNode.innerHTML = '<h2><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
		};
	};

})();