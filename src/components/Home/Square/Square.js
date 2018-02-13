import React, { Component } from 'react';

class Square extends Component {

    render() {
        let [i, j] = this.props.location;
        let piece = this.props.piece;

        let squareStyle = {
            background: (j % 2 === i % 2) ? '#bbb' : 'rgb(83, 50, 0)'
        }
        let pieceStyle = piece ? {
            background: "url('/media/" + piece + ".jpg')center no-repeat",
            backgroundSize: 'cover'
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
