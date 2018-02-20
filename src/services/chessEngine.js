module.exports = {
    getComputerMove: function(level, board, moves){
        if (level === 0){
            return this.pickRandomMove(board, moves);
        }
        else if (level === 1){
            return this.anotherFunction(board, moves);
        }
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

    anotherFunction: function(board, moves){
        // build a chess engine here
    }
}