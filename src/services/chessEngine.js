const axios = require("axios");
const chessEngineV2 = require("./chessEngineV2");
const { copyJsObj } = require("./helpers");

function pickRandomMove(game) {
  const moves = game.getAllAvailableMoves();
  let searching = true;
  let randomMove;
  let i, j;

  while (searching) {
    i = Math.floor(Math.random() * 8);
    j = Math.floor(Math.random() * 8);
    // Pick a random spot on the board. If that piece has available moves, pick one at random
    if (moves[i][j].length > 0) {
      searching = false;
      let r = Math.floor(Math.random() * moves[i][j].length);
      randomMove = moves[i][j][r];
    }
  }

  // Carry out the random move
  game.movePieceToNewSquare([i, j], randomMove);
}

function aggressiveMike(game) {
  const moves = game.getAllAvailableMoves();
  const points = {
    q: 8,
    r: 5,
    b: 3.2,
    h: 3,
    p: 1,
  };

  let movePoints;
  let pieceToMove;
  let oldLocation;
  let newLocation;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let arr = moves[i][j];
      for (let k = 0; k < arr.length; k++) {
        let killPiece = game.board[arr[k][0]][arr[k][1]];
        if (!movePoints) {
          movePoints = killPiece ? points[killPiece.charAt(1)] : 0;
          pieceToMove = game.board[i][j];
          oldLocation = [i, j];
          newLocation = arr[k];
        } else if (killPiece) {
          let pieceType = killPiece.charAt(1);
          if (points[pieceType] > movePoints) {
            movePoints = points[pieceType];
            pieceToMove = game.board[i][j];
            oldLocation = [i, j];
            newLocation = arr[k];
          }
        }
      }
    }
  }

  if (movePoints === 0) {
    return pickRandomMove(game);
  }

  game.movePieceToNewSquare(oldLocation, newLocation);
}

function lorensChessEngine(game) {
  try {
    chessEngineV2.makeBestMove(game);
  } catch (e) {
    console.log(
      "Lorens chess engine threw an error, making a random move instead"
    );
    console.log(e);
    return pickRandomMove(game);
  }
}

function getStockfishMove(level, game) {
  function flipBoard(board) {
    // The FEN board is upside down from mine, so this flips it
    board = board.reverse();
    for (let arr in board) {
      board[arr] = board[arr].reverse();
    }
    return board;
  }

  let board = copyJsObj(game.board);
  board = flipBoard(board);

  let fen = game.getFen();
  axios
    .post("/api/getStockfishMove", {
      fen: fen,
      level: level,
    })
    .then((response) => {
      if (response.data.match(/bestmove/)) {
        let move = response.data.match(/bestmove (.*) bestmove/)[1];

        // if we don't get a best move back, pick a random move
        if (!move || move.length < 4) {
          console.log("best move doesn't have 4 or more, picking random move");
          return pickRandomMove(game);
        }

        move = move.split("");

        let letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        let numbers = ["8", "7", "6", "5", "4", "3", "2", "1"];

        let pi = numbers.indexOf(move[1]);
        let pj = letters.indexOf(move[0]);
        let mi = numbers.indexOf(move[3]);
        let mj = letters.indexOf(move[2]);

        // Make sure the suggested move is an available move in our moves array
        // My moves array is inverted, so get the flipped indexes
        let pieceI = 7 - pi;
        let pieceJ = 7 - pj;
        let movesI = 7 - mi;
        let movesJ = 7 - mj;

        // For the valid moves for the selected piece, check each one to see if any of them match the suggested move
        const moves = game.getAllAvailableMoves();
        let movesArr = moves[pieceI][pieceJ] || [];
        let validMove = false;
        for (let i = 0; i < movesArr.length; i++) {
          if (movesArr[i][0] === movesI && movesArr[i][1] === movesJ) {
            validMove = true;
          }
        }

        // if no valid move was found (en passant isn't added in to my valid moves) pick a random move instead.
        if (!validMove) {
          console.log("not a valid move, picking a random move instead");
          return pickRandomMove(game);
        }

        // Otherwise, make the move suggested by Stockfish!
        game.movePieceToNewSquare([pi, pj], [mi, mj]);
      } else {
        // if no bestmove data was returned, pick a random move
        board = flipBoard(board);
        console.log("no bestmove match found, picking a random move");
        return pickRandomMove(game);
      }
    })
    .catch((err) => {
      // if it errors out, pick a random move
      console.log("stockfish api call error, picking a random move");
      return pickRandomMove(game);
    });
}

module.exports = {
  getComputerMove: function (level, game) {
    if (level === 0) {
      return pickRandomMove.call(this, game);
    } else if (level === 1) {
      return aggressiveMike.call(this, game);
    } else if (level === 2) {
      return lorensChessEngine.call(this, game);
    } else {
      return getStockfishMove.call(this, level, game);
    }
  },
};
