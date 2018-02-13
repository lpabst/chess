import React, { Component } from 'react';


class Square extends Component {
    
    render() {
        let [i, j] = this.props.location;
        let styles = {
            background: (j % 2 === i % 2) ? '#fff' : '#000',
            color: (j % 2 === i % 2) ? '#000' : '#fff'
          }

        return (
            <section className='square' style={styles} onClick={(e) => this.props.handleClick(i, j)} >
                {this.props.piece}
            </section>
        );
    }
}


export default Square;
