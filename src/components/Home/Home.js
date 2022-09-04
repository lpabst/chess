import React, { Component } from "react";
import Square from "./Square/Square.js";
import Settings from "./Settings/Settings.js";
import ai from "./../../services/chessEngine.js";
import "./Home.css";
import { Game } from "../../services/game.js";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playAs: "White",
      player2: "Computer",
      opponentAI: true,
      aiDifficulty: 2,
      aiPlayer: "Thoughtful Sue",
      rotateBoard: "No",
      boardRotation: 180,
      firstTurn: true,
      game: new Game(),
      allPiecesMoves: [],
      pieceSelected: false,
      selectedPieceType: "",
      selectedPieceLocation: [],
      availableMoves: [],
      warningMessage: "",
      errorPieceLocations: [],
      showSettings: false,
    };

    this.startNewGame = this.startNewGame.bind(this);
    this.startTurn = this.startTurn.bind(this);
    this.endGame = this.endGame.bind(this);
    this.getComputerMove = this.getComputerMove.bind(this);
    this.selectPiece = this.selectPiece.bind(this);
    this.clickSquare = this.clickSquare.bind(this);
    this.toggleSettings = this.toggleSettings.bind(this);
    this.closeSettings = this.closeSettings.bind(this);
    this.renderBoard = this.renderBoard.bind(this);
    this.updateState = this.updateState.bind(this);
  }

  componentDidMount() {
    this.startNewGame();
  }

  // Resets state and starts a new game
  startNewGame() {
    const game = new Game();
    let rotate = this.state.playAs === "White" ? 180 : 0;

    this.setState(
      {
        gameover: false,
        boardRotation: rotate,
        firstTurn: true,
        game: game,
        pieceSelected: false,
        selectedPieceType: "",
        selectedPieceLocation: [],
        availableMoves: [],
        warningMessage: "",
        errorPieceLocations: [],
        showSettings: false,
      },
      this.startTurn
    );
  }

  /* 
    Checks if there are available moves for the current player. If not, the game is over, so it
    checks if it's stalemate or checkmate. If there ARE available moves, it rotates the board if
    that is a setting that is enabled, then checks if the opponent is the computer. If so, it 
    triggers the function that makes a move for the computer
  */
  startTurn() {
    let allMoves = this.state.game.getAllAvailableMoves();

    if (
      !allMoves.hasAvailableMoves ||
      this.state.game.stalemateMoveCount >= 50
    ) {
      return this.endGame(this.state.game.board);
    }

    // flip the board around on each turn if that setting is selected and it's not the beginning of the game
    let rotate = this.state.boardRotation;
    if (this.state.rotateBoard === "Yes" && !this.state.firstTurn) {
      rotate = rotate === 0 ? 180 : 0;
    }

    // Set all of the available moves on state, and rotate board if necessary
    this.setState(
      {
        allPiecesMoves: allMoves,
        boardRotation: rotate,
      },
      () => {
        // If the opponent is the computer and it's the computer's turn, get the computer's move here
        let player1 = this.state.playAs === "White" ? "w" : "b";
        if (this.state.opponentAI && player1 !== this.state.game.whoseTurn) {
          setTimeout(this.getComputerMove, 1);
        }
      }
    );
  }

  // ends the game
  endGame() {
    // Check if it's stalemate or checkmate
    let endGameMessage;
    let kingLocation = this.state.game.getKingLocation(
      this.state.game.whoseTurn
    );
    let isInCheck = this.state.game.testForCheck(kingLocation);

    if (isInCheck) {
      let whoWon = this.state.whoseTurn === "w" ? "Black" : "White";
      endGameMessage = "Checkmate!!! " + whoWon + " wins!";
    } else {
      endGameMessage = "StaleMate! It's a tie game";
    }

    this.setState({
      gameover: true,
      warningMessage: endGameMessage,
    });
  }

  // Makes a move for the computer player
  getComputerMove() {
    let { aiDifficulty } = this.state;
    let whoseTurn = this.state.game.whoseTurn;
    let moves = this.state.allPiecesMoves.moves;
    let newTurn = whoseTurn === "b" ? "w" : "b";

    // computer chess engine is outsourced to src/services/chessEngine.js and is imported as "ai"
    ai.getComputerMove(aiDifficulty, this.state.game);
  }

  // Select a piece
  selectPiece(i, j) {
    let availableMoves = this.state.allPiecesMoves.moves[i][j];
    this.setState({
      pieceSelected: true,
      selectedPieceType: this.state.board[i][j],
      selectedPieceLocation: [i, j],
      warningMessage: "",
      errorPieceLocations: [],
      availableMoves: availableMoves,
    });
  }

  // Determines what happens when you click on a square on the board
  clickSquare(i, j) {
    // If the game is over, nothing happens
    if (this.state.gameover) {
      return;
    }

    // If the computer is making a move, nothing happens
    let player1 = this.state.playAs === "White" ? "w" : "b";
    if (this.state.opponentAI && player1 !== this.state.game.whoseTurn) {
      return;
    }

    const baord = this.state.game.board;
    let { availableMoves } = this.state;

    // if there's no piece selected and the user clicked on a piece of their own color, set that piece to the selectedPiece, and get the available moves for that piece
    if (
      !this.state.pieceSelected &&
      this.state.game.board[i][j] &&
      this.state.game.board[i][j].charAt(0) === this.state.whoseTurn
    ) {
      this.selectPiece(i, j);
    }

    // If the user clicks on the piece that is already the active piece, unactivate it
    else if (
      this.state.pieceSelected &&
      this.state.selectedPieceLocation[0] === i &&
      this.state.selectedPieceLocation[1] === j
    ) {
      this.setState({
        pieceSelected: false,
        selectedPieceType: "",
        selectedPieceLocation: [],
        availableMoves: [],
      });
    }

    // if there IS a piece selected, but the user clicks on a different piece of their own color, set the selected piece to the new selection
    else if (
      this.state.pieceSelected &&
      this.state.game.board[i][j].charAt(0) ===
        this.state.selectedPieceType.charAt(0)
    ) {
      this.selectPiece(i, j);
    }

    // If there is a piece selected and they didn't click on another of their own pieces
    else if (this.state.pieceSelected) {
      // Check to see if the square the user clicked on is a valid move for the piece that was selected. If so, move it to that new spot.
      for (let index = 0; index < this.state.availableMoves.length; index++) {
        if (availableMoves[index][0] === i && availableMoves[index][1] === j) {
          this.state.game.movePieceToNewSquare(
            this.state.selectedPieceLocation,
            [i, j]
          );
        }
      }
    }
  }

  // opens/closes the settings modal, opposite of what it is now
  toggleSettings() {
    this.setState({
      showSettings: !this.state.showSettings,
    });
  }

  // closes the settings modal
  closeSettings() {
    this.setState({
      showSettings: false,
    });
  }

  // this is passed to settings component as a prop so that it can update state on Home. If the
  // settings modal updates player2, updates the opponentAI setting as well
  updateState(newVal, target) {
    this.setState({
      [target]: newVal,
    });

    // If user is updating the player2 setting, update the opponentAI setting as well
    if (target === "player2") {
      let opponentAI = newVal === "Computer" ? true : false;
      this.setState({ opponentAI });
    }
  }

  renderBoard() {
    let rotate = "rotate(" + this.state.boardRotation + "deg)";

    return this.state.game.board.map((row, i) => {
      var squares = row.map((item, j) => {
        return (
          <Square
            key={j}
            rotate={rotate}
            piece={item}
            handleClick={this.clickSquare}
            location={[i, j]}
            selectedPieceLocation={this.state.selectedPieceLocation}
            availableMoves={this.state.availableMoves}
            errorPieceLocations={this.state.errorPieceLocations}
          />
        );
      });
      return (
        <div className="row" key={i}>
          {squares}
        </div>
      );
    });
  }

  render() {
    let rotate = "rotate(" + this.state.boardRotation + "deg)";

    return (
      <div className="home">
        <p className="turn">
          {this.state.whoseTurn === "w" ? "White's turn" : "Black's turn"}
        </p>
        <p className="warning">{this.state.warningMessage}</p>
        <button onClick={this.toggleSettings} className="settings_toggle">
          New Game
        </button>

        <div className="board" style={{ transform: rotate }}>
          {this.renderBoard()}
        </div>

        {this.state.showSettings ? (
          <Settings
            closeSettings={this.closeSettings}
            startNewGame={this.startNewGame}
            updateState={this.updateState}
            playAs={this.state.playAs}
            player2={this.state.player2}
            rotateBoard={this.state.rotateBoard}
            aiDifficulty={this.state.aiDifficulty}
          />
        ) : null}
      </div>
    );
  }
}

export default Home;
