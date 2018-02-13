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
      pieceType: '',
      selectedPieceLocation: [],
      availableMoves: [[4,4], [6,3]],
    }

    this.selectPiece = this.selectPiece.bind(this);
    this.movePieceToEmptySquare = this.movePieceToEmptySquare.bind(this);
    this.clickSquare = this.clickSquare.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
  }

  selectPiece(i, j){
    this.setState({
      pieceSelected: true,
      pieceType: this.state.board[i][j],
      selectedPieceLocation: [i, j]
    })
  }

  movePieceToEmptySquare(i, j){
    let board = JSON.parse(JSON.stringify(this.state.board));
    let oldLocation = this.state.selectedPieceLocation;
    let newTurn = this.state.whoseTurn === 'w' ? 'b' : 'w';
    board[i][j] = this.state.pieceType;
    board[oldLocation[0]][oldLocation[1]] = '';

    this.setState({
      pieceSelected: false,
      pieceType: '',
      selectedPieceLocation: [],
      board: board,
      whoseTurn: newTurn
    })
  }

  clickSquare(i, j){
    // if there's no piece selected and the user clicked on an a piece of their own color
    if (!this.state.pieceSelected && this.state.board[i][j] && this.state.board[i][j].charAt(0) === this.state.whoseTurn){
      this.selectPiece(i, j);
    }
    // if there IS a piece selected, but the user clicks on a different piece of their own color, set the selected piece to the new selection
    else if (this.state.pieceSelected && this.state.board[i][j].charAt(0) === this.state.pieceType.charAt(0)){
      this.selectPiece(i, j);
    }
    // If there is a piece selected and the user clicks on an empty square
    else if (this.state.pieceSelected && !this.state.board[i][j]){
      this.movePieceToEmptySquare(i, j);
    }
  }

  renderBoard() {
    return this.state.board.map((row, i) => {
      var squares = row.map( (item, j) => {
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
          { this.renderBoard() }
        </div>

      </div>
    );
  }
}


export default Home;