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
      pieceSelected: false,
      pieceType: '',
      selectedPieceLocation: []
    }

    this.clickSquare = this.clickSquare.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
  }

  clickSquare(i, j){
    if (!this.state.pieceSelected && this.state.board[i][j]){
      this.setState({
        pieceSelected: true,
        pieceType: this.state.board[i][j],
        selectedPieceLocation: [i, j]
      })
    }
    else if (this.state.pieceSelected && !this.state.board[i][j]){
      let board = JSON.parse(JSON.stringify(this.state.board));
      let oldLocation = this.state.selectedPieceLocation;
      board[i][j] = this.state.pieceType;
      board[oldLocation[0]][oldLocation[1]] = ''
      this.setState({
        pieceSelected: false,
        pieceType: '',
        selectedPieceLocation: [],
        board: board
      })
    }
  }

  renderBoard() {
    return this.state.board.map((row, i) => {
      var squares = row.map( (item, j) => {
        return <Square key={j} piece={item} handleClick={this.clickSquare} location={[i, j]} />
      })
      return <div className='row' key={i} >{squares}</div>;
    })
  }

  render() {
    return (
      <div className="home">

        <div className='board'>
          { this.renderBoard() }
        </div>

      </div>
    );
  }
}


export default Home;