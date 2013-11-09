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

		});
	}

};