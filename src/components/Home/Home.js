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

  selectPiece(i, j) {
    this.setState({
      pieceSelected: true,
      selectedPieceType: this.state.board[i][j],
      selectedPieceLocation: [i, j]
    }, this.getAvailableMoves)
  }

  getAvailableMoves() {
    let board = this.state.board;
    let { selectedPieceType, selectedPieceLocation } = this.state;
    let availableMoves = [];

    let i = selectedPieceLocation[0];
    let j = selectedPieceLocation[1];

    // White Pawn (no need to watch for the end of the board, because on the last row it becomes something else and will have new movement rules)
    if (selectedPieceType === 'wp') {
      if (!board[i+1][j]){
        availableMoves.push([i + 1, j]);
      }
      // First move allow 2 spaces in front
      if (selectedPieceLocation[0] === 1 && !board[i+1][j] && !board[i+2][j]) {
        availableMoves.push([i + 2, j]);
      } 
    } 
    // Black Pawn
    else if (selectedPieceType === 'bp') {
      if (!board[i-1][j]){
        availableMoves.push([i - 1, j]);
      }
      // First move allow 2 spaces in front
      if (selectedPieceLocation[0] === 6 && !board[i-1][j] && !board[i-2][j]) {
        availableMoves.push([i - 2, j]);
      }
    }
    // Rook
    else if (selectedPieceType.charAt(1) === 'r'){
      j = selectedPieceLocation[1];

      for (i = selectedPieceLocation[0] + 1; i <= 7 && i >= 0; i++){
        if (!board[i][j]){
          // if it's an empty space, add it as an available location
          availableMoves.push([i, j]);
        }else{
          // otherwise, this is as far as we can go, so set i = board.length+1 and only add this 
          // square as an available move it it's an opponent's piece
          if (board[i][j].charAt(0) !== selectedPieceType.charAt(0)){
            availableMoves.push([i, j]);
          }
          i = board.length + 1;
        } 
      }
      for (i = selectedPieceLocation[0] - 1; i >= 0 && i <= 7; i--){
        if (!board[i][j]){
          // if it's an empty space, add it as an available location
          availableMoves.push([i, j]);
        }else{
          // otherwise, this is as far as we can go, so set i = board.length+1 and only add this square as an available move it it's an opponent's piece
          if (board[i][j].charAt(0) !== selectedPieceType.charAt(0)){
            availableMoves.push([i, j]);
          }
          i = board.length + 1;
        } 
      }

      i = selectedPieceLocation[0];

      for (j = selectedPieceLocation[1] + 1; j <= 7 && j >= 0; j++){
        if (!board[i][j]){
          // if it's an empty space, add it as an available location
          availableMoves.push([i, j]);
        }else{
          // otherwise, this is as far as we can go, so set i = board.length+1 and only add this 
          // square as an available move it it's an opponent's piece
          if (board[i][j].charAt(0) !== selectedPieceType.charAt(0)){
            availableMoves.push([i, j]);
          }
          j = board.length + 1;
        } 
      }
      for (j = selectedPieceLocation[1] - 1; j >= 0 && j <= 7; j--){
        if (!board[i][j]){
          // if it's an empty space, add it as an available location
          availableMoves.push([i, j]);
        }else{
          // otherwise, this is as far as we can go, so set i = board.length+1 and only add this square as an available move it it's an opponent's piece
          if (board[i][j].charAt(0) !== selectedPieceType.charAt(0)){
            availableMoves.push([i, j]);
          }
          j = board.length + 1;
        } 
      }
    }
    // Horse
    else if (selectedPieceType.charAt(1) === 'h'){
      
    }
    // Bishop
    else if (selectedPieceType.charAt(1) === 'b'){

    }
    // Queen
    else if (selectedPieceType.charAt(1) === 'q'){

    }
    // King
    else if (selectedPieceType.charAt(1) === 'k'){

    }

    this.setState({ availableMoves })
  }

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

  clickSquare(i, j) {
    // if there's no piece selected and the user clicked on an a piece of their own color
    if (!this.state.pieceSelected && this.state.board[i][j] && this.state.board[i][j].charAt(0) === this.state.whoseTurn) {
      this.selectPiece(i, j);
    }
    // if there IS a piece selected, but the user clicks on a different piece of their own color, set the selected piece to the new selection
    else if (this.state.pieceSelected && this.state.board[i][j].charAt(0) === this.state.selectedPieceType.charAt(0)) {
      this.selectPiece(i, j);
    }
    // If there is a piece selected and the user clicks on an empty square
    else if (this.state.pieceSelected && !this.state.board[i][j]) {
      this.movePieceToEmptySquare(i, j);
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