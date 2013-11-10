(function() {

	// private variables
	var _socket, $chatInput, $chatLog, _room, _userId, _queue, _calls, _speaker, $up, $down;

	SOAPBOX.initBox = function(options) {

		// initialize the box here...
		console.log('box', options);
		//TODO do some check if here if they go straight here without logging in?

		_userId = localStorage.getItem('userId');
		if(_userId) {
			SOAPBOX.initSocket();
			SOAPBOX.initChat();
			SOAPBOX.initWebRTC();
			SOAPBOX.initVoting();
		} else {
			//TODO
			alert('must sign in on homepage');
		}

	};

	SOAPBOX.initSocket = function() {
		_socket = io.connect('http://' + SOAPBOX.baseUrl);
		$chatInput = $('#chatInput');
		$chatLog = $('#chatLog');
	};

	SOAPBOX.setupSocketListeners = function() {

		//add user to queue
		_socket.on('newUser', function (data) {
			//check capacity for new user
			console.log(data);
			if(data.queue.length > 42 && _userId === data.id) {
				alert('sorry dude at capacity');
			} else {
				_queue = data.queue;
			}
			SOAPBOX.updateStatus();
		});

		_socket.on('userLeft', function (id) {
			//update queue
			console.log('left: ', id);
			for(var i = 0; i < _queue.length; i++) {
				if(_queue[i] === id) {
					var firstHalf = _queue.slice(0,i),
						secondHalf = _queue.slice(i+1, _queue.length);
					_queue = firstHalf.concat(secondHalf);
					break;
				}
			}
		});

		_socket.on('stopSpeaker', function(speaker) {
			//who to stop
			_speaker = speaker;
			if(_speaker === _userId) {
				for(var i = 0; i < _calls.length; i++) {
					_calls[i].end();
				}
				_calls = [];
				_socket.emit('doneSpeaking', _userId);
			}
		});

		_socket.on('startSpeaker', function(speaker) {
			console.log('start: ', speaker);
			_speaker = speaker;
			if(_speaker === _userId) {
				_calls = [];
				_socket.emit('readyToSpeak', _userId);
			}
		});

		_socket.on('getSpeakerStream', function(speaker) {
			SOAPBOX.getStreamFrom(speaker);
		});

		_socket.emit('join', {room: 'nko', id: _userId });
	};

	SOAPBOX.updateStatus = function() {
		//TODO make this better
		if (_queue.length < 2) {
			//not enough people
			$('.lonely').show();
		} else {
			//enough people yay
			$('.lonely').hide();
		}
	};

	SOAPBOX.changeSpeaker = function() {

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

	SOAPBOX.initWebRTC = function() {

		SOAPBOX.serverRTC = holla.createClient({
			// video: true,
			// audio: true,
			// debug: true,
			presence: false
		});

		// SOAPBOX.serverRTC.on("presence", function(user) {
		// 	if (user.online) {
		// 		console.log(user.name + " is online.");
		// 	} else {
		// 		console.log(user.name + " is offline.");
		// 	}
		// });

		$(".me").show();
		$(".them").show();
		$("#whoAmI").remove();
		$("#whoCall").show();
		$("#hangup").show();

		holla.createStream({ video: true, audio: true }, function(err, stream) {
			console.log('create');
			if (err) throw err;
			
			holla.pipe(stream, $(".me"));

			SOAPBOX.serverRTC.register(_userId, function(worked) {
				console.log('registered');
				//dont join queue or receive events UNTIL they accept microphone
				SOAPBOX.setupSocketListeners();

				//receive calls ONLY if you are speaker
				SOAPBOX.serverRTC.on("call", function(call) {
					console.log("Inbound call -------");
					if(_speaker === _userId) {
						console.log("accept");
						call.addStream(stream);
						call.answer();
						call.ready(function(stream) {
							//dont show them, one way baby
							// holla.pipe(stream, $(".them"));
						});
						_calls.push(call);
						//TODO at some point call.end()
					} else {
						console.log("decline");
					}
				});
				// SOAPBOX.serverRTC.on("call", function(call) {
				// 	console.log("Inbound call", call);

				// 	call.addStream(stream);
				// 	call.answer();

				// 	call.ready(function(stream) {
				// 		holla.pipe(stream, $(".them"));
				// 	});
				// 	call.on("hangup", function() {
				// 		$(".them").attr('src', '');
				// 	});
				// 	$("#hangup").click(function() {
				// 		call.end();
				// 	});
				// });

				// // place outbound
				// $("#whoCall").change(function() {
				// 	var toCall = $("#whoCall").val();
				// 	var call = SOAPBOX.serverRTC.call(toCall);
				// 	call.addStream(stream);
				// 	call.ready(function(stream) {
				// 		holla.pipe(stream, $(".them"));
				// 	});
				// 	call.on("hangup", function() {
				// 		$(".them").attr('src', '');
				// 	});
				// 	$("#hangup").click(function() {
				// 		call.end();
				// 	});
				// });

			});
		});

	};

	SOAPBOX.getStreamFrom = function(currentSpeaker) {
		console.log('get stream from current speaker');
		var call = SOAPBOX.serverRTC.call(currentSpeaker);
		// call.addStream(stream);
		call.ready(function(stream) {
			holla.pipe(stream, $(".them"));
		});
		call.on("hangup", function() {
			$(".them").attr('src', '');
			console.log('he hung up on me');
		});
		// shoud i end or relase here?
		// call.end();
	};

	SOAPBOX.initVoting = function() {

		$up = $('.speaker .up');
		$down = $('.speaker .down');

		$up.on('click', function(event) {
			_socket.emit('upVoteUser', {
				user: 'user',
				gameId: 'gameId',
			});
		});
		$down.on('click', function(event) {
			_socket.emit('downVoteUser', {
				user: 'user',
				gameId: 'gameId',
			});
		});

	};

})();