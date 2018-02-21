const axios = require('axios');
// var stockfish = require('stockfish');
// stockfish = stockfish();

// stockfish.onmessage = function(event) {
//     let result = event.data ? event.data : event;
//     console.log(result);
//     this.result = result;
//     return result;
// };

// this.result = '';

module.exports = {
    getComputerMove: function(level, board, moves, whoseTurn){
        if (level === 0){
            return this.pickRandomMove(board, moves, whoseTurn);
        }
        else if (level === 1){
            return this.aggressiveMike(board, moves, whoseTurn);
        }
        else if (level > 1){
            return this.getStockfishMove(level, board, moves, whoseTurn);
        }
    },

    testForCheck: function(board, kingLocation, opponentsMoves){
        for (let c = 0; c < 8; c++){
          for (let d = 0; d < 8; d++){
            let arr = opponentsMoves[c][d];
            for (let k = 0; k < arr.length; k++){
              if (arr[k][0] === kingLocation[0] && arr[k][1] === kingLocation[1]){
                return true;
              }
            }
          }
        }
        return false;
    },

    fen: function(board, whoseTurn){
        // I built my board upside down, so this is to get everything in the right order
        board = board.reverse();
        for (let arr in board){
            board[arr] = board[arr].reverse();
        }

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

    },

    pickRandomMove: function(board, moves, whoseTurn){
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

        return board;
    },

    aggressiveMike: function(board, moves, whoseTurn){
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
            return this.pickRandomMove(board, moves, whoseTurn);
        }

        board[newLocation[0]][newLocation[1]] = pieceToMove;
        board[oldLocation[0]][oldLocation[1]] = '';

        return board;
    },

    getStockfishMove: function(level, board, moves, whoseTurn){
        let fen = this.fen(board, whoseTurn);
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
                let i = letters.indexOf(move[0]);
                let j = letters[1];
                console.log([i, j]);

                return this.pickRandomMove(board, moves, whoseTurn);
            }else{
                // if no bestmove data was returned, pick a random move
                return this.pickRandomMove(board, moves, whoseTurn);
            }
        })
        .catch( err => {
            // if it errors out, pick a random move
            return this.pickRandomMove(board, moves, whoseTurn);
        })

    }

}