import { copyJsObj } from "./helpers";

function Game(board = null) {
  this.board = board || new Board();
  this.whoseTurn = "w";
  this.firstTurn = true;
  this.stalemateMoveCount = 0;
  this.moveHistory = [];
  this.whitePiecesCount = 16;
  this.blackPiecesCount = 16;
  this.castling = {
    w: {
      kingHasMoved: false,
      leftRookHasMoved: false,
      rightRookHasMoved: false,
    },
    b: {
      kingHasMoved: false,
      leftRookHasMoved: false,
      rightRookHasMoved: false,
    },
  };

  // get the row/col location of the king for whatever color is passed in
  this.getKingLocation = function (color) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (
          this.board[i][j].charAt(1) === "k" &&
          this.board[i][j].charAt(0) === color
        ) {
          return [i, j];
        }
      }
    }
  };

  // get all available moves for the whole board, for whoever's turn it is
  this.getAllAvailableMoves = function (
    board = this.board,
    whoseTurn = this.whoseTurn,
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
      if (!this.castling[color].kingHasMoved) {
        // make sure the rook hasn't moved and there's no one in the way
        if (
          !this.castling[color].leftRookHasMoved &&
          board[i][j + 1] === "" &&
          board[i][j + 2] === "" &&
          board[i][j + 3] === ""
        ) {
          availableMoves.push([i, j + 2]);
        }
        if (
          !this.castling[color].rightRookHasMoved &&
          board[i][j - 1] === "" &&
          board[i][j - 2] === ""
        ) {
          availableMoves.push([i, j - 2]);
        }
      }
    }

    // Limit the moves for this piece to avoid illegal moves that result in your own check
    if (limitToLegalMoves) {
      availableMoves = this.limitPieceMovesDueToCheck(availableMoves, [i, j]);
    }
    return availableMoves;
  };

  // Takes the list of available moves for a piece, finds any of those that result in your own king being in check, and removes them from the available list since you can't place yourself in check
  this.limitPieceMovesDueToCheck = function (movesForPiece, pieceLocation) {
    let limitedMovesForPiece = [];
    let board = this.board;
    let kingLocation = this.getKingLocation(this.whoseTurn);
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
        check = this.testForCheck(testBoard, kingLocation);
        if (!check) {
          limitedMovesForPiece.push(move);
        }
        continue;
      }

      // Special rules for the king's moves: update the king location before testing for check
      kingLocation = [mi, mj];
      check = this.testForCheck(testBoard, kingLocation);

      if (!check) {
        // If the spot we're moving to does not put us in check, we have some additional things to check for 'castling' situations
        if (mj === pj - 2 || mj === pj + 2) {
          // test current location (can't castle when in check)
          if (this.testForCheck(board, pieceLocation)) {
            check = true;
          }
          // one space away (can't castle through check) tempJ will be one space away from king's current location
          let interimBoard = copyJsObj(board);
          let tempJ = mj > pj ? pj + 1 : pj - 1;
          interimBoard[pi][tempJ] = piece;
          interimBoard[pi][pj] = "";
          if (this.testForCheck(interimBoard, [pi, tempJ])) {
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
  this.testForCheck = function (board, kingLocation) {
    let opponentsTurn = this.whoseTurn === "w" ? "b" : "w";
    let opponentsMoves = this.getAllAvailableMoves(
      board,
      opponentsTurn,
      null
    ).moves;
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

  // Moves the piece to a new location AND starts the new person's turn
  this.movePieceToNewSquare = function (
    oldLocation,
    newLocation,
    addMoveToHistory = true
  ) {
    let piece = this.board[oldLocation[0]][oldLocation[1]];
    const pieceColor = piece.charAt(0);
    const pieceType = piece.charAt(1);

    // If a pawn advanced to the end of the board, allow a new piece to be chosen as replacement
    if ((newLocation[0] === 0 || newLocation[0] === 7) && pieceType === "p") {
      piece = piece.substring(0, 1) + "q";
    }

    // If they "castle" move their king AND their castle simultaneously
    if (pieceType === "k" && newLocation[1] === oldLocation[1] - 2) {
      this.board[oldLocation[0]][oldLocation[1] - 1] =
        piece.substring(0, 1) + "r";
      this.board[oldLocation[0]][oldLocation[1] - 3] = "";
    }
    if (pieceType === "k" && newLocation[1] === oldLocation[1] + 2) {
      this.board[oldLocation[0]][oldLocation[1] + 1] =
        piece.substring(0, 1) + "r";
      this.board[oldLocation[0]][oldLocation[1] + 4] = "";
    }

    this.board[newLocation[0]][newLocation[1]] = piece;
    this.board[oldLocation[0]][oldLocation[1]] = "";

    // track movement of kings and rooks to limit castling
    if (pieceType === "k") {
      this.castling[pieceColor].kingHasMoved = true;
    }
    if (pieceType === "r") {
      if (oldLocation[1] === 0) {
        this.castling[pieceColor].rightRookHasMoved = true;
      }
      if (oldLocation[1] === 7) {
        this.castling[pieceColor].leftRookHasMoved = true;
      }
    }

    // if either player has only their king left, update the move count
    if (this.blackPiecesCount === 1 || this.whitePiecesCount === 1) {
      this.stalemateMoveCount++;
    }

    this.toggleWhoseTurnItIs();
    this.countEachPlayersPieces();
    if (addMoveToHistory) {
      this.moveHistory.push({
        pieceColor,
        pieceType,
        oldLocation,
        newLocation,
      });
    }
  };

  this.toggleWhoseTurnItIs = function () {
    this.whoseTurn = this.whoseTurn === "w" ? "b" : "w";
  };

  // counts how many pieces each player has left and sets it on state
  this.countEachPlayersPieces = function () {
    this.whitePiecesCount = 0;
    this.blackPiecesCount = 0;

    // Check how many pieces each player has left;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] && this.board[row][col].charAt(0) === "w") {
          this.whitePiecesCount++;
        } else if (
          this.board[row][col] &&
          this.board[row][col].charAt(0) === "b"
        ) {
          this.blackPiecesCount++;
        }
      }
    }
  };

  // set the board to a specific configuration
  this.setBoard = function (board) {
    this.board = board;
  };

  // undo last move
  this.undo = function () {
    const lastMove = this.moveHistory.pop();
    this.movePieceToNewSquare(
      lastMove.newLocation,
      lastMove.oldLocation,
      false
    );
  };

  // Builds the chess FEN string
  this.getFen = function () {
    let str = "";
    for (let i = 0; i < 8; i++) {
      let emptyCount = 0;
      for (let j = 0; j < 8; j++) {
        if (this.board[i][j]) {
          let piece = this.board[i][j].replace(/h/, "n");
          piece =
            piece.charAt(0) === "w"
              ? piece.substring(1).toUpperCase()
              : piece.substring(1).toLowerCase();
          if (emptyCount > 0) {
            piece = emptyCount + piece;
            emptyCount = 0;
          }
          str += piece;
        } else {
          emptyCount++;
        }
      }

      str += emptyCount > 0 ? emptyCount : "";

      if (i < 7) {
        str += "/";
      }
    }

    str += " " + this.whoseTurn + " - - 3 3";
    return str;
  };
}

function Board() {
  return [
    ["wr", "wh", "wb", "wk", "wq", "wb", "wh", "wr"],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    ["br", "bh", "bb", "bk", "bq", "bb", "bh", "br"],
  ];
}

export { Game };
