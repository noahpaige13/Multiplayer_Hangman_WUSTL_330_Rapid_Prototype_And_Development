
// our localhost port
const port = 8080;

//use express
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

let games = {'Main Lobby': {'word': null, 'creator': 'none', 'banList': [], 'hint': null, 'count': 0, 'spaces': [], 'indices': [], 'lettersGuessed': [], 'guessesRemaining': 7, alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']}};
let users = {};
let wins = {};
let losses = {};
let ids = {};
				  
io.on('connection', socket => {
  	console.log('New client connected')
	socket.on('game_to_server', function(data) {
		let letter = data['letter']
		let game = socket.room;
		let word = games[game]['word'];
        let splits = word.toUpperCase().split('');
        let ii = games[game]['alphabet'].indexOf(letter);
        let a = games[game]['alphabet'].splice(0, ii).concat(games[game]['alphabet'].splice(1));
        games[game]['lettersGuessed'].push(letter);
		games[game]['alphabet'] = a;
        console.log("letter:" + letter+ " in splits: " + splits)
        if (splits.includes(letter)){
			games[game]['indices'] = [];
            let index = splits.indexOf(letter);
            while (index !== -1){
                games[game]['indices'].push(index);
                index = splits.indexOf(letter, index + 1);
            }
            for ( let i = 0; i < games[game]['indices'].length; i++){
				let spaces = games[game]['spaces']
                spaces[games[game]['indices'][i]] = letter;
            }
            let num = 0;
            for (let j = 0 ; j < games[game]['spaces'].length; j++){
                if (games[game]['spaces'][j] == ' _ '){
                    break;
                }
                num = num + 1;
			}
            if (num == games[game]['spaces'].length){
				socket.emit('win');
				wins[data['user']] = wins[data['user']]+1;
				//go back to main
                socket.leave(socket.room);
				socket.join('Main Lobby');
            }
        }
        else{
            if(games[game]['guessesRemaining'] - 1 >= 0){
                games[game]['guessesRemaining'] = games[game]['guessesRemaining'] -1;
            }
            else {
				socket.emit('lose');
				losses[data['user']] = losses[data['user']]+1;
				//go back to main
                socket.leave(socket.room);
				socket.join('Main Lobby');
            }
		}
		io.sockets.in(socket.room).emit("game_to_client",{spaces: games[game]['spaces'], guessesRemaining: games[game]['guessesRemaining'], lettersGuessed: games[game]['lettersGuessed'], alphabet: games[game]['alphabet'], hint:games[game]['hint'] }) 
	});

  	socket.on('login_to_server', function(data) {
		console.log("HEREERE");
		socket.name = data['user'];
		ids[data['user']]= socket.id;
		socket.room = "Main Lobby";
		socket.join(socket.room);
		users[data["user"]] = socket.room;
		wins[data["user"]] = 0;
		losses[data["user"]] = 0;
		console.log("login users: "+ JSON.stringify(users) )

		userlist = [];
		for (user in users){
			userlist.push(user);
		}
		io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, game: socket.room});
		io.sockets.emit("login_to_client",{games: games, users:users}); 
	});

	socket.on('add_game_to_server', function(data) {
		let oldroom = socket.room;
		socket.leave(socket.room);
		socket.join(data['game']);
		let game = data['game'];
		//initialize
		games[data['game']] = {}
		games[data['game']]['word'] = data["word"];
		games[data['game']]['creator'] = data["user"];
		games[data['game']]['banList'] = [];
		games[data['game']]['hint'] = data['hint'];
		games[data['game']]['count'] = 0;
		games[data['game']]['alphabet'] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		games[data['game']]['lettersGuessed'] = [];
		games[data['game']]['spaces'] = [];
		games[data['game']]['indices'] = [];
		games[data['game']]['guessesRemaining'] = 7;

		let c = 0;
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

        for ( let i = 0; i < data['word'].length; i++){
            games[data['game']]['spaces'].push(' _ ');
        }
		io.sockets.in(socket.room).emit("game_to_client",{spaces: games[game]['spaces'], guessesRemaining: games[game]['guessesRemaining'], lettersGuessed: games[game]['lettersGuessed'], alphabet: games[game]['alphabet'], hint: data['hint'] }) 
		io.sockets.to(socket.room).emit("users_to_client",{ userlist:userlist, game: socket.room}) 
		io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist: olduserlist})
		io.sockets.emit('update_games_to_client',{game: data["game"]})
		io.sockets.to(socket.room).emit("hint_to_client",{ hint:data['hint']}) 
		io.sockets.to(socket.room).emit("keys_display1",{creator: data['user'], count:c}) 
	});

	socket.on('changegame_to_server', function(data) {
		if (games[data['game']]['banList'].includes(data["user"])){
			socket.emit('banned')
		}
		else{
			console.log(data['user'] + "changing rooms /// joining: " + data['game'] + " /// leaving: "+socket.room)
			let oldroom = socket.room;
			socket.leave(socket.room);
			socket.join(data['game']);
			socket.room = data['game'];
			let c = games[data['game']]['count'];
			c = c + 1;
			games[data['game']]['count'] = c;

			let game = data['game'];
			// if user is not joining the room they are already in, clear game
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
			io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist:olduserlist})
			io.sockets.to(socket.room).emit("hint_to_client",{hint: data['hint']})
			socket.emit("show_game", {word: games[socket.room]['word'], game: socket.room})
			io.sockets.to(socket.id).emit("game_to_client",{spaces: games[game]['spaces'], guessesRemaining: games[game]['guessesRemaining'], lettersGuessed: games[game]['lettersGuessed'], alphabet: games[game]['alphabet'], hint:games[game]['hint'] }) 

			if (c == 1){
				io.sockets.to(socket.room).emit("keys_display",{ creator: games[data['game']]['creator'], count:c}) 
			}
			else {
				io.sockets.to(socket.room).emit("keys_display1",{ creator: games[data['game']]['creator'], count:c}) 
			}
			
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

	socket.on('challenge_to_server', function(data) {
		let socket_other = io.sockets.sockets[ids[data['other_user']]];
		let oldroom = socket.room;
		socket.leave(oldroom);
		socket_other.leave(oldroom);

		socket.room = socket.id + ids[data['other_user']];
		let game = socket.room;
		socket.join(socket.room);
		socket_other.join(socket.room);
		socket_other.room = socket.room;

		users[data['user']] = socket.room;
		users[data['other_user']] = socket.room;
		
		socket.emit("reset_game")
		socket_other.emit("reset_game")

		games[socket.room] = {}
		games[socket.room]['word'] = data["word"];
		games[socket.room]['creator'] = data["user"];
		games[socket.room]['banList'] = [];
		games[socket.room]['hint'] = data['hint'];
		games[socket.room]['count'] = 0;
		games[socket.room]['alphabet'] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		games[socket.room]['lettersGuessed'] = [];
		games[socket.room]['spaces'] = [];
		games[socket.room]['indices'] = [];
		games[socket.room]['guessesRemaining'] = 7;

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
		console.log(data['word'])

		for ( let i = 0; i < data['word'].length; i++){
            games[socket.room]['spaces'].push(' _ ');
        }
		
		io.sockets.to(socket.room).emit("users_to_client",{userlist:null, game:data["user"]+" and " + data["other_user"]}) 
		io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist:olduserlist})
		io.sockets.to(socket.room).emit("hint_to_client",{hint: data['hint']})
		
		io.sockets.to(socket.id).emit("show_game", {word: games[socket.room]['word'], game: socket.room})
		io.sockets.to(socket_other.id).emit("show_game", {word: games[socket.room]['word'], game: socket.room})
		io.sockets.to(socket.room).emit("game_to_client",{spaces: games[game]['spaces'], guessesRemaining: games[game]['guessesRemaining'], lettersGuessed: games[game]['lettersGuessed'], alphabet: games[game]['alphabet'], hint:games[game]['hint'] }) 

		io.to(socket.id).emit("keys_display1",{creator: data['user'], count:0}) 
		io.to(socket_other.id).emit("keys_display",{creator: data['user'], count:1}) 


	});

	socket.on('get_rank', function(data) {
		socket.emit('get_rank', {wins: wins[data['user']], losses: losses[data['user']]})
	});
	socket.on('cheat', function(data) {
		let w = games[socket.room]['word'];
		w = w.split('');
		let s = games[socket.room]['spaces'];


		for ( let i = 0; i < s.length; i++){
            if (s[i] == ' _ '){
				s[i] = w[i].toUpperCase;
				break;	
			}
			
        }
		let game = socket.room;
		games[socket.room]['spaces'] = s;

		io.sockets.to(socket.room).emit("game_to_client",{spaces: games[game]['spaces'], guessesRemaining: games[game]['guessesRemaining'], lettersGuessed: games[game]['lettersGuessed'], alphabet: games[game]['alphabet'], hint:games[game]['hint'] }) 
	});

	socket.on('kick_to_server', function(data) {
		if (data["user"] == games[socket.room]['creator']){
			let oldroom = socket.room;
			
			let socket_kick = io.sockets.sockets[ids[data['other_user']]];	
			socket_kick.leave(socket_kick.room);
			socket_kick.join('Main Lobby');
			socket_kick.room = 'Main Lobby';
			socket_kick.emit("hide_game")

			users[data['other_user']] = "Main Lobby";
	
			userlist = [];
			olduserlist = [];
			for (user in users){
				if (users[user] == 'Main Lobby'){
					userlist.push(user);
				}
				else if (users[user] == oldroom){
					olduserlist.push(user);
				}
			}
			io.sockets.to('Main Lobby').emit("users_to_client",{userlist:userlist, game: 'Main Lobby'}) 
			io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist:olduserlist})
		}
		else{
			socket.emit('cannot_kick')
		}
	});

	socket.on('ban_to_server', function(data) {
		console.log(socket.room)
		if (data["user"] == games[socket.room]['creator']){
			games[socket.room]['banList'].push(data["other_user"]);
			let oldroom = socket.room;
			
			let socket_kick = io.sockets.sockets[ids[data['other_user']]];
			socket_kick.leave(socket_kick.room);
			socket_kick.join('Main Lobby');
			socket_kick.room = 'Main Lobby';
			socket_kick.emit("hide_game")

			users[data['other_user']] = "Main Lobby";
	
			userlist = [];
			olduserlist = [];
			for (user in users){
				if (users[user] == 'Main Lobby'){
					userlist.push(user);
				}
				else if (users[user] == oldroom){
					olduserlist.push(user);
				}
			}
			io.sockets.to('Main Lobby').emit("users_to_client",{userlist:userlist,game: 'Main Lobby'}) 
			io.sockets.to(oldroom).emit("oldroom_users_to_client",{olduserlist:olduserlist})
		}
		else{
			socket.emit('cannot_ban')
		}
	});

	socket.on('deletegame_to_server', function(data) {
		console.log(data["game"])
		console.log(games[data["game"]])
		if (data["user"] == games[data["game"]]['creator']){
			userlist = [];
			delete games[data["game"]];
			for (user in users){
				if (users[user] == data['game']){
					users[user] == "Main Lobby";
					let socket_kick = io.sockets.sockets[ids[user]];			
					socket_kick.leave(data["game"]);
					socket_kick.join("Main Lobby");
					socket_kick.room = "Main Lobby";
					userlist.push(user);
					socket_kick.emit("hide_game");
				}
				else if (users[user] == "Main Lobby"){
					userlist.push(user);
				}
			}
			io.sockets.to('Main Lobby').emit("users_to_client",{userlist:userlist,game: 'Main Lobby'}) 
			io.sockets.emit("login_to_client",{games: games, users:users});
		}
		else{
			socket.emit('cannot_delete')
		}
	});
})

server.listen(port, () => console.log(`Listening on port ${port}`))