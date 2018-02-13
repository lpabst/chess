import React, { Component } from 'react';

class Square extends Component {

    render() {
        let [i, j] = this.props.location;
        let styles = {
            background: (j % 2 === i % 2) ? '#fff' : 'rgb(83, 50, 0)'
        }
        let pieceStyle = {
            background: "url('/media/"+this.props.piece+".jpg')center no-repeat"
        }

        return (
            <div className='square' style={styles} onClick={(e) => this.props.handleClick(i, j)} >
                <div className='piece' style={pieceStyle} ></div>
            </div>
        );
    }
}


export default Square;
