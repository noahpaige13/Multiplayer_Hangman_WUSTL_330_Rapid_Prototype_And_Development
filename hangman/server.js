
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
		io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, game: socket.room});
		io.sockets.emit("login_to_client",{games: games, users:users}); 
	});

	socket.on('add_game_to_server', function(data) {
		// let oldroom = socket.room;

		socket.leave(socket.room);
		socket.join(data['game']);
			
		games[data['game']] = {}
		games[data['game']]['word'] = data["word"];
		games[data['game']]['creator'] = data["user"];
		games[data['game']]['banList'] = [];
		
		socket.room = data['game'];
		users[data['user']] = socket.room;
		userlist = [];
		olduserlist = [];
		for (user in users){
			if (users[user] == socket.room){
				userlist.push(user);
			}
			else{
				olduserlist.push(user);
			}
		}
		io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, game: socket.room}) 
		// io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist: olduserlist})
		io.sockets.emit('update_games_to_client',{game: data["game"]})
	});

	socket.on('changegame_to_server', function(data) {
		if (rooms[data['game']]['banList'].includes(data["user"])){
			socket.emit('banned')
		}
		else{
			console.log(data['user'] + "changing rooms /// joining: " + data['game'] + " /// leaving: "+socket.room)
			let oldroom = socket.room;
			socket.leave(socket.room);
			socket.join(data['game']);
			socket.room = data['game'];

			// if user is not joining the room they are already in, clear the chat log
			if(oldroom != socket.room){
				socket.emit("reset_game")
			}
			users[data['user']] = socket.room;
			userlist = [];
			olduserlist = [];
			for (user in users){
				if (users[user] == socket.room){
					userlist.push(user);
				}
				else if (users[user] == oldroom){
					olduserlist.push(user);
				}
			}
			io.sockets.to(socket.room).emit("users_to_client",{userlist:userlist, game:socket.room}) 
			// io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist:olduserlist})
		}
	});

	socket.on('disconnect', function(data) {
		console.log(socket.name)
		socket.leave(socket.room);
		delete users[socket.name];
		userlist = [];
		for (user in users){
			userlist.push(user);
		}
		io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, game: ""});
	});

})

server.listen(port, () => console.log(`Listening on port ${port}`))