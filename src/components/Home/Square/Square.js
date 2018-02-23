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
            background: (j % 2 === i % 2) ? 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE6ctrqwxsbjV8wTdAL83MzpH6XoVfLfRYSXv8Lmf530pDjWrI")' : "url('https://4my3boyz.com/content/images/thumbs/0014032_danscapes-spring-wood-grain-dark-brown-cotton-fabric_500.jpeg')",
            border: squareBorder
        }
        let pieceStyle = piece ? {
            background: "url('/media/" + piece + ".png')center center /cover no-repeat",
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
