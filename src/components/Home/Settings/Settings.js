import React, { Component } from "react";

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playAs: "Black",
      player2: "Human",
    };
  }

  updateDifficulty(newVal) {
    const difficulty = {
      "Jack The Monkey": 0,
      "Aggressive Mike": 1,
      "Thoughtful Sue": 2,
      "Sue's Older Sister": 3,
      "Chess Tutor": 5,
      "Local Tourny Champ": 6,
      "State Tourny Champ": 7,
      "Chess Master": 8,
      "Grand Master": 10,
      Stockfish: 12,
    };

    // The diff selected here is how many levels deep stockfish goes in its analysis (except levels which are built locally)
    var diff = difficulty[newVal];

    this.props.updateState(diff, "aiDifficulty");
    this.props.updateState(newVal, "aiPlayer");
  }

  render() {
    return (
      <div className="settings_div">
        <p className="close_x" onClick={this.props.closeSettings}>
          X
        </p>

        <div className="setting_row">
          <p>New Game Setup</p>
        </div>

        <div className="setting_row">
          <p>Play as </p>
          <select
            value={this.props.playAs}
            onChange={(e) => this.props.updateState(e.target.value, "playAs")}
          >
            <option>White</option>
            <option>Black</option>
          </select>
        </div>

        <div className="setting_row">
          <p>Player 2</p>
          <select
            value={this.props.player2}
            onChange={(e) => this.props.updateState(e.target.value, "player2")}
          >
            <option>Computer</option>
            <option>Human</option>
          </select>
        </div>

        {this.props.player2 === "Human" ? (
          <div className="setting_row">
            <p>Rotate Board</p>
            <select
              value={this.props.rotateBoard}
              onChange={(e) =>
                this.props.updateState(e.target.value, "rotateBoard")
              }
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        ) : (
          <div className="setting_row">
            <p>Difficulty</p>
            <select
              value={this.props.aiPlayer}
              onChange={(e) => this.updateDifficulty(e.target.value)}
            >
              <option>Jack The Monkey</option>
              <option>Aggressive Mike</option>
              <option>Thoughtful Sue</option>
              <option>Sue's Older Sister</option>
              <option>Chess Tutor</option>
              <option>Local Tourny Champ</option>
              <option>State Tourny Champ</option>
              <option>Chess Master</option>
              <option>Grand Master</option>
              <option>Stockfish</option>
            </select>
          </div>
        )}

        <div className="setting_row">
          <button onClick={this.props.startNewGame}>Start New Game</button>
        </div>
      </div>
    );
  }
}

export default Settings;
