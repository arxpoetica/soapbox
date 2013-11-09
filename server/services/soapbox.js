var self = module.exports = {

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
				socket.join(data.room);
				var numClients = io.sockets.clients(data.room).length;
				console.log('Room ' + data.room + ' has ' + numClients + ' clients');
				io.sockets.in(data.room).emit('newUser', {numUsers: numClients, id: data.id});
				//TODO get queue of ids and pass it back
				socket.emit('join', numClients);
			});

			socket.on('broadcast', function (data) {
				console.log(data);
			});
		});
	}

};