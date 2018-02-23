# Chess Game In React

This is a chess game built using the React Framework

Current State: Able to play the game like normal, but without au passant. 3 levels of AI, first picks moves at random, 2nd plays aggressively, and the 3rd ties into the Stockfish AI 

Future Steps: 
    - Add more levels that go deeper into the Stockfish analysis
    - Alert user when they are put in check
    - Add in au passant 
    - When pawn reaches last row, allow choice instead of forcing queen as replacement


General algorithm overview
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
                - Display available moves in blue highlight
            - if user clicks on an available move for the activePiece, move the piece to that location *END TURN*
            - if user clicks on the piece that is already active, remove it from being the active piece
            - else if user clicks on a different piece of theirs, update the activePiece to the new piece, and update the availble moves accordingly.
            - else if user clicks somewhere else, do nothing
