import React, { Component } from 'react';


class Settings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      playAs: 'Black',
      player2: 'Human',
    }

  }

  render() {
    return (
      <div className='settings_div'>

        <p className='close_x' onClick={this.props.closeSettings} >X</p>

        <div className='setting_row'>
          <p>New Game Setup</p>
        </div>

        <div className='setting_row'>
          <p>Play as </p>
          <select value={this.props.playAs} onChange={(e) => this.props.updateState(e, 'playAs')} >
            <option>White</option>
            <option>Black</option>
          </select>
        </div>

        <div className='setting_row'>
          <p>Player 2</p>
          <select value={this.props.player2} onChange={(e) => this.props.updateState(e, 'player2')} >
            <option>Computer</option>
            <option>Human</option>
          </select>
        </div>

        <div className='setting_row'>
          <button onClick={this.props.startNewGame} >Start New Game</button>
        </div>

      </div>
    );
  }
}

export default Settings;