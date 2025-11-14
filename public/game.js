document.addEventListener('DOMContentLoaded', () => {
    /****************************************************************************
     * DOM ELEMENTS
     ****************************************************************************/
    const board = document.getElementById('game-board');
    const resetBtn = document.getElementById('reset-btn');
    const messageEl = document.getElementById('message');
    const moveCounter = document.getElementById('move-counter');
    
    /******************************************************************************
     * CONSTANTS
     ******************************************************************************/
    const SIZE = 3;
    const GAME_STATE = [];
    let moves = 0;

    const TARGET_POSITIONS = [
        ['blue', 'red', 'yellow'],
        ['green', null, 'green'],
        ['blue', 'red', 'yellow']
    ];
    
    /******************************************************************************
     * GAME STUFF
     ******************************************************************************/
    function initGame() {
        // Reset game state
        board.innerHTML = '';
        messageEl.textContent = '';
        moves = 0;
        
        // Create initial game state
        createInitialState();
        ensureMiddleEmpty();
        createBoard();
        updateBoardGraphics();
    }

    function createInitialState() {
        // Clear the old state
        while(GAME_STATE.length > 0) {
            GAME_STATE.pop();
        }
        
        // Create a copy of target positions and shuffle it
        const newState = shuffle([...TARGET_POSITIONS[0], ...TARGET_POSITIONS[1], ...TARGET_POSITIONS[2]]);
        
        // Push the shuffled rows into the game state
        GAME_STATE.push(
            [newState[0], newState[1], newState[2]],
            [newState[3], newState[4], newState[5]],
            [newState[6], newState[7], newState[8]]
        );
    }

    // Fisher-Yates shuffle an input array, and return a copy
    function shuffle(arr) {
        let array = JSON.parse(JSON.stringify(arr))
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    
    function ensureMiddleEmpty() {
        if (GAME_STATE[1][1] !== null) {
            // Find the empty cell and swap it with the middle
            const emptyPos = findEmptyCell(GAME_STATE);
            swapCells(1, 1, emptyPos.row, emptyPos.col, GAME_STATE);
        }
    }
    
    function swapCells(row1, col1, row2, col2) {
        const temp = GAME_STATE[row1][col1];
        GAME_STATE[row1][col1] = GAME_STATE[row2][col2];
        GAME_STATE[row2][col2] = temp;
    }
    
    function findEmptyCell() {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (GAME_STATE[row][col] === null) {
                    return { row, col };
                }
            }
        }
        return null;
    }



    function createBoard() {
        // Create the cells, their initial css classes, and add them to the board
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Set target position border
                if (TARGET_POSITIONS[row][col]) {
                    cell.dataset.target = TARGET_POSITIONS[row][col];
                }
                else {
                    cell.dataset.target = 'empty';
                }
                
                if (GAME_STATE[row][col]) {
                    cell.textContent = GAME_STATE[row][col].toUpperCase().charAt(0);
                    cell.dataset.color = GAME_STATE[row][col];
                } else {
                    cell.classList.add('empty');
                }
                
                cell.onmousedown = (e) => { e.preventDefault(); handleCellClick(row, col); };
                cell.ontouchstart = (e) => { e.preventDefault(); handleCellClick(row, col); };
                board.appendChild(cell);
            }
        }
    }

    function handleCellClick(clickRow, clickCol) {
        const emptyCell = findEmptyCell(GAME_STATE);
        
        // Check if the clicked cell is adjacent to the empty cell
        if ((Math.abs(clickRow - emptyCell.row) === 1 && clickCol === emptyCell.col) ||
            (Math.abs(clickCol - emptyCell.col) === 1 && clickRow === emptyCell.row)) {
            
            // Check if move is valid (no vertical moves in middle column)
            if (clickCol === 1 && emptyCell.col === 1 && clickRow !== emptyCell.row) {
                // Show invalid move feedback
                const cells = document.querySelectorAll('.cell');
                const cellIndex = clickRow * SIZE + clickCol;
                const cell = cells[cellIndex];
                cell.classList.add('invalid-move');                
                setTimeout(() => {
                    cell.classList.remove('invalid-move');
                }, 400);
                
                return;
            }
            
            swapCells(clickRow, clickCol, emptyCell.row, emptyCell.col, GAME_STATE);
            moves++;
            updateBoardGraphics();
            if (isGameWon()) {
                messageEl.textContent = `Congratulations! You won in ${moves} moves!`;
            }
        }
    }
    
    function updateBoardGraphics() {
        const cells = document.querySelectorAll('.cell');
        let index = 0;
        
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                const cell = cells[index];
                
                if (GAME_STATE[row][col]) {
                    cell.textContent = GAME_STATE[row][col].toUpperCase().charAt(0);
                    cell.dataset.color = GAME_STATE[row][col];
                    cell.classList.remove('empty');
                } else {
                    cell.textContent = '';
                    cell.removeAttribute('data-color');
                    cell.classList.add('empty');
                }
                
                index++;
            }
        }
        moveCounter.textContent = moves;
    }
    
    function isGameWon() {
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (GAME_STATE[row][col] !== TARGET_POSITIONS[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /****************************************************************************
     * GAME INIT
     ****************************************************************************/
    resetBtn.addEventListener('click', initGame);
    initGame();
});
