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
    }

    this.selectPiece = this.selectPiece.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
  }

  selectPiece(i, j){
    let pieceType = this.state.board[i][j];
    console.log(pieceType, i, j);
  }

  renderBoard() {
    return this.state.board.map((row, i) => {
      var squares = row.map( (item, j) => {
        return <Square key={j} piece={item} handleClick={this.selectPiece} location={[i, j]} />
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