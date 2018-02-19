import React, { Component } from 'react';
import './Home.css';

import Square from './Square/Square.js';
import Settings from './Settings/Settings.js';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playAs: 'White',
      player2: 'Computer',
      opponentAI: true,
      rotateBoard: 'No',
      boardRotation: 180,
      firstTurn: true,
      gameover: false,
      board: [
        ['wr', 'wh', 'wb', 'wk', 'wq', 'wb', 'wh', 'wr'],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['br', 'bh', 'bb', 'bk', 'bq', 'bb', 'bh', 'br'],
      ],
      whoseTurn: 'w',
      allPiecesMoves: [],
      pieceSelected: false,
      selectedPieceType: '',
      selectedPieceLocation: [],
      availableMoves: [],
      warningMessage: '',
      errorPieceLocations: [],
      showSettings: false,
      castling: {
        white: {
          kingHasMoved: false,
          leftRookHasMoved: false,
          rightRookHasMoved: false,
        },
        black: {
          kingHasMoved: false,
          leftRookHasMoved: false,
          rightRookHasMoved: false,
        }
      },
      whitePieces: 0,
      blackPieces: 0,
      stalemateMoveCount: 0,
    }

    this.startNewGame = this.startNewGame.bind(this);
    this.startTurn = this.startTurn.bind(this);
    this.endGame = this.endGame.bind(this);
    this.countEachPlayersPieces = this.countEachPlayersPieces.bind(this);
    this.getComputerMove = this.getComputerMove.bind(this);
    this.getAllAvailableMoves = this.getAllAvailableMoves.bind(this);
    this.selectPiece = this.selectPiece.bind(this);
    this.getAvailableMoves = this.getAvailableMoves.bind(this);
    this.limitMovesIfCheck = this.limitMovesIfCheck.bind(this);
    this.testForCheck = this.testForCheck.bind(this);
    this.movePieceToNewSquare = this.movePieceToNewSquare.bind(this);
    this.clickSquare = this.clickSquare.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.closeSettings = this.closeSettings.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
    this.updateState = this.updateState.bind(this);
    
  }

  componentDidMount(){
    this.startNewGame();
  }

  // Resets state and starts a new game
  startNewGame(){
    let rotate = this.state.playAs === 'White' ? 180 : 0;

    this.setState({
      gameover: false,
      boardRotation: rotate,
      firstTurn: true,
      board: [
        ['wr', 'wh', 'wb', 'wk', 'wq', 'wb', 'wh', 'wr'],
        ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
        ['br', 'bh', 'bb', 'bk', 'bq', 'bb', 'bh', 'br'],
      ],
      whoseTurn: 'w',
      allPiecesMoves: [],
      pieceSelected: false,
      selectedPieceType: '',
      selectedPieceLocation: [],
      availableMoves: [],
      warningMessage: '',
      errorPieceLocations: [],
      showSettings: false,
      castling: {
        white: {
          kingHasMoved: false,
          leftRookHasMoved: false,
          rightRookHasMoved: false,
        },
        black: {
          kingHasMoved: false,
          leftRookHasMoved: false,
          rightRookHasMoved: false,
        }
      },
    }, this.startTurn);
  }
  
  /* 
    Checks if there are available moves for the current player. If not, the game is over, so it
    checks if it's stalemate or checkmate. If there ARE available moves, it rotates the board if
    that is a setting that is enabled, then checks if the opponent is the computer. If so, it 
    triggers the function that makes a move for the computer
  */ 
  startTurn(){
    let allMoves = this.getAllAvailableMoves(null, null, true);
    let {board} = this.state;

    this.countEachPlayersPieces(board);

    if (!allMoves.hasAvailableMoves || this.state.stalemateMoveCount >= 50){
      this.endGame(board);
    }
    else{
      // flip the board around on each turn if that setting is selected and it's not the beginning of the game
      let rotate = this.state.boardRotation;
      if (this.state.rotateBoard === 'Yes' && !this.state.firstTurn){
        rotate = rotate === 0 ? 180 : 0;
      }
      
      // Set all of the available moves on state, and rotate board if necessary
      this.setState({
        allPiecesMoves: allMoves,
        boardRotation: rotate
      }, () => {
        // If the opponent is the computer and it's the computer's turn, get the computer's move here
        let player1 = this.state.playAs === 'White' ? 'w' : 'b';
        if (this.state.opponentAI && player1 !== this.state.whoseTurn){
          this.getComputerMove();
        }
      })
    }

  }

  // ends the game
  endGame(board){
    // Check if it's stalemate or checkmate
    let endGameMessage;
    let kingLocation = this.getKingLocation(this.state.whoseTurn);
    let isInCheck = this.testForCheck(board, kingLocation);

    if (isInCheck){
      let whoWon = this.state.whoseTurn === 'w' ? 'Black' : 'White';
      endGameMessage = 'Checkmate!!! ' + whoWon + ' wins!';
    }else{
      endGameMessage = 'StaleMate! It\'s a tie game';
    }

    this.setState({
      gameover: true,
      warningMessage: endGameMessage,
    })
  }

  // counts how many pieces each player has left and sets it on state
  countEachPlayersPieces(board){
    let whitePieces = 0;
    let blackPieces = 0;

    // Check how many pieces each player has left;
    for (let row = 0; row < 8; row++){
      for (let col = 0; col < 8; col++){
        if (board[row][col] && board[row][col].charAt(0) === 'w'){
          whitePieces++;
        }
        else if (board[row][col] && board[row][col].charAt(0) === 'b'){
          blackPieces++;
        }
      }
    }

    this.setState({whitePieces, blackPieces})
  }

  // Makes a move for the computer player
  getComputerMove(){
    let moves = this.state.allPiecesMoves.moves;
    let {board} = this.state;
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
    let newTurn = this.state.whoseTurn === 'b' ? 'w' : 'b';

    // Wait for a short time, then make the random move and start the user's turn again
    setTimeout(() => {
      this.setState({
        board: board,
        pieceSelected: false,
        selectedPieceType: '',
        selectedPieceLocation: [],
        board: board,
        whoseTurn: newTurn,
        availableMoves: [],
        firstTurn: false,
      }, () => {
        this.startTurn()
      }) 
    }, 250);

  }

  // returns the location of the king (for whatever color you pass in);
  getKingLocation(color){
    let {board} = this.state;

    for (let i = 0; i < 8; i++){
      for (let j = 0; j < 8; j++){
        if (board[i][j].charAt(1) === 'k' && board[i][j].charAt(0) === color){
          return [i, j];
        }
      }
    }

  }

  // Gets all of the available moves for a player
  getAllAvailableMoves(whoseTurn, board, limitToLegalMoves){
    let arr = [];
    whoseTurn = whoseTurn || this.state.whoseTurn;
    board = board || this.state.board;
    let hasAvailableMoves = false;

    //goes through the whole board and creates a blank array for each board spot
    for (let i = 0; i <= 7; i++){
      arr.push([]);
      for (let j = 0; j <= 7; j++){
        arr[i][j] = [];
        // if and only if the piece at that spot is the color of the person whose turn it is, replace the blank array of moves with a valid array of moves for that piece.
        if (board[i][j] && board[i][j].charAt(0) === whoseTurn){
          let moves = this.getAvailableMoves(board, board[i][j], [i, j], limitToLegalMoves);
          arr[i][j] = moves;
          if (moves.length > 0){
            hasAvailableMoves = true;
          }
        }
      }
    }

    // **returns an object, not an array**
    return {
      hasAvailableMoves: hasAvailableMoves,
      moves: arr,
    }
  }

  // Select a piece
  selectPiece(i, j) {
    
    let availableMoves = this.state.allPiecesMoves.moves[i][j];
    this.setState({
      pieceSelected: true,
      selectedPieceType: this.state.board[i][j],
      selectedPieceLocation: [i, j],
      warningMessage: '',
      errorPieceLocations: [],
      availableMoves: availableMoves,
    }) 

  }

  // Gets all available moves for the currently selected piece. This is where most of the logic/rules happen for piece movement
  getAvailableMoves(board, selectedPieceType, selectedPieceLocation, limitToLegalMoves) {
    // let board = this.state.board;
    // let { selectedPieceType, selectedPieceLocation } = this.state;
    let availableMoves = [];

    let i = selectedPieceLocation[0];
    let j = selectedPieceLocation[1];

    // Checks if a move is valid, and if continueStraightLine is true and nextI/nextJ are passed in, will 
    // continue to check in a straight line to find all valid moves
    function checkValidMove(i, j, continueStraightLine, nextI, nextJ){
      // makes sure we are checking a spot that exists on the board (especially useful for the continueStraightLine portion)
      if (i <= 7 && i >= 0 && j <= 7 && j >= 0){
        // if it's an empty square, or an enemy piece, add it as a valid move
        if (board[i][j] === '' || board[i][j].charAt(0) !== selectedPieceType.charAt(0)){
          availableMoves.push([i, j]);
        }
        // If requested, continue checking in a straight line until we find a space that isn't empty (the line 
        // of valid moves ends when we find another chess piece)
        if (continueStraightLine && board[i][j] === ''){
          let newNextI = (nextI - i) + nextI;
          let newNextJ = (nextJ - j) + nextJ;
          checkValidMove(nextI, nextJ, true, newNextI, newNextJ);
        }
      }
    }

    // Pawns have special movement patterns like au passant and can only kill diagonally, so I won't use the getAvailableMoves() function
    // Also, there's no need to watch for the end of the board, because on the last row it becomes something else and will have new movement rules
    // White Pawn
    if (selectedPieceType === 'wp') {
      // empty space in front
      if (board[i+1][j] === ''){
        availableMoves.push([i + 1, j]);
      }
      // First move allow 2 spaces in front if both are empty
      if (selectedPieceLocation[0] === 1 && !board[i+1][j] && !board[i+2][j]) {
        availableMoves.push([i + 2, j]);
      } 
      // Allow diagonal moves if there's an enemy there
      if (board[i+1][j+1] && board[i+1][j+1].charAt(0) !== selectedPieceType.charAt(0)){
        availableMoves.push([i+1, j+1]);
      }
      if (board[i+1][j-1] && board[i+1][j-1].charAt(0) !== selectedPieceType.charAt(0)){
        availableMoves.push([i+1, j-1]);
      }
    } 
    // Black Pawn
    else if (selectedPieceType === 'bp') {
      // empty space in front
      if (!board[i-1][j]){
        availableMoves.push([i - 1, j]);
      }
      // First move allow 2 spaces in front if both are empty
      if (selectedPieceLocation[0] === 6 && !board[i-1][j] && !board[i-2][j]) {
        availableMoves.push([i - 2, j]);
      }
      // Allow diagonal moves if there's an enemy there
      if (board[i-1][j+1] && board[i-1][j+1].charAt(0) !== selectedPieceType.charAt(0)){
        availableMoves.push([i-1, j+1]);
      }
      if (board[i-1][j-1] && board[i-1][j-1].charAt(0) !== selectedPieceType.charAt(0)){
        availableMoves.push([i-1, j-1]);
      }
    }
    // Horse
    else if (selectedPieceType.charAt(1) === 'h'){
      checkValidMove(i+2, j+1, false, null, null);
      checkValidMove(i+2, j-1, false, null, null);
      checkValidMove(i-2, j+1, false, null, null);
      checkValidMove(i-2, j-1, false, null, null);
      checkValidMove(i+1, j+2, false, null, null);
      checkValidMove(i-1, j+2, false, null, null);
      checkValidMove(i+1, j-2, false, null, null);
      checkValidMove(i-1, j-2, false, null, null);
    }
    // Rook
    else if (selectedPieceType.charAt(1) === 'r'){
      // up down left right
      checkValidMove(i+1, j, true, i+2, j);
      checkValidMove(i-1, j, true, i-2, j);
      checkValidMove(i, j+1, true, i, j+2);
      checkValidMove(i, j-1, true, i, j-2);
    }
    // Bishop
    else if (selectedPieceType.charAt(1) === 'b'){
      // diagonals
      checkValidMove(i-1, j-1, true, i-2, j-2);
      checkValidMove(i+1, j+1, true, i+2, j+2);
      checkValidMove(i-1, j+1, true, i-2, j+2);
      checkValidMove(i+1, j-1, true, i+2, j-2);
    }
    // Queen
    else if (selectedPieceType.charAt(1) === 'q'){
      // up down left right
      checkValidMove(i+1, j, true, i+2, j);
      checkValidMove(i-1, j, true, i-2, j);
      checkValidMove(i, j+1, true, i, j+2);
      checkValidMove(i, j-1, true, i, j-2);
      // diagonals
      checkValidMove(i-1, j-1, true, i-2, j-2);
      checkValidMove(i+1, j+1, true, i+2, j+2);
      checkValidMove(i-1, j+1, true, i-2, j+2);
      checkValidMove(i+1, j-1, true, i+2, j-2);
    }
    // King
    else if (selectedPieceType.charAt(1) === 'k'){
      // up down left right
      checkValidMove(i+1, j, false, null, null);
      checkValidMove(i-1, j, false, null, null);
      checkValidMove(i, j+1, false, null, null);
      checkValidMove(i, j-1, false, null, null);
      // diagonals
      checkValidMove(i-1, j-1, false, null, null);
      checkValidMove(i+1, j+1, false, null, null);
      checkValidMove(i-1, j+1, false, null, null);
      checkValidMove(i+1, j-1, false, null, null);
      // castling
      let color = selectedPieceType.charAt(0) === 'w' ? 'white' : 'black';
      // make sure the king hasn't moved
      if (!this.state.castling[color].kingHasMoved){
        // make sure the rook hasn't moved and there's no one in the way
        if (!this.state.castling[color].leftRookHasMoved 
          && board[i][j+1] === ''
          && board[i][j+2] === ''
          && board[i][j+3] === ''){
            availableMoves.push([i, j+2]);
        }
        if (!this.state.castling[color].rightRookHasMoved
          && board[i][j-1] === ''
          && board[i][j-2] === ''){
            availableMoves.push([i, j-2]);
        }
      }
    }

    // Limit the moves for this piece to avoid illegal moves that result in your own check
    if (limitToLegalMoves){
      availableMoves = this.limitMovesIfCheck(availableMoves, [i, j]);
    }
    return availableMoves;
  }

  // Takes the list of available moves for a piece, finds any of those that result in your own king being in check,
  // and removes them from the available list since you can't place yourself in check
  limitMovesIfCheck(moves, pieceLocation){
    let board = this.state.board;
    let currentPlayerColor = this.state.whoseTurn;
    let kingLocation = this.getKingLocation(currentPlayerColor);
    let pi = pieceLocation[0];
    let pj = pieceLocation[1];
    let piece = board[pi][pj];

    // for each available move in the array, move the piece there, then check for check. 
    // If we're in check after that move, then it's not a legal move, so remove it from the array.
    for (let i = moves.length - 1; i >= 0; i--){
      let testBoard = JSON.parse(JSON.stringify(board));
      let mi = moves[i][0];
      let mj = moves[i][1];
      testBoard[mi][mj] = piece;
      testBoard[pi][pj] = '';
      let check = false;

      // Special rules for the king's moves
      if (piece.charAt(1) === 'k'){
        // update the king location before testing for check
        kingLocation = [mi, mj];
        check = this.testForCheck(testBoard, kingLocation);

        if (!check){
          // If the spot we're moving to does not put us in check, we have
          // some additional things to check for 'castling' situations
          if (mj === pj - 2 || mj === pj + 2){
            // test current location (can't castle when in check)
            if (this.testForCheck(board, pieceLocation)){
              check = true;
            }
            // one space away (can't castle through check) tempJ will be one space away from king's current location
            console.log('testing interim location');
            console.log([pi, pj])
            let interimBoard = JSON.parse(JSON.stringify(board));
            let tempJ = mj > pj ? pj + 1 : pj - 1;
            interimBoard[pi][tempJ] = piece;
            interimBoard[pi][pj] = '';
            console.log([pi, tempJ]);
            if (this.testForCheck(interimBoard, [pi, tempJ])){
              console.log('cannot castle through check');
              check = true;
            }
          }
        }
      }
      // if we aren't moving the king, still test for check
      else{
        check = this.testForCheck(testBoard, kingLocation);
      }

      if (check){
        moves.splice(i, 1);
      }
    }
    
    return moves;

  }

  // Based on a specific board setup, tests if the player whose turn it is is in check.
  testForCheck(board, kingLocation){
    let opponentsTurn = this.state.whoseTurn === 'w' ? 'b' : 'w';
    let opponentsMoves = this.getAllAvailableMoves(opponentsTurn, board, null).moves;
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
  }

  // Moves the piece to a new location AND starts the new person's turn
  movePieceToNewSquare(i, j) {
    let board = JSON.parse(JSON.stringify(this.state.board));
    let oldLocation = this.state.selectedPieceLocation;
    let newTurn = this.state.whoseTurn === 'w' ? 'b' : 'w';
    let pieceType = this.state.selectedPieceType;

    // If a pawn advanced to the end of the board, allow a new piece to be chosen as replacement
    if ( (i === 0 || i === 7) && pieceType.charAt(1) === 'p'){
      pieceType = pieceType.substring(0,1) + 'q';
    }

    // If they "castle" move their king AND their castle simultaneously
    if (pieceType.charAt(1) === 'k' && j === oldLocation[1] - 2){
      board[oldLocation[0]][oldLocation[1]-1] = pieceType.substring(0, 1) + 'r';
      board[oldLocation[0]][oldLocation[1]-3] = '';
    }
    if (pieceType.charAt(1) === 'k' && j === oldLocation[1] + 2){
      board[oldLocation[0]][oldLocation[1]+1] = pieceType.substring(0, 1) + 'r';
      board[oldLocation[0]][oldLocation[1]+4] = '';
    }

    board[i][j] = pieceType;
    board[oldLocation[0]][oldLocation[1]] = '';

    // if either player has only their king left, update the move count
    let stalemateMoveCount = this.state.stalemateMoveCount
    if (this.state.blackPieces === 1 || this.state.whitePieces === 1){
      stalemateMoveCount ++;
    }

    this.setState({
      pieceSelected: false,
      selectedPieceType: '',
      selectedPieceLocation: [],
      board: board,
      whoseTurn: newTurn,
      availableMoves: [],
      firstTurn: false,
      stalemateMoveCount: stalemateMoveCount,
    }, () => {

      // If they move their king or a castle, keep track of that to limit the ability to 'castle' in the future
      let castling = this.state.castling;
      let color = pieceType.charAt(0) === 'b' ? 'black' : 'white';

      if (pieceType.charAt(1) === 'k'){
        castling[color].kingHasMoved = true;
      }
      if (pieceType.charAt(1) === 'r'){
        if (oldLocation[1] === 0){
          castling[color].rightRookHasMoved = true;
        }
        if (oldLocation[1] === 7){
          castling[color].leftRookHasMoved = true;
        }
      }

      // update the castling object, then start the new turn
      this.setState({castling}, this.startTurn);

    }) 
  }

  // Determines what happens when you click on a square on the board
  clickSquare(i, j) {
    // If the game is over, nothing happens
    if (this.state.gameover){
      return;
    }

    // If the computer is making a move, nothing happens
    let player1 = this.state.playAs === 'White' ? 'w' : 'b';
    if (this.state.opponentAI && player1 !== this.state.whoseTurn){
      return;
    }

    let {board, availableMoves} = this.state;

    // if there's no piece selected and the user clicked on a piece of their own color, set that piece to the selectedPiece, and get the available moves for that piece
    if (!this.state.pieceSelected && board[i][j] && board[i][j].charAt(0) === this.state.whoseTurn) {
      this.selectPiece(i, j);
    }

    // If the user clicks on the piece that is already the active piece, unactivate it
    else if (this.state.pieceSelected && this.state.selectedPieceLocation[0] === i && this.state.selectedPieceLocation[1] === j){
      this.setState({
        pieceSelected: false,
        selectedPieceType: '',
        selectedPieceLocation: [], 
        availableMoves: [],
      })
    }

    // if there IS a piece selected, but the user clicks on a different piece of their own color, set the selected piece to the new selection
    else if (this.state.pieceSelected && board[i][j].charAt(0) === this.state.selectedPieceType.charAt(0)) {
      this.selectPiece(i, j);
    }
    
    // If there is a piece selected and they didn't click on another of their own pieces
    else if (this.state.pieceSelected){
      // Check to see if the square the user clicked on is a valid move for the piece that was selected. If so, move it to that new spot.
      for (let index = 0; index < this.state.availableMoves.length; index++){
        if (availableMoves[index][0] === i && availableMoves[index][1] === j){
          this.movePieceToNewSquare(i, j);
        }
      }
    }
  }

  // opens/closes the settings modal, opposite of what it is now
  toggleSettings(){
    this.setState({
      showSettings: !this.state.showSettings
    })
  }

  // closes the settings modal
  closeSettings(){
    this.setState({
      showSettings: false
    })
  }

  // this is passed to settings component as a prop so that it can update state on Home. If the
  // settings modal updates player2, updates the opponentAI setting as well
  updateState(e, target){
    this.setState({
      [target]: e.target.value,
    })

    // If user is updating the player2 setting, update the opponentAI setting as well
    if (target === 'player2'){
      let opponentAI = (e.target.value === 'Computer') ? true : false;
      this.setState({opponentAI});
    }
  }

  renderBoard() {
    let rotate = 'rotate(' + this.state.boardRotation + 'deg)'

    return this.state.board.map((row, i) => {
      var squares = row.map((item, j) => {
        return <Square key={j}
          rotate={rotate} 
          piece={item}
          handleClick={this.clickSquare}
          location={[i, j]}
          selectedPieceLocation={this.state.selectedPieceLocation}
          availableMoves={this.state.availableMoves}
          errorPieceLocations={this.state.errorPieceLocations} />
      })
      return <div className='row' key={i} >{squares}</div>;
    })
  }

  render() {
    let rotate = 'rotate(' + this.state.boardRotation + 'deg)'

    return (
      <div className="home">

        <p className='turn'>{this.state.whoseTurn === 'w' ? 'White\'s turn' : "Black's turn"}</p>
        <p className='warning' >{this.state.warningMessage}</p>
        <button onClick={this.toggleSettings} className='settings_toggle' >New Game</button>

        <div className='board' style={{transform: rotate}}>
          {this.renderBoard()}
        </div>

        { this.state.showSettings ? 
            <Settings 
            closeSettings={this.closeSettings} 
            startNewGame={this.startNewGame} 
            updateState={this.updateState}
            playAs={this.state.playAs}
            player2={this.state.player2}
            rotateBoard={this.state.rotateBoard} />
          : null
        }

      </div>
    );
  }
}

export default Home;