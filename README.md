# soduko

This is a tool to help solve Sudoku puzzles. It does not solve them for you, nor does it generate puzzles. It includes a collection of pre-built puzzles and allows you to enter custom puzzles.

The included functionality is relatively simple:

1. Highlights selected row, column, and section.
2. Allows "pencil marks".
3. Highlights related pencil marks.
4. Undo and redo.
5. Highlight conflicts.
6. Solution detection - you'll know if you solved the puzzle.

## Demo

Try it out [here](https://soduko.me).

## Stock Puzzles

At the moment, soduko includes 95 stock puzzles shamelessly stolen from [http://norvig.com/top95.txt](http://norvig.com/top95.txt).

## Custom Puzzles

Work on your own puzzles by entering them as a custom puzzle. Custom puzzles must be 81 characters long and consist only of the numbers 1-9, and either "." or "0" representing blanks.

For example:

    .8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....

represents the following puzzle:

    . 8 . |. 4 . |. . . 
    3 . . |. . . |. 1 . 
    . . . |. . . |. 2 . 
    ------+------+------
    . . 5 |. . . |4 . 6 
    9 . . |1 . . |8 . . 
    2 . . |. . . |. . . 
    ------+------+------
    . . . |3 . 9 |. . . 
    . 6 . |. . . |5 . . 
    . . . |2 . . |. . . 

## Development

soduko was built with React (via create-react-app), Material-UI, and Styled Components.

Launch a development server at [http://localhost:3000](http://localhost:3000) using the following commands:

    $> yarn
    $> yarn start

Build a production package using the following commands:

    $> yarn build
