import React, { Component } from 'react';

import './Home.css';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board: [
        ['R', 'H', 'B', 'K', 'Q', 'B', 'H', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'H', 'B', 'K', 'Q', 'B', 'H', 'R'],
      ],
    }
  }

  renderBoard() {
    return this.state.board.map((row, i) => {
      var squares = row.map( (item, j) => {
        let styles = {
          background: (j % 2 === i % 2) ? '#fff' : '#000',
          color: (j % 2 === i % 2) ? '#000' : '#fff'
        }
        return <div className="square" key={j} style={styles} >{item}</div>;
      })
      return <div className='row' key={i} >{squares}</div>;
    })
  }

  render() {
    return (
      <div className="home">

        <div className='board'>
          {this.renderBoard()}
        </div>

      </div>
    );
  }
}


export default Home;