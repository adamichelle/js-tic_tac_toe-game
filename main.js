var origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
]

const cells = document.querySelectorAll('.cell');
startGame();

function startGame(){
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    for(let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    //logic to make sure you cannot click on a place that has already been clicked
    if(typeof origBoard[square.target.id] == 'number') {
        //the human player takes a turn
        turn(square.target.id, huPlayer)
        //before ai player takes a turn, check if there's a tie
        if (!checkWin(origBoard, huPlayer) && !checkTie()) turn(bestSpot(), aiPlayer);
    }
    
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if(gameWon) gameOver(gameWon)
}

function checkWin(board, player) {
    //find places on the board that have already been played in
    let plays = board.reduce((a, e, i) => 
        (e === player) ? a.concat(i) : a, [])
        let gameWon = null;
        //check if the game has been won.
        for (let [index, win] of winCombos.entries()) {
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {index: index, player: player};
                break;
            }
        }
        return gameWon;
}

function gameOver(gameWon) {
    // Highlight all the squares that are part of the winning combination
    for(let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = 
            gameWon.player == huPlayer ? "blue" : "red";
    }
    // Make it so the user cannot click any more squares because the game is over
    for(var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    declareWinner(gameWon.player == huPlayer ? "You win." : "You lose.")
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
    if (emptySquares().length == 0) {
        //this means there's a tie
        for(var i=0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game");
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    //find the indexes of the available spots on the board using empty square and set it to avilSpots
    var availSpots = emptySquares();

    //check for terminal states, meaning someone winning and return a value accordingly
    if(checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }

    //collect the scores from each of the empty spots to evaluate later
    //make an array called moves
    var moves = [];
    //loop through empty spots while collecting each moves index and score in an obj called move
    for(var i = 0; i < availSpots.length; i++) {
        var move = {};
        //set the index number of the spot that was stored as a num in the origBoar to
        //index property of the move object
        move.index = newBoard[availSpots[i]];

        //set empty spot on the newBoard to the current player
        newBoard[availSpots[i]] = player;

        //call the minimax function with the other player & the newly changed newBoard
        if(player == aiPlayer) {
            var result = minimax(newBoard, huPlayer);        
            //store the object resulting from the minimax function that includes a score
            //prop to the score prop of the move object
            move.score = result.score;
        } else {
			var result = minimax(newBoard, aiPlayer);
			move.score = result.score;
		}

        //minimax resets newBoard to what it was before
        newBoard[availSpots[i]] = move.index;
        //pushes the move obj to the moves array
        moves.push(move);
    }

    //evaluate the best move in the moves array
    var bestMove;
    //it should chose the move with the highest score when AI is playing
    //and the move with the lowest score when the Human is playing
    if(player === aiPlayer) {
        //if the player is AI it sets the variable bestScore to the lowest possible
        //score and loops through the moves array
        var bestScore = -10000;
        for (var i = 0; i < moves.length; i++) {
            //if the move has a higher score than bestScore the algorithm stores that move
            if(moves[i].score > bestScore) {
                //incase there are moves with similar scores only the first one will be stored
                bestScore = moves[i].score;
                bestMove = i;
            } 
        }
    } else { //same eval happens when player is huPlayer
        //but this time will be set to a high score
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            //if the move has a higher score than bestScore the algorithm stores that move
            if(moves[i].score < bestScore) { //minimax looks for a move with the lowest score to store
                //incase there are moves with similar scores only the first one will be stored
                bestScore = moves[i].score;
                bestMove = i;
            } 
        }
    }

    //minimax returns the object stored in best move
    return moves[bestMove];
}