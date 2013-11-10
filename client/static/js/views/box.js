(function() {

	// private variables
	var _socket, $chatInput, $chatLog, _room, _userId, _queue, _calls, _speaker, $up, $down, _stream, _avatar;

	var _time = 15;

	var conns = {};
	SOAPBOX.initBox = function(options) {

		// initialize the box here...
		//TODO do some check if here if they go straight here without logging in?

		_userId = localStorage.getItem('userId');
		_avatar = localStorage.getItem('avatarURL');
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
			console.log(data);
			//check capacity for new user
			if(data.queue.length > 42 && _userId === data.id) {
				alert('sorry dude at capacity');
			} else {
				_queue = data.queue;
			}
			SOAPBOX.updateStatus();
		});

		_socket.on('userLeft', function (id) {
			for(var i = 0; i < _queue.length; i++) {
				if(_queue[i] === id) {
					var firstHalf = _queue.slice(0,i),
						secondHalf = _queue.slice(i+1, _queue.length);
					_queue = firstHalf.concat(secondHalf);
					break;
				}
			}
			SOAPBOX.updateStatus();
			delete conns[id];
		});

		_socket.on('stopSpeaker', function(speaker) {
			if(speaker === _userId) {
				for(var user in conns) {
					conns[user].mute();
				}
				_socket.emit('doneSpeaking', _userId);
			}
		});

		_socket.on('startSpeaker', function(speaker, name) {
			_speaker = speaker;
			if(_speaker === _userId) {
				_socket.emit('readyToSpeak', _userId, _avatar);
				for(var user in conns) {
					conns[user].unmute();
				}
				$('.votingBooth').hide();
			} else {
				$('.votingBooth').show();
				// $('.speakerName').text(name);
			}
		});

		_socket.on('getSpeakerStream', function(speaker, avatar) {
			console.log('getSpeaker');
			if(!conns[speaker] && speaker !== _userId) {
				SOAPBOX.getStreamFrom(speaker);
			}
			_time = 15;
			$('.timer').text(_time);
			$('.currentAvatar').attr('src', avatar);
			SOAPBOX.updateTimer();
		});

		_socket.emit('join', {room: 'nko', id: _userId });
	};

	SOAPBOX.updateTimer = function() {
		//TODO ya i know there are better ways deal with it
		_time -= 1;
		$('.timer').text(_time);
		if(_time > 0) {
			setTimeout(function() {
				SOAPBOX.updateTimer();
			},1000);
		} else {
			$('.timer').text('---');
		}
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
			debug: false,
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

		holla.createStream({ video: false, audio: true }, function(err, stream) {
			_stream = stream;
			if (err) throw err;
			
			// holla.pipe(_stream, $(".me"));

			SOAPBOX.serverRTC.register(_userId, function(worked) {
				//dont join queue or receive events UNTIL they accept microphone
				SOAPBOX.setupSocketListeners();

				// receive calls ONLY if you are speaker
				SOAPBOX.serverRTC.on("call", function(call) {
					console.log("Inbound call -------");
					if(_speaker === _userId) {
						console.log("accept");
						call.addStream(_stream);
						console.log('1');
						call.answer();
						call.ready(function(stream) {
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
		var call = SOAPBOX.serverRTC.call(currentSpeaker);
		
		conns[currentSpeaker] = call;
		call.addStream(_stream);
		call.mute();
		
		call.ready(function(stream) {
			holla.pipe(stream, $(".them"));
		});

		// call.on("hangup", function() {
		// 	$(".them").attr('src', '');
		// 	console.log('hung up');
		// });

	};

	SOAPBOX.initVoting = function() {

		_socket.emit('initSession', {
			userId: _userId,
			queue: _queue
		});
		
		$up = $('.speaker .up');
		$down = $('.speaker .down');

		$up.on('click', function(event) {
			_socket.emit('upVoteUser', {
				userId: _userId,
			});
		});
		$down.on('click', function(event) {
			_socket.emit('downVoteUser', {
				userId: _userId,
			});
		});

	};

})();