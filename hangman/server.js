
// our localhost port
const port = 8080;

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

let games = {'Main Lobby': {'word': null, 'creator': 'none', 'banList': []}};
let users = {};
let ids = {};

io.on('connection', socket => {
  console.log('New client connected')


  socket.on('login_to_server', function(data) {
		console.log("HEREERE");
		socket.name = data['user'];
		ids[data['user']]= socket.id;
		socket.room = "Main Lobby";
		socket.join(socket.room);
		users[data["user"]] = socket.room;
		console.log("login users: "+ JSON.stringify(users) )

		userlist = [];
		for (user in users){
			userlist.push(user);
		}
		// socket.broadcast.to(socket.room).emit('broadcast', {message: data["user"]+" has joined the chat."})
		// io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, room: socket.room});
		io.sockets.emit("login_to_client",{games: games, users:users}); 
		
	});

})

server.listen(port, () => console.log(`Listening on port ${port}`))