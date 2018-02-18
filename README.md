# Chess Game In React

This is a chess game built using the React Framework

Current State: Able to play the game and it just about works. All the pieces move like they should, putting someone in check limits their movements, etc...

Next Step: killing the piece that has you in check with your king shouldn't be allowed if there's a piece protecting it since you'd still be in check. Need to double check the functions that look at limiting legal moves and putting someone in check


algorithm overview
- start turn
    - check all available moves
        - filter by legal moves (take check into account)
        - Save available/legal moves to state for future reference
    - if no available/legal moves, game over
        - if in check, checkmate
        - else, stalemate
    - else, allow user interaction
        - user clicks on piece
            - get available moves from state and set activePiece on state
                - if no available moves on state, AND some move would result in check for same user, highlight offending piece in red and display warning message
                - else, display available moves in blue highlight
            - if user clicks on an available move for the activePiece, move the piece to that location *END TURN*
            - else if user clicks on a different piece of theirs, update the activePiece to the new piece, and update the availble moves accordingly.
            - else if user clicks somewhere else, do nothing
