import React, { Component } from 'react';
import './Home.css';

import Square from './Square/Square.js';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      pieceSelected: false,
      selectedPieceType: '',
      selectedPieceLocation: [],
      availableMoves: [],
    }

    this.selectPiece = this.selectPiece.bind(this);
    this.getAvailableMoves = this.getAvailableMoves.bind(this);
    this.movePieceToEmptySquare = this.movePieceToEmptySquare.bind(this);
    this.clickSquare = this.clickSquare.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
  }

  // Select a piece then gets the available moves for that piece
  selectPiece(i, j) {
    this.setState({
      pieceSelected: true,
      selectedPieceType: this.state.board[i][j],
      selectedPieceLocation: [i, j]
    }, this.getAvailableMoves)
  }

  // Gets all available moves for the currently selected piece. This is where most of the logic/rules happen for piece movement
  getAvailableMoves() {
    let board = this.state.board;
    let { selectedPieceType, selectedPieceLocation } = this.state;
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

    this.setState({ availableMoves })
  }

  // Moves the piece to a new location
  movePieceToEmptySquare(i, j) {
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
    })
  }

  // Determines what happens when you click on a square on the board
  clickSquare(i, j) {
    let {board, availableMoves} = this.state;
    // if there's no piece selected and the user clicked on an a piece of their own color
    if (!this.state.pieceSelected && board[i][j] && board[i][j].charAt(0) === this.state.whoseTurn) {
      this.selectPiece(i, j);
    }
    // if there IS a piece selected, but the user clicks on a different piece of their own color, set the selected piece to the new selection
    else if (this.state.pieceSelected && board[i][j].charAt(0) === this.state.selectedPieceType.charAt(0)) {
      this.selectPiece(i, j);
    }
    // If there is a piece selected
    else if (this.state.pieceSelected){
      // Check to see if the square the user clicked on is a valid move for the piece that was selected. If so, move it to that new spot.
      for (let index = 0; index < this.state.availableMoves.length; index++){
        if (availableMoves[index][0] === i && availableMoves[index][1] === j){
          this.movePieceToEmptySquare(i, j);
        }
      }
    }
  }

  renderBoard() {
    return this.state.board.map((row, i) => {
      var squares = row.map((item, j) => {
        return <Square key={j}
          piece={item}
          handleClick={this.clickSquare}
          location={[i, j]}
          selectedPieceLocation={this.state.selectedPieceLocation}
          availableMoves={this.state.availableMoves} />
      })
      return <div className='row' key={i} >{squares}</div>;
    })
  }

  render() {
    return (
      <div className="home">

        <p className='turn'>{this.state.whoseTurn === 'w' ? 'White\'s turn' : "Black's turn"}</p>
        <div className='board'>
          {this.renderBoard()}
        </div>

      </div>
    );
  }
}


export default Home;