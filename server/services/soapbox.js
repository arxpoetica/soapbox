var rootDir = process.env.NODE_ENV === 'production' ? '/home/deploy/current' : process.cwd();
var timerService = require(rootDir + '/server/services/timer');
var voteService = require(rootDir + '/server/services/vote');

var self = module.exports = {
	users: [],
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
				self.users.push(data.id);

				// io.sockets.in(data.room).emit('newUser', {numUsers: numClients, id: data.id});
				socket.broadcast.emit('newUser', data.id);
				//broadcast out new users to add to client queues
				
				//respond to user with queue
				socket.emit('join', self.users);

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
					socket.broadcast.emit('userLeft', data.id);
				});
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

		});
	}

};

// console.log(timerService, 'timerService');
// timerService.startTimer(function() {

// 	console.log('emit!');

// });
// setTimeout(function() { timerService.addTime(5); }, 1000);


console.log(voteService, 'voteService');