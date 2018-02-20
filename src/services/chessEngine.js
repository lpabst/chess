module.exports = {
    getComputerMove: function(level, board, moves){
        if (level === 0){
            return this.pickRandomMove(board, moves);
        }
        else if (level === 1){
            return this.aggressiveMike(board, moves);
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

    pickRandomMove: function(board, moves){
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

    aggressiveMike: function(board, moves){
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
            return this.pickRandomMove(board, moves);
        }

        board[newLocation[0]][newLocation[1]] = pieceToMove;
        board[oldLocation[0]][oldLocation[1]] = '';

        return board;
    },

}