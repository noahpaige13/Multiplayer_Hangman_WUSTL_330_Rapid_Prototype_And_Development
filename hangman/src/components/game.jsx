import React, { Component } from 'react';
import io from "socket.io-client";
const socketio = io('localhost:8080');
class Game extends Component {

    constructor() {
        super();
        this.LetterGuess = this.LetterGuess.bind(this)
        this.UpdateGame = this.UpdateGame.bind(this)
        this.cheat = this.cheat.bind(this)
        this.login = this.login.bind(this) 
        this.closeModal = this.closeModal.bind(this) 
        this.closeModal1 = this.closeModal1.bind(this) 
        this.openModal = this.openModal.bind(this) 
        this.addGame = this.addGame.bind(this) 
        this.changegame = this.changegame.bind(this)
        this.login_client = this.login_client.bind(this)
        this.update_client = this.update_client.bind(this)
        this.users_client = this.users_client.bind(this)
        this.reset_game = this.reset_game.bind(this)
        this.hide_game = this.hide_game.bind(this)
        this.show_game = this.show_game.bind(this)
        this.oldroom_client = this.oldroom_client.bind(this)
        this.reveal_hint = this.reveal_hint.bind(this)
        this.change_hint_value = this.change_hint_value.bind(this)
        this.keyboard = this.keyboard.bind(this)
        this.keyboard1 = this.keyboard1.bind(this)
        this.keyboard2 = this.keyboard2.bind(this)
        this.challenge = this.challenge.bind(this)
        this.challengeGame = this.challengeGame.bind(this)
        this.forfeit = this.forfeit.bind(this)

        this.state = {
          guessesRemaining: 7,
          alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
                  'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
          lettersGuessed: [],
          indices:[],
          word: '',
          spaces: [],
          games: [],
          users:[],
          hint: '',
          status: '',
          challenge: '',
          losses: 0,
          wins:0
        };
    }
    
    componentDidMount = () => {
        socketio.on("login_to_client", this.login_client) 
        
        //UPDATE GAMES LIST
        socketio.on("update_games_to_client",this.update_client) 
        
        // UPDATES USERS LIST
        socketio.on("users_to_client", this.users_client)

        //ALERTS
        socketio.on("banned", function(){
            alert("You have been banned from this game.");
        });
        socketio.on("win", function(){
            alert("You won!!!");
        });
        socketio.on("lose", function(){
            alert("You lost!");
        });
        socketio.on("cannot_kick", function(){
        alert("You cannot kick a user out of this room.");
        });
        socketio.on("cannot_ban", function(){
        alert("You cannot ban a user from this room.");
        });
        socketio.on("cannot_delete", function(){
        alert("You cannot delete this room.");
        });

        //RESETS GAME BOARD
        socketio.on("reset_game",this.reset_game)
        socketio.on("hide_game",this.hide_game)
        socketio.on("show_game",this.show_game)

        //GET RANK STATS
        socketio.on("get_rank",this.show_rank)

        //UPDATE OLD USERS LIST
        socketio.on("oldroom_users_to_client", this.oldroom_client)

        //UPDATE GAME
        socketio.on("game_to_client", this.UpdateGame)

        //GET LETTER HELP
        socketio.on("cheat", this.UpdateGame)

        //GET HINT
        socketio.on("hint_to_client", this.change_hint_value)

        //KEYBOARD DISPLAY
        socketio.on("keys_display", this.keyboard)
        socketio.on("keys_display1", this.keyboard1)
        socketio.on("keys", this.keyboard2)
        
    }
    

    render() {
        return ( 
            <React.Fragment>            
                <div>
                    <div>
                        <div id="options">
                            <div style={{display:'none'}} id="logout">
                                <h4>Logged in as: </h4><div id="user"> </div><br></br>
                                <div id= 'rank'>
                                    <button onClick = {this.ranking}> Get Rank </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div id="login">
                            <h2>Log In As?</h2>
                            Username: <input style ={{width:160}} type="text" id="username" placeholder="Username" />
                            <button style={{width:70}} onClick = {() => this.login()} id="login_btn">Log In</button>
                        </div>
                        <div style = {{display:'none'}} id="game-list">
                            <div style={{display:'none'}} id="add-game-modal" className="modal">
                                <div className="modal-content">
                                    <span className="close">&times;</span>
                                    <div className="container">
                                        <label><b>Game Name: </b></label>
                                        <input style={{width: 90}} id = "game_name" ref = 'game_name' type="text" placeholder="Enter Game Name" name="game_name" required/>
                                        <label><b>Word: </b></label>
                                        <input style={{width: 90}} id = "word" ref = 'word' type="text" placeholder="Enter Word" name="word" required/>
                                        <label><b>Hint: </b></label>
                                        <input style={{width: 90}} id = "hint" ref = 'hint' type="text" placeholder="Enter Hint" name="hint"/>
                                    </div>
                                    <div className="container" style={{backgroundColor:'#f1f1f1'}}>
                                    <button id="cancel_btn" onClick = {() => this.closeModal()}>Cancel</button>
                                    <button style={{float:'right'}} id="create_game" onClick = {() => this.addGame()}>Create</button>
                                    </div>
                                </div>
                            </div>

                            <h3>Game Rooms List</h3>
                            <button style={{float:'right'}} id="add-game-btn" onClick = {() => this.openModal()}>New Game</button>
                            <div id="game-room-list"></div>
                            <div>{this.state.games.map(g => <button style={{width: 50}}  style={{padding:5}}  key= {g} onClick = {() => this.changegame(g)}>Join  </button>)}</div>
                            {/* <span>{this.state.games.map(g => <button style={{width: 50}} key= {g} onClick = {() => this.watchgame(g)}>Watch</button>)}</span> */}
                            <br></br>
                            <span>{this.state.games.map(g => <button style={{width: 50}} style={{padding:5}} key= {g} onClick = {() => this.deletegame(g)}>Delete</button>)}</span>
                            <br></br>
                        </div>

                        <div style={{display:'none'}} id="users">
                            <h3>Users Online</h3>
                            <div id="users-list"></div>
                            <div>{this.state.users.map(g => <button style={{width: 70}} key= {g} onClick = {() => this.challenge(g)}>Challenge</button>)}</div>
                            <span>{this.state.users.map(g => <button style={{width: 70}} key= {g} onClick = {() => this.kick_user(g)}>Kick</button>)}</span><br></br>
                            <span>{this.state.users.map(g => <button style={{width: 70}} key= {g} onClick = {() => this.ban_user(g)}>Ban</button>)}</span>
                            <br></br>
                        </div>
                        {/* CHALLENGE */}
                        <div style={{display:'none'}} id="challenge-modal" className="modal1">
                                <div className="modal1-content">
                                    <span className="close">&times;</span>
                                    <div className="container">
                                        <label><b>Word: </b></label>
                                        <input style={{width: 90}} id = "word1" ref = 'word1' type="text" placeholder="Enter Word" name="word1" required/>
                                        <label><b>Hint: </b></label>
                                        <input style={{width: 90}} id = "hint1" ref = 'hint1' type="text" placeholder="Enter Hint" name="hint1"/>
                                    </div>
                    
                                    <div className="container" style={{backgroundColor:'#f1f1f1'}}>
                                    <button id="cancel_btn" onClick = {() => this.closeModal1()}>Cancel</button>
                                    <button style={{float:'right'}} id="create_game" onClick = {() => this.challengeGame()}>Create</button>
                                    </div>
                                </div>
                           </div>
                        <div style = {{display:'none'}} id="hangman">
                            <span>You are {this.state.status}</span>
                            <br></br>
                            <button onClick = {this.reveal_hint}> Need A Hint? </button>
                            <button onClick = {this.forfeit}> Quit </button>
                            <button onClick = {this.cheat}> Get a Letter! </button>
                            <div style={{float:'left'}}> <img alt="" src={ require('../stage'+this.state.guessesRemaining+'.png') } /> 
                                <span>{this.state.spaces.map(blank => <span>{blank}</span> )}</span>
                            </div>
                            <br></br><br></br>
                            <span>{this.state.guessesRemaining} attempts remaining</span>
                            <br></br>
                            {this.state.alphabet.map(l => <button style={{width: 50}} key= {l} onClick = {() => this.LetterGuess(l)}>{l}</button>)}
                            <br></br>
                            <span> Letters Guessed: <br></br>{this.state.lettersGuessed.map(item => <span>{item} &nbsp;</span> )}</span>
                        </div>
                        
                    </div>
                </div>
                <script src="/socket.io/socket.io.js"></script>
            </React.Fragment>
        );
    }

    change_hint_value(data){
        let h = data['hint'];
        this.setState({hint: h});
    }

    reveal_hint(){
        alert('Hint: ' + this.state.hint)
    }

    login_client(data){
        while(document.getElementById("game-room-list").firstChild){
            document.getElementById("game-room-list").removeChild(document.getElementById("game-room-list").firstChild);
        }
        document.getElementById('game-room-list').appendChild(document.createElement("br"));
        let game;
        let g = [];
        for (game in data['games']){
            g.push(game);
            document.getElementById('game-room-list').appendChild(document.createTextNode(game + '       '));
        }
        this.setState({games:g})
    }

    update_client(data){
        document.getElementById('game-room-list').appendChild(document.createTextNode(data['game'] + '       '));
        this.setState({
            games: [...this.state.games, data['game']]
        });
    }

    //ADDITIONAL GAME FUNCTIONS
    forfeit(){
        alert("Answer: " + this.state.word);
        alert("Sending you back to Main Lobby");
        this.changegame('Main Lobby');
    }
    cheat(){
        let user = document.getElementById("username").value;
        socketio.emit("cheat", {user:user})
    }

    //RANK
    ranking(){
        let user = document.getElementById("username").value;
        socketio.emit("get_rank", {user:user})
    }
    show_rank(data){
        let avg = data['wins']/(data['wins']+data['losses']);
        alert('Wins: ' + data['wins']  + '\n\n' +
        "Losses: " + data['losses'] + '\n\n' +
        'Win Pct(%): ' + avg);
    }

    //SHOW KEYBOARD
    keyboard(data){
        this.setState({status: ' playing'})
    }

    keyboard1(data){
        let user = document.getElementById("username").value;
    
        if (data['creator'] == user){
            this.setState({alphabet: [], status: ' the creator'})
        }
        else {
            this.setState({alphabet: [], spaces: [], status: ' watching'}) 
        }
    }

    keyboard2(){
        this.setState({status: ' playing'})
    }
    
    users_client(data){
        while(document.getElementById("users-list").firstChild){
            document.getElementById("users-list").removeChild(document.getElementById("users-list").firstChild);
        }
        let user;
        let u = [];
        for (user in data['userlist']){
            u.push(data["userlist"][user]);
            document.getElementById('users-list').appendChild(document.createTextNode(data["userlist"][user] + "        "));
        }
        this.setState({users: u});
    }

    oldroom_client(data){
        while(document.getElementById("users-list").firstChild){
            document.getElementById("users-list").removeChild(document.getElementById("users-list").firstChild);
        }
        let user;
        let u = [];
        for (user in data['olduserlist']){
            u.push(data["olduserlist"][user]);
            document.getElementById('users-list').appendChild(document.createTextNode(data["olduserlist"][user] + "        "));
        }
        this.setState({users: u});
    }

    reset_game(data){
        this.setState({guessesRemaining: 7, alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
            'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], lettersGuessed: [], indices:[], spaces: []});
    }
    hide_game(data){
        document.getElementById("hangman").style.display = "none";

    }

    //SHOW GAME BOARD
    show_game(data){
        if (data['game'] == "Main Lobby"){
            document.getElementById("users").style.display = "block";
            document.getElementById("hangman").style.display = "none";
        }
        else {
            this.setState({word: data['word']})
            document.getElementById("hangman").style.display = "block";
        }
    }

    //LOGIN
    login(){
        if (document.getElementById("username").value !== ""){
            document.getElementById("login").style.display = "none";
            document.getElementById("logout").style.display = "block";
            document.getElementById("user").innerHTML = document.getElementById("username").value;
            document.getElementById("game-list").style.display = "block";
            document.getElementById("users").style.display = "block";
            let user = document.getElementById("username").value
    
            socketio.emit("login_to_server", {user: user});
        }
    }

    //MODAL FUNCTIONS
    openModal(){
        let modal = document.getElementById("add-game-modal");
        modal.style.display = "block";
    }

    closeModal(){
        let modal = document.getElementById("add-game-modal");
        modal.style.display = "none";
    }
    closeModal1(){
        let modal1 = document.getElementById("challenge-modal");
        modal1.style.display = "none";
    }

    addGame(){
        let gm = document.getElementById('game_name').value;
        let word = document.getElementById('word').value;
        let username = document.getElementById('username').value;
        let hint = document.getElementById('hint').value;
        this.setState({word: word, hint: hint, hint_bool:false});

        socketio.emit("add_game_to_server", {game: gm, word: word, user: username, hint: hint});
        this.closeModal();
        gm = document.getElementById('game_name').value = "";
        document.getElementById("hangman").style.display = "block";
    }

    changegame(game) {
        let username = document.getElementById('username').value;
        socketio.emit("changegame_to_server", {game: game, user:username});
        
        this.setState({hint_bool:false})
    }

    //CHALLENGE USERS
    challenge(user) {
        this.setState ({challenge: user});
        let modal1 = document.getElementById("challenge-modal");
        modal1.style.display = "block";

    }
    
    challengeGame(){
        let word = document.getElementById('word1').value;
        console.log(word)
        let username = document.getElementById('username').value;
        let hint = document.getElementById('hint1').value;
        this.setState({word: word, hint: hint, hint_bool:false})
        socketio.emit("challenge_to_server", {user: username, other_user: this.state.challenge, word:word, hint:hint});
        this.setState({challenge:''})

        this.closeModal1();
        document.getElementById("hangman").style.display = "block";
    }

    kick_user(user) {
        let username = document.getElementById('username').value;
        socketio.emit("kick_to_server", {user: username, other_user:user});
    }

    ban_user(user) {
        let username = document.getElementById('username').value;
        socketio.emit("ban_to_server", {user: username, other_user:user});
    }

    deletegame(game) {
        let username = document.getElementById('username').value;
        socketio.emit("deletegame_to_server", {game: game, user: username});
    }

    UpdateGame(data){
        this.setState({spaces: data['spaces'], guessesRemaining: data['guessesRemaining'], lettersGuessed: data['lettersGuessed'], alphabet: data['alphabet'], hint: data['hint'] })
    }

    LetterGuess(letter){
        let username = document.getElementById('username').value;
        socketio.emit("game_to_server", {letter: letter, user: username})
    }
}
 
export default Game;