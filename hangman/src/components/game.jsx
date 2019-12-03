import React, { Component } from 'react';
import './game.css';
import io from 'socket.io-client'
const socket = io(`http://localhost:3000`)

class Game extends Component {
    state = {  
        guessesRemaining: 7,
        alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
                'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        lettersGuessed: [],
        indices:[],
        word: "America",
        spaces: [],
        roomname : 'Main Lobby',
        // data: null


    };

    // componentDidMount() {    
    //     socket.on(`server:event`, data => {
    //         this.setState({ data })
    //     })
    // }

    // login = user => {
    //     socket.emit(`client: login_to_server`, user)
    // }
    // componentDidMount() {
    //     fetch('/server')
    //     .then (res => res.json())
    //     .then(data => this.setState ({data}))
    // }

    
    constructor(){
        super();
        this.LetterGuess = this.LetterGuess.bind(this)
        this.CheckGuess = this.CheckGuess.bind(this)
        this.setBoard = this.setBoard.bind(this)
        this.login = this.login.bind(this) 
        this.closeModal = this.closeModal.bind(this) 
        this.openModal = this.openModal.bind(this) 
        this.addGame = this.addGame.bind(this) 
    }

    render() { 

        console.log(socket)
        
        socket.on("login_to_client",function(data) {
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
                button.setAttribute('onclick', 'changegame(this.id)');
    
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
        });

        return ( 
            
            <React.Fragment>
            
            <div>
                
                
                <div id="options">
                    
                    <div style={{display:'none'}} id="logout">
                        <h3>Logged in as: </h3><div id="user"> </div><br></br>
                    </div>
                    <div id="login">
                    <h2>Log In As?</h2>
                        Username: <br></br><input style ={{width:90}} type="text" id="username" placeholder="Username" /><br></br>
                        <button style={{width:90}} onClick = {() => this.login()} id="login_btn">Log In</button>
                    </div>
                    <br></br>
                    <div style={{display:'none'}} id="users">
                    <h3>Users Online</h3>
                    <div id="users-list"></div>
                    </div>
                </div>

                <div style = {{display:'none'}} id="game-list">
                        <div id="add-game">
                        <button id="add-game-btn" onClick = {() => this.openModal()}>New Game</button>
                        </div>
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
                        <div id="game-room-list"></div>
                </div>





                <div style={{float:'left'}}> <img src={ require('../stage'+this.state.guessesRemaining+'.png') } /> 
                <span  >{this.state.spaces.map(blank => <span>{blank}</span> )}</span>
                </div>
                

                <span>You have: {this.state.guessesRemaining} attempts remaining</span>
                <br></br>
                {this.state.alphabet.map(l => <button style={{width: 50}} key= {l} onClick = {() => this.LetterGuess(l)}>{l}</button>)}
                <br></br>
                <span> Letters Guessed: <br></br>{this.state.lettersGuessed.map(item => <span>{item}</span> )}</span>
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
            document.getElementById("add-game").style.display = "block";
            document.getElementById("root").style.display = "block";
            
            let user = document.getElementById("username").value
            
            socket.emit("login_to_server", {user: user});
        }
    }



    openModal(){
        let modal = document.getElementById("add-game-modal");
        // let span = document.getElementsByClassName("close")[0];

        modal.style.display = "block";

    }

    closeModal(){
        let modal = document.getElementById("add-game-modal");
        // let span = document.getElementsByClassName("close")[0];

        modal.style.display = "none";

    }

    addGame(){
        let gm = document.getElementById('game_name').value;
        let word = document.getElementById('word').value;
        console.log(gm)
        let username = document.getElementById('username').value;

        // socketio.emit("add_game_to_server", {game: gm, word: word, user: username});
        
        this.closeModal();
        // document.getElementById('game-room-name').innerHTML = newgame;
        gm = document.getElementById('game_name').value = "";
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
        this.state.indices = [];
        let i = this.state.indices;

        if (splits.includes(letter)){
            let index = splits.indexOf(letter);
            while (index !== -1){
                i.push(index);
                index = splits.indexOf(letter, index + 1);
            }

            this.setState({indices: i});
            // console.log(this.state.indices);

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