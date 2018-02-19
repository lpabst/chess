import React, { Component } from 'react';
import './Home.css';

import Square from './Square/Square.js';
import Settings from './Settings/Settings.js';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playAs: 'White',
      player2: 'Human',
      boardRotation: 180,
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
      showSettings: true,
    }

    this.startNewGame = this.startNewGame.bind(this);
    this.startTurn = this.startTurn.bind(this);
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
    let rotate = this.state.playAs === 'White' ? 0 : 180;

    this.setState({
      gameover: false,
      boardRotation: rotate,
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
    }, this.startTurn)
  }
  
  startTurn(){
    let allMoves = this.getAllAvailableMoves(null, null, true);

    if (!allMoves.hasAvailableMoves){

      // Check if it's stalemate or checkmate
      let endGameMessage;
      let {board} = this.state;
      let kingLocation = this.getKingLocation(this.state.whoseTurn);
      let isInCheck = this.testForCheck(board, kingLocation);

      if (isInCheck){
        let whoWon = this.state.whoseTurn === 'w' ? 'Black' : 'White';
        endGameMessage = 'Checkmate!!! ' + whoWon + ' wins!';
      }else{
        endGameMessage = 'StaleMate! It\'s a tie';
      }

      this.setState({
        gameover: true,
        warningMessage: endGameMessage,
      })

    }else{
      // flip the board around on each turn
      let rotate = this.state.boardRotation === 180 ? 0 : 180;

      // allow the user to click a piece and make a move
      this.setState({
        allPiecesMoves: allMoves,
        boardRotation: rotate
      })
    }

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

    // for each available move in the array, move the piece there, then check for check. 
    // If we're in check after that move, then it's not a legal move, so remove it from the array.
    for (let i = moves.length - 1; i >= 0; i--){
      let testBoard = JSON.parse(JSON.stringify(board));
      let mi = moves[i][0];
      let mj = moves[i][1];
      let pi = pieceLocation[0];
      let pj = pieceLocation[1];
      let piece = testBoard[pi][pj];
      testBoard[mi][mj] = piece;
      testBoard[pi][pj] = '';

      // if they moved the king, make sure to update the king's location before testing for check
      if (piece.charAt(1) === 'k'){
        kingLocation = [mi, mj];
      }

      let check = this.testForCheck(testBoard, kingLocation);
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
    board[i][j] = this.state.selectedPieceType;
    board[oldLocation[0]][oldLocation[1]] = '';

    this.setState({
      pieceSelected: false,
      selectedPieceType: '',
      selectedPieceLocation: [],
      board: board,
      whoseTurn: newTurn,
      availableMoves: [],
    }, this.startTurn)
  }

  // Determines what happens when you click on a square on the board
  clickSquare(i, j) {
    // if the game is over, nothing happens
    if (this.state.gameover){
      return;
    }

    let {board, availableMoves} = this.state;
    // if there's no piece selected and the user clicked on a piece of their own color, set that piece to the selectedPiece, and get the available moves for that piece
    if (!this.state.pieceSelected && board[i][j] && board[i][j].charAt(0) === this.state.whoseTurn) {
      this.selectPiece(i, j);
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

  toggleSettings(){
    this.setState({
      showSettings: !this.state.showSettings
    })
  }

  closeSettings(){
    console.log('closing settings');
    this.setState({
      showSettings: false
    }, console.log('done'))
    console.log('sync done');
  }

  updateState(e, target){
    this.setState({
      [target]: e.target.value
    })
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
            player2={this.state.player2} />
          : null
        }

      </div>
    );
  }
}


export default Home;



/*
    // Checks the location of the current player's king against available moves for each opponent piece 
    let restulsInCheck = false;
    let offendingPieces = [];
    let availableMoves = [];

    for (let i = 0; i < 8; i++){
      for (let j = 0; j < 8; j++){
        // For every sqaure, if it's not a king, and it's an opponent piece, get its available moves, and see if any of them are the same
        // as the current player's king's position. If so, mark that as an 'offending piece' and set resultsInCheck to true
        if (board[i][j] !== '' && board[i][j].charAt(0) !== currentPlayerColor && board[i][j] !== 'wk' && board[i][j] !== 'bk'){
          let availableMovesForOpponentPiece = this.getAvailableMoves(board, board[i][j], [i, j]);
          for (let k = 0; k < availableMovesForOpponentPiece.length; k++){
            // go through the entire array of available moves for each opponent piece and check against current player's king's location
            if (availableMovesForOpponentPiece[k][0] === kingLocation[0] && availableMovesForOpponentPiece[k][1] === kingLocation[1]){
              restulsInCheck = true;
              offendingPieces.push([i, j]);
              console.log(offendingPieces)
            }
          }
        }
      }
    }

    // By now we know which pieces would put the king in check if the currently selected piece were to move. If there's
    // only one offending piece, and our currently selected piece can kill it, that is the only available move for our
    // currently selected piece. If there are more than one offending pieces, no available moves exist for our currently
    // selected piece!
    if (restulsInCheck){
      console.log(offendingPieces);
      if (offendingPieces.length === 1){
        for (let m = 0; m < this.state.availableMoves.length; m++){
          if (this.state.availableMoves[m][0] === offendingPieces[0][0] && this.state.availableMoves[m][1] === offendingPieces[0][1]){
            console.log(availableMoves)
            availableMoves = offendingPieces[0];
            console.log(availableMoves)
          }
        }
      }else{
        console.log(offendingPieces.length)
      }

      this.setState({
        availableMoves: availableMoves,
        warningMessage: 'Moving this piece would put you in check',
        errorPieceLocations: offendingPieces
      })

    }
*/