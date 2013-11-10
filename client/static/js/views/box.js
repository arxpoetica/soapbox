(function() {

	// private variables
	var _socket, $chatInput, $chatLog, _room, _userId, _queue;

	SOAPBOX.initBox = function(options) {

		// initialize the box here...
		console.log('box', options);
		//TODO do some check if here if they go straight here without logging in?

		_userId = localStorage.getItem('userId');
		if(_userId) {
			SOAPBOX.initSocket();
			SOAPBOX.initChat();
			SOAPBOX.initWebRTC();
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
		_socket.on('join', function (queue) {
			console.log('queue: ', queue);
			_queue = queue;

			//you are not broadcaster
			if(_queue[0] !== _userId) {
				SOAPBOX.getStreamFrom(_queue[0]);
			}
			// SOAPBOX.initStream();
			//SOAPBOX.initStream(users[0]);
		});

		//add user to queue
		_socket.on('newUser', function (id) {
			console.log('new: ', id);
			if(id !== _userId) {
				_queue.push(_userId);
			}
		});

		_socket.on('userLeft', function (id) {
			//update queue
			console.log('left: ', id);
			for(var i = 0; i < _queue.length; i++) {
				if(_queue[i] === id) {
					var firstHalf = _queue.slice(0,i),
						secondHalf = _queue.slice(i+1, _queue.length);
					_queue = first.concat(second);
					break;
				}
			}
		});
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

		holla.createStream({ video: true, audio: false }, function(err, stream) {
			// console.log('create');
			if (err) throw err;
			
			holla.pipe(stream, $(".me"));

			SOAPBOX.serverRTC.register(_userId, function(worked) {
				//dont join queue or receive events UNTIL they accept microphone
				SOAPBOX.setupSocketListeners();
				if (!_room) {
					//hard code 1 room for now
					_room = 'nko';
					_socket.emit('join', {room: _room, id: _userId });
				}

				//receive calls ONLY if you are speaker
				SOAPBOX.serverRTC.on("call", function(call) {
					console.log("Inbound call -------");
					if(_queue[0] === _userId) {
						console.log("accept");
						call.addStream(stream);
						call.answer();
						call.ready(function(stream) {
							//dont show them, one way baby
							// holla.pipe(stream, $(".them"));
						});
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
		});
	};

})();