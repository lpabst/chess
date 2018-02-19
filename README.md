# Chess Game In React

This is a chess game built using the React Framework

Current State: Able to play the game like normal, but without au passant. AI works but only picks its moves at random

Next Step: Add in au passant 
    - Needs to be a stalemate when just king left on one side, and 50 moves are made
    - When pawn reaches last row, allow choice instead of forcing queen as replacement


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
