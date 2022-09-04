import { copyJsObj } from "./helpers";

let metrics = {
  minimaxTotal: 0,
  minimixPerTurn: 0,
};

const settings = {
  cutExtremeLogicPathsShort: true,
  extremeLogicPathThreshold: 9,
  ignoreOtherPathsThreshold: 11,
};

function makeBestMove(game) {
  let newBoard = copyJsObj(game.board);
  console.time("calc best move");
  const bestMove = calculateBestMove(newBoard, game);
  console.timeEnd("calc best move");

  // make the best move here
  console.log("best move: ", bestMove);
  console.log("now i need to make that move on the board...");
  game.movePieceToNewSquare(bestMove.piece, bestMove.move);
}

function calculateBestMove(board, game) {
  const originalBoard = copyJsObj(board);
  const moves = game.getAllAvailableMoves();
  metrics.minimixPerTurn = 0;
  let bestMove = null;
  let bestValue = -999999;

  for (let i = 0; i < moves.length; i++) {
    for (let j = 0; j < moves[i].length; j++) {
      const piece = [i, j];
      for (let k = 0; k < moves[i][j].length; k++) {
        const move = moves[i][j][k];
        game.setBoard(originalBoard);
        game.movePieceToNewSquare(piece, move);

        // BUG: need to switch whose turn it is and get new moves for each iteration of this....
        const valueForMove = minimax({
          depth: 4,
          isMaximizingPlayer: true,
          game,
        });

        if (valueForMove > bestValue) {
          console.log("found a better move! ", move, valueForMove);
          bestValue = valueForMove;
          bestMove = {
            move,
            moveIndex: k,
            piece,
          };

          if (
            settings.cutExtremeLogicPathsShort &&
            bestValue > settings.ignoreOtherPathsThreshold
          ) {
            return bestMove;
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
  game.setBoard(originalBoard);
  return bestMove;
}

// recursively looks 'depth' deep and makes all of the moves to see which one is best
function minimax({ depth, isMaximizingPlayer, game }) {
  if (depth === 0) {
    const boardValue = evaluateBoard({
      board: game.board,
      whoseTurn: game.whoseTurn,
    });
    return boardValue;
  }

  if (settings.cutExtremeLogicPathsShort) {
    const boardValue = evaluateBoard({
      board: game.board,
      whoseTurn: game.whoseTurn,
    });
    if (Math.abs(boardValue) > settings.extremeLogicPathThreshold) {
      return boardValue;
    }
  }

  metrics.minimixPerTurn++;
  metrics.minimaxTotal++;
  const originalBoard = copyJsObj(game.board);
  const moves = game.getAllAvailableMoves();

  let bestMove = isMaximizingPlayer ? -99999 : 99999;
  for (let i = 0; i < moves.length; i++) {
    for (let j = 0; j < moves[i].length; j++) {
      const piece = [i, j];
      for (let k = 0; k < moves[i][j].length; k++) {
        const move = moves[i][j][k];
        game.setBoard(originalBoard);
        game.movePieceToNewSquare(piece, move);
        const nextDepthMinimaxValue = minimax({
          depth: depth - 1,
          isMaximizingPlayer: !isMaximizingPlayer,
          game,
        });
        bestMove = isMaximizingPlayer
          ? Math.max(bestMove, nextDepthMinimaxValue)
          : Math.min(bestMove, nextDepthMinimaxValue);
      }
    }
  }

  return bestMove;
}

function evaluateBoard({ board, whoseTurn }) {
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
  // console.log(board)
  // console.log(points);
  return points;
}

export { makeBestMove };
