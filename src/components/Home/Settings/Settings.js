import React, { Component } from 'react';


class Settings extends Component {

  constructor(props){
    super(props);
    this.state = {

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
        <select>
            <option>Black</option>
            <option>White</option>
        </select>
        </div>

        <div className='setting_row'>
        <p>Player 2</p>
        <select>
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