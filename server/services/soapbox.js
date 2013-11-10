var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var timerService = require(rootDir + '/server/services/timer');
var sessionService = require(rootDir + '/server/services/session');

var self = module.exports = {
	users: sessionService.getQueue,
	speaker: null,
	attachSocketLayer: function(socketLayer) {
		// attach scope to this file
		io = socketLayer;

		io.sockets.on('connection', function(socket) {

			console.log('\nSocket.io connection established...'.green);


			// send chat message
			socket.on('sendChatMessage', function(data) {
				socket.broadcast.emit('sendChatMessageToAll', data);
				// chats.create(data.user, data.gameId, data.message, function(data) {
				// 	console.log('Chat message saved to DB');
				// });
			});

			socket.on('message', function (message) {
				console.log('Got message: ', message);
				socket.broadcast.emit('message', message);
			});

			socket.on('join', function (data) {
				// //join specific room (channel)
				// socket.join(data.room);
				// var numClients = io.sockets.clients(data.room).length;

				//add to queue
				sessionService.pushUser(data.id, data.id, function(session){
					// update the vote count on the front-end
					console.log(session.queue);
					self.users = session.queue;
				});

				//if there is no current speaker && queue is long enough make speaker and start
				if(!self.speaker && self.users.length > 1) {
					self.speaker = {
						id: self.users[0],
						ready: false
					};
					socket.broadcast.emit('startSpeaker', self.speaker.id);
				} else if(self.speaker && self.speaker.ready) {
					socket.emit('getSpeakerStream', self.speaker.id);
				}

				// io.sockets.in(data.room).emit('newUser', {numUsers: numClients, id: data.id});
				var newUser = {
					queue: self.users,
					id: data.id
				};

				//broadcast out new users to add to client queues
				socket.broadcast.emit('newUser', newUser);
				socket.emit('newUser', newUser);
				

				socket.on('disconnect', function () {
					console.log('disconnected: ', data.id);
					//remove user from queue
					for(var i = 0; i < self.users.length; i++) {
						if(self.users[i] === data.id) {
							var firstHalf = self.users.slice(0,i),
								secondHalf = self.users.slice(i+1, self.users.length);
							self.users = firstHalf.concat(secondHalf);
							break;
						}
					}
					//if someone leaves while its their turn
					if(self.speaker.id === data.id) {
						self.speaker.id = self.users[0];
						self.speaker.ready = false;
						socket.broadcast.emit('startSpeaker', self.speaker.id);
					} else if(self.users.length < 1) {
						self.speaker = null;
					}
					socket.broadcast.emit('userLeft', data.id);
				});
			});

			socket.on('readyToSpeak', function(speaker, avatar) {
				timerService.startTimer(function() {
					console.log('stop');
					socket.emit('stopSpeaker', self.speaker.id);
				});
				if(self.speaker.id === speaker) {
					self.speaker.ready = true;
					socket.broadcast.emit('getSpeakerStream', self.speaker.id, avatar);
				}
			});

			socket.on('doneSpeaking', function(speaker) {
				console.log('done speaking');
				if(self.speaker.id === speaker) {
					//update queue and move current to end
					// self.users.shift();
					sessionService.popUser(data.userid, self.users.shift(), function(session){
						// update the queue on the front-end
						console.log(session.queue);
					});
					// self.users.push(speaker);
					sessionService.pushuser(data.userid, speaker, function(session){
						// update the queue on the front-end
						console.log(session.queue);
					});
					self.speaker.id = self.users[0];
					self.speaker.ready = false;
					//start new speaker
					console.log('startNewSpeaker');
					setTimeout(function() {
						socket.broadcast.emit('startSpeaker', self.speaker.id);
					}, 4000);
				}
			});

			socket.on('broadcast', function (data) {
				console.log(data);
			});

			socket.on('participate', function(data) {
				io.sockets.in(data.room).emit('message', data);
			});

			socket.on('shareStream', function(data) {
				io.sockets.in(data.room).emit('shareStream', data);
			});

			socket.on('initSession', function(data) {
				//console.log(data)
				sessionService.createSession(data.userid, function(session){
					// console.log(session.votes);
				});
			});

			socket.on('upVoteUser', function(data) {
				// console.log(data);
				sessionService.upvote(data.userid, function(session){
					// update the vote count on the front-end
					// console.log(session.votes);
				});
			});

			socket.on('downVoteUser', function(data) {
				console.log(data);
				sessionService.downvote(data.userid, function(session){
					// update the vote count on the front-end
					console.log(session.votes);
				});
			});

			socket.on('pushUser', function(data) {
				console.log(data);
				sessionService.pushuser(data.userid, data.pushed, function(session){
					// update the vote count on the front-end
					console.log(session.queue);
				});
			});

			socket.on('popUser', function(data) {
				console.log(data);
				sessionService.popUser(data.userid, data.popped, function(session){
					// update the vote count on the front-end
					console.log(session.queue);
				});
			});

		});
	}

};

// console.log(timerService, 'timerService');
// timerService.startTimer(function() {

// 	console.log('emit!');

// });
// setTimeout(function() { timerService.addTime(5); }, 1000);

//console.log(voteService, 'voteService');
