import { copyJsObj, opponentsTurn } from "./helpers";

let metrics = {
  minimaxTotal: 0,
  minimixPerTurn: 0,
};

const settings = {
  cutExtremeLogicPathsShort: false,
  extremeLogicPathThreshold: 9,
  ignoreOtherPathsThreshold: 11,
  limitByTime: true,
  timeLimitInSeconds: 10,
};

function ChessEngine({ board, castlingInfo, whoseTurn }) {
  this.board = copyJsObj(board);
  this.castlingInfo = copyJsObj(castlingInfo);
  this.whoseTurn = whoseTurn;
  this.startTime = Date.now();

  this.getBestMove = function () {
    console.time("calc best move");
    const bestMove = this.calculateBestMove();
    console.timeEnd("calc best move");

    console.log("best move: ", bestMove);
    return {
      from: bestMove.from,
      to: bestMove.to,
      // maybe return a FEN compatible move here as well for interaction with other chess AIs
      fen: null,
    };
  };

  this.calculateBestMove = function () {
    const { moves } = this.getAllAvailableMoves(
      this.board,
      this.castlingInfo,
      this.whoseTurn,
      true
    );
    metrics.minimixPerTurn = 0;
    let bestMove = null;
    let bestValue = -999999;

    for (let i = 0; i < moves.length; i++) {
      for (let j = 0; j < moves[i].length; j++) {
        const moveFrom = [i, j];
        for (let k = 0; k < moves[i][j].length; k++) {
          const move = {
            from: moveFrom,
            to: moves[i][j][k],
          };

          // for each of the initial moves, start with the actual board as it exists currently
          let boardForMove = copyJsObj(this.board);
          const { board: newBoard, castlingInfo: newCastlingInfo } =
            this.makeAMove(boardForMove, castlingInfo, move);
          const valueForMove = this.minimax({
            depth: 2,
            isMaximizingPlayer: true,
            board: newBoard,
            castlingInfo: newCastlingInfo,
            whoseTurn: opponentsTurn(whoseTurn),
          });

          if (valueForMove > bestValue) {
            console.log(
              "found a better move! ",
              JSON.stringify(move),
              valueForMove
            );
            bestValue = valueForMove;
            bestMove = move;

            if (
              settings.cutExtremeLogicPathsShort &&
              bestValue > settings.ignoreOtherPathsThreshold
            ) {
              console.log(
                "cutting extreme logic paths short, this move is good enough"
              );
              return bestMove;
            }

            if (settings.limitByTime) {
              const now = Date.now();
              const secondsElapsed = (now - this.startTime) / 1000;
              if (secondsElapsed > settings.timeLimitInSeconds) {
                console.log(
                  "due to time limit, returning best move found so far"
                );
                return bestMove;
              }
            }
          }
        }
      }
    }

    console.log(`
      Move: ${JSON.stringify(bestMove)}, 
      value: ${bestValue}, 
      metrics: ${JSON.stringify(metrics)}
    `);
    return bestMove;
  };

  // recursively looks 'depth' deep and makes all of the moves to see which one is best
  this.minimax = function ({
    depth,
    isMaximizingPlayer,
    board,
    castlingInfo,
    whoseTurn,
  }) {
    const boardValue = this.evaluateBoard({
      board,
      whoseTurn,
    });

    if (depth === 0) {
      return boardValue;
    }

    if (
      settings.cutExtremeLogicPathsShort &&
      Math.abs(boardValue) > settings.extremeLogicPathThreshold
    ) {
      console.log(
        `this line has an extreme value of ${Math.abs(
          boardValue
        )}, ignore other options down this line`
      );
      return boardValue;
    }

    metrics.minimixPerTurn++;
    metrics.minimaxTotal++;

    // get all of the available moves for the board/castling info i was just given
    const { moves } = this.getAllAvailableMoves(
      board,
      castlingInfo,
      whoseTurn,
      true
    );

    let bestMove = isMaximizingPlayer ? -99999 : 99999;
    for (let i = 0; i < moves.length; i++) {
      for (let j = 0; j < moves[i].length; j++) {
        const moveFrom = [i, j];
        for (let k = 0; k < moves[i][j].length; k++) {
          const move = {
            from: moveFrom,
            to: moves[i][j][k],
          };
          // each move should have it's own board so they aren't polluting each others JS object
          let boardForMove = copyJsObj(board);
          const { board: newBoard, castlingInfo: newCastlingInfo } =
            this.makeAMove(boardForMove, castlingInfo, move);
          const nextDepthMinimaxValue = this.minimax({
            depth: depth - 1,
            isMaximizingPlayer: !isMaximizingPlayer,
            board: newBoard,
            castlingInfo: newCastlingInfo,
            whoseTurn: opponentsTurn(whoseTurn),
          });
          bestMove = isMaximizingPlayer
            ? Math.max(bestMove, nextDepthMinimaxValue)
            : Math.min(bestMove, nextDepthMinimaxValue);
        }
      }
    }

    return bestMove;
  };

  this.evaluateBoard = function ({ board, whoseTurn }) {
    let piecePoints = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 90,
    };

    let points = 0;
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        let piece = board[i][j];
        let pointsInSquare = piecePoints[piece.charAt(1)] || 0;
        if (whoseTurn !== piece.charAt(0)) {
          pointsInSquare *= -1;
        }
        points += pointsInSquare;
      }
    }

    return points;
  };

  // get the row/col location of the king for whatever color is passed in
  this.getKingLocation = function (board, color) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j].charAt(1) === "k" && board[i][j].charAt(0) === color) {
          return [i, j];
        }
      }
    }
  };

  // get all available moves for the whole board, for whoever's turn it is
  this.getAllAvailableMoves = function (
    board,
    castlingInfo,
    whoseTurn,
    limitToLegalMoves = true
  ) {
    let arr = [];
    let hasAvailableMoves = false;

    //goes through the whole board and creates a blank array for each board spot
    for (let i = 0; i <= 7; i++) {
      arr.push([]);
      for (let j = 0; j <= 7; j++) {
        arr[i][j] = [];
        // if and only if the piece at that spot is the color of the person whose turn it is, replace the blank array of moves with a valid array of moves for that piece.
        if (board[i][j] && board[i][j].charAt(0) === whoseTurn) {
          let moves = this.getAvailableMovesForPiece(
            board,
            castlingInfo,
            board[i][j],
            [i, j],
            limitToLegalMoves
          );
          arr[i][j] = moves;
          if (moves.length > 0) {
            hasAvailableMoves = true;
          }
        }
      }
    }

    // **returns an object, not an array**
    return {
      hasAvailableMoves: hasAvailableMoves,
      moves: arr,
    };
  };

  // Gets all available moves for the currently selected piece. This is where most of the logic/rules happen for piece movement
  this.getAvailableMovesForPiece = function (
    board,
    castlingInfo,
    selectedPieceType,
    selectedPieceLocation,
    limitToLegalMoves
  ) {
    let availableMoves = [];

    let i = selectedPieceLocation[0];
    let j = selectedPieceLocation[1];

    // Checks if a move is valid, and if continueStraightLine is true and nextI/nextJ are passed in, will continue to check in a straight line to find all valid moves
    function checkValidMove(i, j, continueStraightLine, nextI, nextJ) {
      // makes sure we are checking a spot that exists on the board (especially useful for the continueStraightLine portion)
      if (i <= 7 && i >= 0 && j <= 7 && j >= 0) {
        // if it's an empty square, or an enemy piece, add it as a valid move
        if (
          board[i][j] === "" ||
          board[i][j].charAt(0) !== selectedPieceType.charAt(0)
        ) {
          availableMoves.push([i, j]);
        }
        // If requested, continue checking in a straight line until we find a space that isn't empty (the line
        // of valid moves ends when we find another chess piece)
        if (continueStraightLine && board[i][j] === "") {
          let newNextI = nextI - i + nextI;
          let newNextJ = nextJ - j + nextJ;
          checkValidMove(nextI, nextJ, true, newNextI, newNextJ);
        }
      }
    }

    // Pawns have special movement patterns like au passant and can only kill diagonally, so I won't use the getAvailableMovesForPiece() function
    // Also, there's no need to watch for the end of the board, because on the last row it becomes something else and will have new movement rules
    // White Pawn
    if (selectedPieceType === "wp") {
      // empty space in front
      if (board[i + 1][j] === "") {
        availableMoves.push([i + 1, j]);
      }
      // First move allow 2 spaces in front if both are empty
      if (
        selectedPieceLocation[0] === 1 &&
        !board[i + 1][j] &&
        !board[i + 2][j]
      ) {
        availableMoves.push([i + 2, j]);
      }
      // Allow diagonal moves if there's an enemy there
      if (
        board[i + 1][j + 1] &&
        board[i + 1][j + 1].charAt(0) !== selectedPieceType.charAt(0)
      ) {
        availableMoves.push([i + 1, j + 1]);
      }
      if (
        board[i + 1][j - 1] &&
        board[i + 1][j - 1].charAt(0) !== selectedPieceType.charAt(0)
      ) {
        availableMoves.push([i + 1, j - 1]);
      }
    }
    // Black Pawn
    else if (selectedPieceType === "bp") {
      // empty space in front
      if (!board[i - 1][j]) {
        availableMoves.push([i - 1, j]);
      }
      // First move allow 2 spaces in front if both are empty
      if (
        selectedPieceLocation[0] === 6 &&
        !board[i - 1][j] &&
        !board[i - 2][j]
      ) {
        availableMoves.push([i - 2, j]);
      }
      // Allow diagonal moves if there's an enemy there
      if (
        board[i - 1][j + 1] &&
        board[i - 1][j + 1].charAt(0) !== selectedPieceType.charAt(0)
      ) {
        availableMoves.push([i - 1, j + 1]);
      }
      if (
        board[i - 1][j - 1] &&
        board[i - 1][j - 1].charAt(0) !== selectedPieceType.charAt(0)
      ) {
        availableMoves.push([i - 1, j - 1]);
      }
    }

    // Horse
    else if (selectedPieceType.charAt(1) === "h") {
      checkValidMove(i + 2, j + 1, false, null, null);
      checkValidMove(i + 2, j - 1, false, null, null);
      checkValidMove(i - 2, j + 1, false, null, null);
      checkValidMove(i - 2, j - 1, false, null, null);
      checkValidMove(i + 1, j + 2, false, null, null);
      checkValidMove(i - 1, j + 2, false, null, null);
      checkValidMove(i + 1, j - 2, false, null, null);
      checkValidMove(i - 1, j - 2, false, null, null);
    }

    // Rook
    else if (selectedPieceType.charAt(1) === "r") {
      // up down left right
      checkValidMove(i + 1, j, true, i + 2, j);
      checkValidMove(i - 1, j, true, i - 2, j);
      checkValidMove(i, j + 1, true, i, j + 2);
      checkValidMove(i, j - 1, true, i, j - 2);
    }

    // Bishop
    else if (selectedPieceType.charAt(1) === "b") {
      // diagonals
      checkValidMove(i - 1, j - 1, true, i - 2, j - 2);
      checkValidMove(i + 1, j + 1, true, i + 2, j + 2);
      checkValidMove(i - 1, j + 1, true, i - 2, j + 2);
      checkValidMove(i + 1, j - 1, true, i + 2, j - 2);
    }

    // Queen
    else if (selectedPieceType.charAt(1) === "q") {
      // up down left right
      checkValidMove(i + 1, j, true, i + 2, j);
      checkValidMove(i - 1, j, true, i - 2, j);
      checkValidMove(i, j + 1, true, i, j + 2);
      checkValidMove(i, j - 1, true, i, j - 2);
      // diagonals
      checkValidMove(i - 1, j - 1, true, i - 2, j - 2);
      checkValidMove(i + 1, j + 1, true, i + 2, j + 2);
      checkValidMove(i - 1, j + 1, true, i - 2, j + 2);
      checkValidMove(i + 1, j - 1, true, i + 2, j - 2);
    }

    // King
    else if (selectedPieceType.charAt(1) === "k") {
      // up down left right
      checkValidMove(i + 1, j, false, null, null);
      checkValidMove(i - 1, j, false, null, null);
      checkValidMove(i, j + 1, false, null, null);
      checkValidMove(i, j - 1, false, null, null);
      // diagonals
      checkValidMove(i - 1, j - 1, false, null, null);
      checkValidMove(i + 1, j + 1, false, null, null);
      checkValidMove(i - 1, j + 1, false, null, null);
      checkValidMove(i + 1, j - 1, false, null, null);
      // castling
      let color = selectedPieceType.charAt(0);
      // make sure the king hasn't moved
      if (!castlingInfo[color].kingHasMoved) {
        // make sure the rook hasn't moved and there's no one in the way
        if (
          !castlingInfo[color].leftRookHasMoved &&
          board[i][j + 1] === "" &&
          board[i][j + 2] === "" &&
          board[i][j + 3] === ""
        ) {
          availableMoves.push([i, j + 2]);
        }
        if (
          !castlingInfo[color].rightRookHasMoved &&
          board[i][j - 1] === "" &&
          board[i][j - 2] === ""
        ) {
          availableMoves.push([i, j - 2]);
        }
      }
    }

    // Limit the moves for this piece to avoid illegal moves that result in your own check
    if (limitToLegalMoves) {
      const pieceLocation = [i, j];
      availableMoves = this.limitPieceMovesDueToCheck(
        board,
        castlingInfo,
        availableMoves,
        pieceLocation,
        whoseTurn
      );
    }
    return availableMoves;
  };

  // Takes the list of available moves for a piece, finds any of those that result in your own king being in check, and removes them from the available list since you can't place yourself in check
  this.limitPieceMovesDueToCheck = function (
    board,
    castlingInfo,
    movesForPiece,
    pieceLocation,
    whoseTurn
  ) {
    let limitedMovesForPiece = [];
    let kingLocation = this.getKingLocation(board, whoseTurn);
    let pi = pieceLocation[0];
    let pj = pieceLocation[1];
    let piece = board[pi][pj];

    // for each available move in the array, move the piece there, then check for check. If we're in check after that move, then it's not a legal move, so remove it from the array.
    for (let i = movesForPiece.length - 1; i >= 0; i--) {
      let testBoard = copyJsObj(board);
      const move = movesForPiece[i];
      let mi = move[0];
      let mj = move[1];
      testBoard[mi][mj] = piece;
      testBoard[pi][pj] = "";
      let check = false;

      if (piece.charAt(1) !== "k") {
        check = this.testForCheck(
          testBoard,
          castlingInfo,
          kingLocation,
          whoseTurn
        );
        if (!check) {
          limitedMovesForPiece.push(move);
        }
        continue;
      }

      // Special rules for the king's moves: update the king location before testing for check
      kingLocation = [mi, mj];
      check = this.testForCheck(
        testBoard,
        castlingInfo,
        kingLocation,
        whoseTurn
      );

      if (!check) {
        // If the spot we're moving to does not put us in check, we have some additional things to check for 'castling' situations
        if (mj === pj - 2 || mj === pj + 2) {
          // test current location (can't castle when in check)
          if (
            this.testForCheck(board, castlingInfo, pieceLocation, whoseTurn)
          ) {
            check = true;
          }
          // one space away (can't castle through check) tempJ will be one space away from king's current location
          let interimBoard = copyJsObj(board);
          let tempJ = mj > pj ? pj + 1 : pj - 1;
          interimBoard[pi][tempJ] = piece;
          interimBoard[pi][pj] = "";
          if (
            this.testForCheck(
              interimBoard,
              castlingInfo,
              [pi, tempJ],
              whoseTurn
            )
          ) {
            check = true;
          }
        }
      }

      if (!check) {
        limitedMovesForPiece.push(move);
      }
    }

    return limitedMovesForPiece;
  };

  // Based on a specific board setup, tests if the player whose turn it is is in check.
  this.testForCheck = function (board, castlingInfo, kingLocation, whoseTurn) {
    let { moves: opponentsMoves } = this.getAllAvailableMoves(
      board,
      castlingInfo,
      opponentsTurn(whoseTurn),
      false
    );
    for (let c = 0; c < 8; c++) {
      for (let d = 0; d < 8; d++) {
        let arr = opponentsMoves[c][d];
        for (let k = 0; k < arr.length; k++) {
          if (arr[k][0] === kingLocation[0] && arr[k][1] === kingLocation[1]) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Moves the piece to a new location
  this.makeAMove = function (board, castlingInfo, move) {
    const newBoard = copyJsObj(board);
    const newCastlingInfo = copyJsObj(castlingInfo);

    let piece = newBoard[move.from[0]][move.from[1]];
    const pieceColor = piece.charAt(0);
    const pieceType = piece.charAt(1);

    // If a pawn advanced to the end of the board, allow a new piece to be chosen as replacement
    if ((move.to[0] === 0 || move.to[0] === 7) && pieceType === "p") {
      piece = piece.substring(0, 1) + "q";
    }

    // If they "castle" move their king AND their castle simultaneously
    if (pieceType === "k" && move.to[1] === move.from[1] - 2) {
      newBoard[move.from[0]][move.from[1] - 1] = piece.substring(0, 1) + "r";
      newBoard[move.from[0]][move.from[1] - 3] = "";
    }
    if (pieceType === "k" && move.to[1] === move.from[1] + 2) {
      newBoard[move.from[0]][move.from[1] + 1] = piece.substring(0, 1) + "r";
      newBoard[move.from[0]][move.from[1] + 4] = "";
    }

    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = "";

    // track movement of kings and rooks to limit castling
    if (pieceType === "k") {
      newCastlingInfo[pieceColor].kingHasMoved = true;
    }
    if (pieceType === "r") {
      if (move.from[1] === 0) {
        newCastlingInfo[pieceColor].rightRookHasMoved = true;
      }
      if (move.from[1] === 7) {
        newCastlingInfo[pieceColor].leftRookHasMoved = true;
      }
    }

    return { board: newBoard, castlingInfo: newCastlingInfo };
  };
}

// function getBestMove(board, castlingInfo, whoseTurn) {
//   const chessEngine = new ChessEngine({ board, castlingInfo, whoseTurn });
//   const bestMove = chessEngine.getBestMove();
//   return bestMove;
//   // let newBoard = copyJsObj(board);
//   // console.time("calc best move");
//   // const bestMove = calculateBestMove(newBoard, whoseTurn);
//   // console.timeEnd("calc best move");

//   // // make the best move here
//   // console.log("best move: ", bestMove);
//   // return {
//   //   move: {
//   //     from: bestMove.from,
//   //     to: bestMove.to,
//   //     // maybe return a FEN compatible move here as well for interaction with other chess AIs
//   //     fen: null,
//   //   },
//   // };
// }

// function calculateBestMove(board, castlingInfo, whoseTurn) {
//   const { moves } = this.getAllAvailableMoves(
//     board,
//     castlingInfo,
//     whoseTurn,
//     true
//   );
//   metrics.minimixPerTurn = 0;
//   let bestMove = null;
//   let bestValue = -999999;

//   for (let i = 0; i < moves.length; i++) {
//     for (let j = 0; j < moves[i].length; j++) {
//       const moveFrom = [i, j];
//       for (let k = 0; k < moves[i][j].length; k++) {
//         const move = {
//           from: moveFrom,
//           to: moves[i][j][k],
//         };

//         // for each of the initial moves, start with the actual board as it exists currently
//         let boardForMove = copyJsObj(board);
//         boardForMove = this.makeAMove(boardForMove, move);
//         const valueForMove = minimax({
//           depth: 4,
//           isMaximizingPlayer: true,
//           boardForMove,
//           whoseTurn: opponentsTurn(whoseTurn),
//         });

//         if (valueForMove > bestValue) {
//           console.log("found a better move! ", move, valueForMove);
//           bestValue = valueForMove;
//           bestMove = move;

//           if (
//             settings.cutExtremeLogicPathsShort &&
//             bestValue > settings.ignoreOtherPathsThreshold
//           ) {
//             return bestMove;
//           }
//         }
//       }
//     }
//   }

//   console.log(`
//     Move: ${JSON.stringify(bestMove)},
//     value: ${bestValue},
//     metrics: ${JSON.stringify(metrics)}
//   `);
//   return bestMove;
// }

// // recursively looks 'depth' deep and makes all of the moves to see which one is best
// function minimax({
//   depth,
//   isMaximizingPlayer,
//   board,
//   castlingInfo,
//   whoseTurn,
// }) {
//   const boardValue = evaluateBoard({
//     board,
//     whoseTurn,
//   });

//   if (depth === 0) {
//     return boardValue;
//   }

//   if (
//     settings.cutExtremeLogicPathsShort &&
//     Math.abs(boardValue) > settings.extremeLogicPathThreshold
//   ) {
//     return boardValue;
//   }

//   metrics.minimixPerTurn++;
//   metrics.minimaxTotal++;
//   const { moves } = this.getAllAvailableMoves(
//     board,
//     castlingInfo,
//     whoseTurn,
//     true
//   );

//   let bestMove = isMaximizingPlayer ? -99999 : 99999;
//   for (let i = 0; i < moves.length; i++) {
//     for (let j = 0; j < moves[i].length; j++) {
//       const moveFrom = [i, j];
//       for (let k = 0; k < moves[i][j].length; k++) {
//         const move = {
//           from: moveFrom,
//           to: moves[i][j][k],
//         };
//         // each move should have it's own board so they aren't polluting each other
//         let boardForMove = copyJsObj(board);
//         boardForMove = this.makeAMove(boardForMove, castlingInfo, move);
//         const nextDepthMinimaxValue = minimax({
//           depth: depth - 1,
//           isMaximizingPlayer: !isMaximizingPlayer,
//           board: boardForMove,
//           whoseTurn: opponentsTurn(whoseTurn),
//         });
//         bestMove = isMaximizingPlayer
//           ? Math.max(bestMove, nextDepthMinimaxValue)
//           : Math.min(bestMove, nextDepthMinimaxValue);
//       }
//     }
//   }

//   return bestMove;
// }

// function evaluateBoard({ board, whoseTurn }) {
//   let piecePoints = {
//     p: 1,
//     n: 3,
//     b: 3,
//     r: 5,
//     q: 9,
//     k: 90,
//   };

//   let points = 0;
//   for (let i = 0; i < board.length; i++) {
//     for (let j = 0; j < board[i].length; j++) {
//       let piece = board[i][j];
//       let pointsInSquare = piecePoints[piece.charAt(1)] || 0;
//       if (whoseTurn !== piece.charAt(0)) {
//         pointsInSquare *= -1;
//       }
//       points += pointsInSquare;
//     }
//   }

//   return points;
// }

export { ChessEngine };
