const axios = require('axios');

function updateBoardOnState(board, newTurn){
    console.log(this);
    console.log(this.state);

    // if either player has only their king left, update the move count
    let stalemateMoveCount = this.state.stalemateMoveCount
    if (this.state.blackPieces === 1 || this.state.whitePieces === 1){
        stalemateMoveCount ++;
    }

    // Wait for a short time, then make the random move and start the user's turn again
    // setTimeout(() => {
        this.setState({
            board: board,
            pieceSelected: false,
            selectedPieceType: '',
            selectedPieceLocation: [],
            whoseTurn: newTurn,
            availableMoves: [],
            firstTurn: false,
            stalemateMoveCount: stalemateMoveCount,
        }, () => {
            this.startTurn()
        })
    // }, 250) 
      
}

function getFen(board, whoseTurn){
        
    // Builds the FEN string to send to stockfish AI
    let str = '';
    for (let i = 0; i < 8; i++){
        let emptyCount = 0;
        for (let j = 0; j < 8; j++){
            if (board[i][j]){
                let piece = board[i][j].replace(/h/, 'n');
                piece = piece.charAt(0) === 'w' ? piece.substring(1).toUpperCase() : piece.substring(1).toLowerCase();
                if (emptyCount > 0){
                    piece = emptyCount + piece;
                    emptyCount = 0;
                }
                str += piece;
            }else{
                emptyCount++;
            }
        }

        str += emptyCount > 0 ? emptyCount : '';

        if (i < 7){
            str += '/';
        }
    }

    str += ' ' + whoseTurn + ' - - 3 3';
    return str;

}

function pickRandomMove(board, moves, whoseTurn, newTurn){
    console.log(this);
    console.log(this.state);
    let searching = true;
    let randomMove;
    let i, j;

    while(searching){
        i = Math.floor(Math.random() * 8);
        j = Math.floor(Math.random() * 8);
        // Pick a random spot on the board. If that piece has available moves, pick one at random
        if (moves[i][j].length > 0){
            searching = false;
            let r = Math.floor(Math.random() * moves[i][j].length);
            randomMove = moves[i][j][r];
        }
    }

    // Carry out the random move
    let piece = board[i][j];

    // if the computer moves a pawn to the last row, turn it into a queen
    if (piece.charAt(1) === 'p' && (randomMove[0] === 0 || randomMove[0] === 7) ){
        piece = piece.substring(0, 1) + 'q';
    }

    board[randomMove[0]][randomMove[1]] = piece;
    board[i][j] = '';

    return updateBoardOnState.call(this, board, newTurn);
}

function aggressiveMike(board, moves, whoseTurn, newTurn){
    const points = {
        'q': 8,
        'r': 5,
        'b': 3.2,
        'h': 3,
        'p': 1
    }
    // build a chess engine here
    let movePoints;
    let pieceToMove;
    let oldLocation;
    let newLocation;

    for (let i = 0; i < 8; i++){
        for (let j = 0; j < 8; j++){
            let arr = moves[i][j];
            for (let k = 0; k < arr.length; k++){
                let killPiece = board[arr[k][0]][arr[k][1]];
                if (!movePoints){
                    movePoints = killPiece ? points[killPiece.charAt(1)] : 0;
                    pieceToMove = board[i][j];
                    oldLocation = [i, j];
                    newLocation = arr[k];
                }
                else if (killPiece){
                    let pieceType = killPiece.charAt(1);
                    if (points[pieceType] > movePoints){
                        movePoints = points[pieceType];
                        pieceToMove = board[i][j];
                        oldLocation = [i, j];
                        newLocation = arr[k];
                    }
                }
            }
        }
    }

    if (movePoints === 0){
        return pickRandomMove.call(this, board, moves, whoseTurn, newTurn);
    }

    board[newLocation[0]][newLocation[1]] = pieceToMove;
    board[oldLocation[0]][oldLocation[1]] = '';

    return updateBoardOnState.call(this, board, newTurn);
}

function getStockfishMove(level, originalBoard, moves, whoseTurn, newTurn){

    function flipBoard(board){
        // The FEN board is upside down from mine, so this flips it
        board = board.reverse();
        for (let arr in board){
            board[arr] = board[arr].reverse();
        }
        return board;
    }
    
    let board = JSON.parse(JSON.stringify(originalBoard));
    board = flipBoard(board);

    let fen = getFen(board, whoseTurn);
    axios.post('/api/getStockfishMove', {
        fen: fen,
        level: level
    })
    .then( response => {
        if (response.data.match(/bestmove/)){
            // if we get a bestmove back, make that move here
            let move = response.data.match(/bestmove (.*) bestmove/)[1];
            move = move.split('');

            let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            let numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];
            
            let pi = numbers.indexOf(move[1]);
            let pj = letters.indexOf(move[0]);
            let mi = numbers.indexOf(move[3]);
            let mj = letters.indexOf(move[2]);
            
            let piece = board[pi][pj];
            board[mi][mj] = piece;
            board[pi][pj] = '';

            board = flipBoard(board);
            
            return updateBoardOnState.call(this, board, newTurn);
        }else{
            // if no bestmove data was returned, pick a random move
            board = flipBoard(board);
            return pickRandomMove.call(this, board, moves, whoseTurn, newTurn);
        }
    })
    .catch( err => {
        // if it errors out, pick a random move
        board = flipBoard(board);
        return pickRandomMove.call(this, board, moves, whoseTurn, newTurn);
    })

}


module.exports = {
    getComputerMove: function(level, board, moves, whoseTurn, newTurn){
        if (level === 0){
            return pickRandomMove.call(this, board, moves, whoseTurn, newTurn);
        }
        else if (level === 1){
            return aggressiveMike.call(this, board, moves, whoseTurn, newTurn);
        }
        else if (level > 1){
            return getStockfishMove.call(this, level, board, moves, whoseTurn, newTurn);
        }
    },

}