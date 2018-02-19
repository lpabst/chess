import React, { Component } from 'react';

class Square extends Component {

    render() {
        let [i, j] = this.props.location;
        let {piece, availableMoves} = this.props;
        let squareBorder;
        let offendingPiece;

        //determines if this sqaure contains a piece that places the enemy king in check
        for (let p = 0; p < this.props.errorPieceLocations.length; p++){
            if (i === this.props.errorPieceLocations[p][0] && j === this.props.errorPieceLocations[p][1]){
                offendingPiece = true;
            }
        }

        //determines the border styling for each square. red = offending piece, blue = available move, green = currently selected piece
        if (i === this.props.selectedPieceLocation[0] && j === this.props.selectedPieceLocation[1]){
            squareBorder = '4px solid rgb(14, 255, 14)';
        }else if (offendingPiece){
            squareBorder = '4px solid red';
        }else{
            for (let z = 0; z < availableMoves.length; z++){
                if (i === availableMoves[z][0] && j === availableMoves[z][1]){
                    squareBorder = '4px solid rgb(89, 208, 255)';
                }
            }
        }

        let squareStyle = {
            background: (j % 2 === i % 2) ? '#bbb' : 'rgb(83, 50, 0)',
            border: squareBorder
        }
        let pieceStyle = piece ? {
            background: "url('/media/" + piece + ".jpg')center center /cover no-repeat",
            transform: this.props.rotate
        }
        : {}

        return (
            <div className='square' style={squareStyle} onClick={(e) => this.props.handleClick(i, j)} >
                <div className='piece' style={pieceStyle} ></div>
            </div>
        );
    }
}


export default Square;
