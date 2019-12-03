import React, { Component } from 'react';
import io from "socket.io-client";
const socketio = io('localhost:8080');
class Game extends Component {

    constructor() {
        super();
        this.LetterGuess = this.LetterGuess.bind(this)
        this.CheckGuess = this.CheckGuess.bind(this)
        this.setBoard = this.setBoard.bind(this)
        this.login = this.login.bind(this) 
        this.closeModal = this.closeModal.bind(this) 
        this.openModal = this.openModal.bind(this) 
        this.addGame = this.addGame.bind(this) 
        this.changegame = this.changegame.bind(this)

        this.state = {
          guessesRemaining: 7,
          alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
                  'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
          lettersGuessed: [],
          indices:[],
          word: "America",
          spaces: []
        };
    }
    
      componentDidMount = () => {

        socketio.on("login_to_client",function(data) {
            while(document.getElementById("game-room-list").firstChild){
                document.getElementById("game-room-list").removeChild(document.getElementById("game-room-list").firstChild);
             }
    
             document.getElementById('game-room-list').appendChild(document.createElement("br"));
             let game;
             for (game in data['games']){
                //create join game buttons
                let button = document.createElement('input');
                button.setAttribute('type','button');
                button.setAttribute('id', game);
                button.setAttribute('value', 'Join' );
                button.setAttribute('class', game);
                button.style.textAlign = "center";
                button.setAttribute('onClick', '{this.changegame(this.id)}');
    
                //append buttons to chat room list
                document.getElementById('game-room-list').appendChild(document.createTextNode(game));
                document.getElementById('game-room-list').appendChild(button);
    
                //create watch game buttons
                let button2 = document.createElement('input');
                button2.setAttribute('type','button');
                button2.setAttribute('id', game);
                button2.setAttribute('value', 'Watch' );
                button2.setAttribute('class', game);
                button2.setAttribute('onclick', 'watchgame(this.id)');
                button2.style.textAlign = "center";
                document.getElementById('game-room-list').appendChild(button2);
    
                //create delete room buttons
                let button1 = document.createElement('input');
                button1.setAttribute('type','button');
                button1.setAttribute('id', game);
                button1.setAttribute('value', 'Delete' );
                button1.setAttribute('class', game);
                button1.setAttribute('onclick', 'deletegame(this.id)');
                button1.style.textAlign = "center";
                document.getElementById('game-room-list').appendChild(button1);
    
                document.getElementById('game-room-list').appendChild(document.createElement("br"));
             }
        })

        // UPDATES ROOM LIST AFTER ADDING
        socketio.on("update_games_to_client",function(data) {
            //Append an HR thematic break and the escaped HTML of the new message
            document.getElementById('game-room-list').appendChild(document.createElement("br"));

            // create join game buttons
            let button = document.createElement('input');
            button.setAttribute('type','button');
            button.setAttribute('id', data["game"]);
            button.setAttribute('value', 'Join' );
            button.setAttribute('class', data["game"]);
            button.setAttribute('onClick', '{this.changegame(this.id)}');
            button.style.textAlign = "center";

            //create watch game buttons
            let button2 = document.createElement('input');
            button2.setAttribute('type','button');
            button2.setAttribute('id', data["game"]);
            button2.setAttribute('value', 'Watch' );
            button2.setAttribute('class', data["game"]);
            button2.setAttribute('onClick', 'watchgame(this.id)');
            button2.style.textAlign = "center";

            // create delete game buttons
            let button1 = document.createElement('input');
            button1.setAttribute('type','button');
            button1.setAttribute('id', data["game"]);
            button1.setAttribute('value', 'Delete' );
            button1.setAttribute('class', data["game"]);
            button1.setAttribute('onclick', 'deletegame(this.id)');
            button1.style.textAlign = "center";
            
            // append buttons to chat room list
            document.getElementById('game-room-list').appendChild(document.createTextNode(data["game"]));
            document.getElementById('game-room-list').appendChild(button);
            document.getElementById('game-room-list').appendChild(button2);
            document.getElementById('game-room-list').appendChild(button1);
        });

        // UPDATES USERS LIST
        socketio.on("users_to_client",function(data) {
            while(document.getElementById("users-list").firstChild){
                document.getElementById("users-list").removeChild(document.getElementById("users-list").firstChild);
            }

            document.getElementById('users-list').appendChild(document.createElement("br"));
            let user;
            for (user in data['userlist']){
                // ADD PM, KICK, BAN BUTTONS FOR EACH USER
                let button0 = document.createElement('input');
                button0.setAttribute('type','button');
                button0.setAttribute('id', data["userlist"][user]);
                button0.setAttribute('value', 'Challenge' );
                button0.setAttribute('class', data["userlist"][user]);
                button0.setAttribute('onclick', 'challenge(this.id)')
                button0.style.textAlign = "center";
                let button = document.createElement('input');
                button.setAttribute('type','button');
                button.setAttribute('id', data["userlist"][user]);
                button.setAttribute('value', 'Kick Out' );
                button.setAttribute('class', data["userlist"][user]);
                button.setAttribute('onclick', 'kick_user(this.id)')
                button.style.textAlign = "center";
                let button1 = document.createElement('input');
                button1.setAttribute('type','button');
                button1.setAttribute('id', data["userlist"][user]);
                button1.setAttribute('value', 'Ban' );
                button1.setAttribute('class', data["userlist"][user]);
                button1.setAttribute('onclick', 'ban_user(this.id)')
                button1.style.textAlign = "center";
            
                document.getElementById('users-list').appendChild(document.createTextNode(data["userlist"][user] + " \t"));
                document.getElementById('users-list').appendChild(button0);
                document.getElementById('users-list').appendChild(button);
                document.getElementById('users-list').appendChild(button1);
                document.getElementById('users-list').appendChild(document.createElement("br"));
            }

            // document.getElementById('game-room-name').innerHTML = data['game'];
        });

        socketio.on("banned", function(){
            alert("You have been banned from this game.");
        });

        //RESETS GAME BOARD
        socketio.on("reset_game", function(){
            this.setState({guessesRemaining: 7, alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
            'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], lettersGuessed: [], indices:[], spaces: []});
            // while(document.getElementById("hangman").firstChild){
            //     document.getElementById("chatlog").removeChild(document.getElementById("chatlog").firstChild);
            // } 
        });

    }
    

    render() { 
        return ( 
            <React.Fragment>            
                <div>
                    <div>
                        <div id="options">
                            <div style={{display:'none'}} id="logout">
                                <h4>Logged in as: </h4><div id="user"> </div><br></br>
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
                        </div>

                        <div style={{display:'none'}} id="users">
                            <h3>Users Online</h3>
                            <div id="users-list"></div>
                        </div>

                        <div style = {{display:'none'}} id="hangman">
                            <div style={{float:'left'}}> <img alt="" src={ require('../stage'+this.state.guessesRemaining+'.png') } /> 
                                <span>{this.state.spaces.map(blank => <span>{blank}</span> )}</span>
                            </div>
                            
                            <span>You have: {this.state.guessesRemaining} attempts remaining</span>
                            <br></br>
                            {this.state.alphabet.map(l => <button style={{width: 50}} key= {l} onClick = {() => this.LetterGuess(l)}>{l}</button>)}
                            <br></br>
                            <span> Letters Guessed: <br></br>{this.state.lettersGuessed.map(item => <span>{item}</span> )}</span>
                        </div>
                    </div>
                </div>
                <script src="/socket.io/socket.io.js"></script>
            </React.Fragment>
        );
    }

    login(){
        if (document.getElementById("username").value !== ""){
            document.getElementById("login").style.display = "none";
            document.getElementById("logout").style.display = "block";
            document.getElementById("user").innerHTML = document.getElementById("username").value;
            document.getElementById("game-list").style.display = "block";
            document.getElementById("users").style.display = "block";
            // document.getElementById("add-game").style.display = "block";
            // document.getElementById("users").style.display = "block";
            
            let user = document.getElementById("username").value
            
            socketio.emit("login_to_server", {user: user});
        }
    }

    openModal(){
        let modal = document.getElementById("add-game-modal");
        modal.style.display = "block";
    }

    closeModal(){
        let modal = document.getElementById("add-game-modal");
        modal.style.display = "none";
    }

    addGame(){
        let gm = document.getElementById('game_name').value;
        let word = document.getElementById('word').value;
        let username = document.getElementById('username').value;

        socketio.emit("add_game_to_server", {game: gm, word: word, user: username});
        
        this.closeModal();
        // document.getElementById('game-room-name').innerHTML = newgame;
        gm = document.getElementById('game_name').value = "";
        document.getElementById("users").style.display = "none";
        document.getElementById("hangman").style.display = "block";
        this.setBoard();
    }

    changegame(game) {
        console.log("going to: " + game);
        let username = document.getElementById('username').value;
        socketio.emit("changegame_to_server", {game: game, user:username});
    }

    setBoard(){
        let s = this.state.word;
        let blanks = this.state.spaces;
        for ( let i = 0; i < s.length; i++){
            blanks.push(' _ ');
        }
        this.setState({spaces: blanks});
    }

    CheckGuess(letter){
        let s = this.state.word;
        let splits = s.toUpperCase().split('');
        this.setState({indices :[]});
        let i = this.state.indices;

        if (splits.includes(letter)){
            let index = splits.indexOf(letter);
            while (index !== -1){
                i.push(index);
                index = splits.indexOf(letter, index + 1);
            }
            this.setState({indices: i});
            return true;
        }
        else{
            return false;
        }
    }

    LetterGuess(letter){
        console.log(letter)
        this.setBoard();
        // Remove Letter From Alphabet
        let i = this.state.alphabet.indexOf(letter);
        let a = this.state.alphabet.splice(0, i).concat(this.state.alphabet.splice(1));
        let g =  this.state.lettersGuessed
        g.push(letter);
        this.setState({alphabet: a, lettersGuessed: g});
        // console.log(this.state.lettersGuessed)

        // If Guess is Wrong
        if (!this.CheckGuess(letter)){
            if(this.state.guessesRemaining - 1 >= 0){
                this.setState({ guessesRemaining: this.state.guessesRemaining - 1});
            }
            else{
                alert("You Lose");
            }
        }
        else{
            console.log(this.state.indices)
            console.log(this.state.spaces)

            let blanks = this.state.spaces;
            for ( let i = 0; i < this.state.indices.length; i++){
                
                blanks[this.state.indices[i]] = letter;
            }
            this.setState({spaces: blanks});
        }
    }
}
 
export default Game;