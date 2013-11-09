(function() {

	// private variables
	var _socket, $chatInput, $chatLog, _room, _id;

	SOAPBOX.initBox = function(options) {

		// initialize the box here...
		console.log('box', options);
		SOAPBOX.initSocket();
		SOAPBOX.initChat();
		SOAPBOX.initStream();
	};

	SOAPBOX.initSocket = function() {

		_socket = io.connect('http://' + SOAPBOX.baseUrl);
		$chatInput = $('#chatInput');
		$chatLog = $('#chatLog');

		if (!_room) {
			//hard code 1 room for now
			_room = 'box1';
			//random id
			var _id = Math.random().toString(36).slice(2);
			_socket.emit('join', {room: _room, id: _id});
		}

		SOAPBOX.setupSocketListeners();
		// window._socket = _socket;

	};

	SOAPBOX.setupSocketListeners = function() {
		_socket.on('join', function (id){
			console.log('new soapboxer: ' + id);
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

	SOAPBOX.initStream = function() {
		var constraints = {audio: true, video: false};

		navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);

		function handleUserMediaError(error){
			console.log('getusermedia error: ', error);
		}

		function handleUserMedia(stream) {
			var audio = document.querySelector('audio');
			attachMediaStream(audio, stream);
			audio.play();
		}
	};

	// SOAPBOX.WHATISTHIS = function() {
	// 	var hash = window.location.hash.replace('#', '');
	// 	var meeting = new Meeting(hash);
	// 	var remoteMediaStreams = document.getElementById('remote-media-streams');
	// 	var localMediaStream = document.getElementById('local-media-stream');
	// 	// on getting media stream
	// 	meeting.onaddstream = function(e) {
	// 		if (e.type == 'local') localMediaStream.appendChild(e.audio);
	// 		if (e.type == 'remote') remoteMediaStreams.insertBefore(e.audio, remoteMediaStreams.firstChild);
	// 	};
	// 	// using firebase for signaling
	// 	meeting.firebase = 'rtcweb';
	// 	// if someone leaves; just remove his audio
	// 	meeting.onuserleft = function(userid) {
	// 		var audio = document.getElementById(userid);
	// 		if (audio) audio.parentNode.removeChild(audio);
	// 	};
	// 	// check pre-created meeting boxes
	// 	meeting.check();
	// 	document.getElementById('setup-new-meeting').onclick = function() {
	// 		// setup new meeting box
	// 		meeting.setup('meeting box name');
	// 		this.disabled = true;
	// 		//this.parentNode.innerHTML = '<h2><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
	// 	};
	// };

	SOAPBOX.codelab = function() {
		var isChannelReady;
		var isInitiator;
		var isStarted;
		var localStream;
		var pc;
		var remoteStream;
		var turnReady;

		var pc_config = webrtcDetectedBrowser === 'firefox' ?
			{'iceServers':[{'url':'stun:23.21.150.121'}]} : // number IP
			{'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

		var pc_constraints = {
			'optional': [
			{'DtlsSrtpKeyAgreement': true},
			{'RtpDataChannels': true}
		]};

		// Set up audio and video regardless of what devices are present.
		var sdpConstraints = {'mandatory': {
		'OfferToReceiveAudio':true,
		'OfferToReceiveVideo':true }};

		function sendMessage(message){
			console.log('Sending message: ', message);
			socket.emit('message', message);
		}

		_socket.on('message', function (message){
			console.log('Received message:', message);
			if (message === 'got user media') {
				maybeStart();
			} else if (message.type === 'offer') {
				if (!isInitiator && !isStarted) {
					maybeStart();
				}
				pc.setRemoteDescription(new RTCSessionDescription(message));
				doAnswer();
			} else if (message.type === 'answer' && isStarted) {
				pc.setRemoteDescription(new RTCSessionDescription(message));
			} else if (message.type === 'candidate' && isStarted) {
				var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
					candidate:message.candidate});
				
				pc.addIceCandidate(candidate);
			} else if (message === 'bye' && isStarted) {
				handleRemoteHangup();
			}
		});


		var localVideo = document.querySelector('#localVideo');
		var remoteVideo = document.querySelector('#remoteVideo');

		function handleUserMedia(stream) {
			localStream = stream;
			attachMediaStream(localVideo, stream);
			console.log('Adding local stream.');
			sendMessage('got user media');
			if (isInitiator) {
				maybeStart();
			}
		}

		function handleUserMediaError(error){
			console.log('navigator.getUserMedia error: ', error);
		}

		var constraints = {video: true};

		navigator.getUserMedia(constraints, handleUserMedia, handleUserMediaError);
		console.log('Getting user media with constraints', constraints);

		//TODO what is this
		//requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');

		function maybeStart() {
			if (!isStarted && localStream && isChannelReady) {
				createPeerConnection();
				pc.addStream(localStream);
				isStarted = true;
				if (isInitiator) {
					doCall();
				}
			}
		}

		function createPeerConnection() {
			try {
				pc = new RTCPeerConnection(pc_config, pc_constraints);
				pc.onicecandidate = handleIceCandidate;
				console.log('Created RTCPeerConnnection with:\n' +
				'  config: \'' + JSON.stringify(pc_config) + '\';\n' +
				'  constraints: \'' + JSON.stringify(pc_constraints) + '\'.');
			} catch (e) {
				console.log('Failed to create PeerConnection, exception: ' + e.message);
				alert('Cannot create RTCPeerConnection object.');
				return;
			}
			
			pc.onaddstream = handleRemoteStreamAdded;
			pc.onremovestream = handleRemoteStreamRemoved;

			if (isInitiator) {
				try {
					// Reliable Data Channels not yet supported in Chrome
					sendChannel = pc.createDataChannel("sendDataChannel",
					{reliable: false});
					trace('Created send data channel');
				} catch (e) {
					alert('Failed to create data channel. ' +
					'You need Chrome M25 or later with RtpDataChannel enabled');
					trace('createDataChannel() failed with exception: ' + e.message);
				}
				sendChannel.onopen = handleSendChannelStateChange;
				sendChannel.onclose = handleSendChannelStateChange;
			} else {
				pc.ondatachannel = gotReceiveChannel;
			}
		}

		function sendData() {
			var data = sendTextarea.value;
			sendChannel.send(data);
			trace('Sent data: ' + data);
		}

		function gotReceiveChannel(event) {
			trace('Receive Channel Callback');
			receiveChannel = event.channel;
			receiveChannel.onmessage = handleMessage;
			receiveChannel.onopen = handleReceiveChannelStateChange;
			receiveChannel.onclose = handleReceiveChannelStateChange;
		}

		function handleMessage(event) {
			trace('Received message: ' + event.data);
			receiveTextarea.value = event.data;
		}

		function handleSendChannelStateChange() {
			var readyState = sendChannel.readyState;
			trace('Send channel state is: ' + readyState);
			if (readyState == "open") {
				dataChannelSend.disabled = false;
				dataChannelSend.focus();
				dataChannelSend.placeholder = "";
				sendButton.disabled = false;
				//    closeButton.disabled = false;
			} else {
				dataChannelSend.disabled = true;
				sendButton.disabled = true;
			//    closeButton.disabled = true;
			}
		}

		function handleReceiveChannelStateChange() {
			var readyState = receiveChannel.readyState;
			trace('Receive channel state is: ' + readyState);
		}

		function handleIceCandidate(event) {
			console.log('handleIceCandidate event: ', event);
			if (event.candidate) {
				sendMessage({
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate});
			} else {
				console.log('End of candidates.');
			}
		}

		function handleRemoteStreamAdded(event) {
			console.log('Remote stream added.');
			//  reattachMediaStream(miniVideo, localVideo);
			attachMediaStream(remoteVideo, event.stream);
			remoteStream = event.stream;
			//  waitForRemoteVideo();
		}

		function doCall() {
			var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
			// temporary measure to remove Moz* constraints in Chrome
			if (webrtcDetectedBrowser === 'chrome') {
				for (var prop in constraints.mandatory) {
					if (prop.indexOf('Moz') !== -1) {
						delete constraints.mandatory[prop];
					}
				}
			}
			constraints = mergeConstraints(constraints, sdpConstraints);
			console.log('Sending offer to peer, with constraints: \n' +
			'  \'' + JSON.stringify(constraints) + '\'.');
			pc.createOffer(setLocalAndSendMessage, null, constraints);
		}

		function doAnswer() {
			console.log('Sending answer to peer.');
			pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
		}

		function mergeConstraints(cons1, cons2) {
			var merged = cons1;
			for (var name in cons2.mandatory) {
				merged.mandatory[name] = cons2.mandatory[name];
			}
			merged.optional.concat(cons2.optional);
			return merged;
		}

		function setLocalAndSendMessage(sessionDescription) {
			// Set Opus as the preferred codec in SDP if Opus is present.
			sessionDescription.sdp = preferOpus(sessionDescription.sdp);
			pc.setLocalDescription(sessionDescription);
			sendMessage(sessionDescription);
		}

		function requestTurn(turn_url) {
			var turnExists = false;
			for (var i in pc_config.iceServers) {
				if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
					turnExists = true;
					turnReady = true;
					break;
				}
			}
			if (!turnExists) {
				console.log('Getting TURN server from ', turn_url);
				// No TURN server. Get one from computeengineondemand.appspot.com:
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function(){
					if (xhr.readyState === 4 && xhr.status === 200) {
						var turnServer = JSON.parse(xhr.responseText);
						console.log('Got TURN server: ', turnServer);
						pc_config.iceServers.push({
							'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
							'credential': turnServer.password
						});
						turnReady = true;
					}
				};
				xhr.open('GET', turn_url, true);
				xhr.send();
			}
		}

		function handleRemoteStreamAdded(event) {
			console.log('Remote stream added.');
			// reattachMediaStream(miniVideo, localVideo);
			attachMediaStream(remoteVideo, event.stream);
			remoteStream = event.stream;
			//  waitForRemoteVideo();
		}
		function handleRemoteStreamRemoved(event) {
			console.log('Remote stream removed. Event: ', event);
		}

		function hangup() {
			console.log('Hanging up.');
			stop();
			sendMessage('bye');
		}

		function handleRemoteHangup() {
			console.log('Session terminated.');
			stop();
			isInitiator = false;
		}

		function stop() {
			isStarted = false;
			// isAudioMuted = false;
			// isVideoMuted = false;
			pc.close();
			pc = null;
		}


		// Set Opus as the default audio codec if it's present.
		function preferOpus(sdp) {
			var sdpLines = sdp.split('\r\n');
			var mLineIndex;
			// Search for m line.
			for (var i = 0; i < sdpLines.length; i++) {
				if (sdpLines[i].search('m=audio') !== -1) {
					mLineIndex = i;
					break;
				}
			}
			if (mLineIndex === null) {
				return sdp;
			}

			// If Opus is available, set it as the default in m line.
			for (i = 0; i < sdpLines.length; i++) {
				if (sdpLines[i].search('opus/48000') !== -1) {
					var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
					if (opusPayload) {
						sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
					}
				break;
				}
			}

			// Remove CN in m line and sdp.
			sdpLines = removeCN(sdpLines, mLineIndex);

			sdp = sdpLines.join('\r\n');
			return sdp;
		}

		function extractSdp(sdpLine, pattern) {
			var result = sdpLine.match(pattern);
			return result && result.length === 2 ? result[1] : null;
		}

		// Set the selected codec to the first in m line.
		function setDefaultCodec(mLine, payload) {
			var elements = mLine.split(' ');
			var newLine = [];
			var index = 0;
			for (var i = 0; i < elements.length; i++) {
				if (index === 3) { // Format of media starts from the fourth.
					newLine[index++] = payload; // Put target payload to the first.
				}
				if (elements[i] !== payload) {
					newLine[index++] = elements[i];
				}
			}
			return newLine.join(' ');
		}

		// Strip CN from sdp before CN constraints is ready.
		function removeCN(sdpLines, mLineIndex) {
			var mLineElements = sdpLines[mLineIndex].split(' ');
			// Scan from end for the convenience of removing an item.
			for (var i = sdpLines.length-1; i >= 0; i--) {
				var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
				if (payload) {
					var cnPos = mLineElements.indexOf(payload);
					if (cnPos !== -1) {
						// Remove CN payload from m line.
						mLineElements.splice(cnPos, 1);
					}
					// Remove CN line in sdp
					sdpLines.splice(i, 1);
				}
			}

			sdpLines[mLineIndex] = mLineElements.join(' ');
			return sdpLines;
		}
	};

})();