import React, { Component } from 'react';

class Game extends Component {
    state = {  
        guessesRemaining: 7,
        alphabet : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q','R','S',
                'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        currentLetter: ""
    }
    
    constructor(){
        super();
        this.LetterGuess = this.LetterGuess.bind(this)
    }

    render() { 

        return ( 
            <React.Fragment>
                <div style={{float:'left'}}> <img src={ require('../stage0.png') } /> </div>
                

                <span>You have: {this.state.guessesRemaining} attempts remaining</span>
                <br></br>
            
                {this.state.alphabet.map(letter => <button style={{width: 50}} key= {letter} onClick = {() => this.LetterGuess(letter)}>{letter}</button>)}
                <br></br>
                <span> {this.state.currentLetter}</span>
            </React.Fragment>
        );
        

    }

    LetterGuess(letter){
        console.log(letter)
        this.setState({currentLetter: letter, guessesRemaining: this.state.guessesRemaining - 1});

    }

    
}
 
export default Game;