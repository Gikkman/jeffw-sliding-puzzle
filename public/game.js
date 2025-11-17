document.addEventListener('DOMContentLoaded', () => {
    /****************************************************************************
     * DOM ELEMENTS
     ****************************************************************************/
    const boardEl = document.getElementById('game-board');
    const messageEl = document.getElementById('message');
    const moveCounterEl = document.getElementById('move-counter');
    const resetBtn = document.getElementById('reset-btn');
    
    /******************************************************************************
     * CONSTANTS
     ******************************************************************************/
    const SIZE = 9;
    const MIDDLE_CELL_INDEX = 4;
    const GAME_STATE = [];
    let moveCounter = 0;

    const TARGET_STATE = [
        'blue', 'red', 'yellow',
        'green', null, 'green',
        'blue', 'red', 'yellow'
    ];
    
    /******************************************************************************
     * GAME STUFF
     ******************************************************************************/
    function initGame() {
        moveCounter = 0;
        boardEl.innerHTML = '';
        
        resetGameState();
        ensureMiddleEmpty();
        createBoardElements();
        updateBoardGraphics();
    }

    function resetGameState() {
        // Clear the old state
        while(GAME_STATE.length > 0) {
            GAME_STATE.pop();
        }
        
        // Create a copy of target positions and shuffle it
        const newState = shuffle(TARGET_STATE);
        
        // Push the shuffled rows into the game state
        GAME_STATE.push(...newState);
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
    
    /**
     * Ensure the middle cell is empty by swapping it with the empty cell.
     */
    function ensureMiddleEmpty() {
        if (GAME_STATE[MIDDLE_CELL_INDEX] !== null) {
            // Find the empty cell and swap it with the middle
            const emptyCellIndex = findEmptyCell();
            swapCells(MIDDLE_CELL_INDEX, emptyCellIndex);
        }
    }
    
    /**
     * Swap the contents of two cells in the game state.
     * @param {number} cellIndex1 - The index of the first cell.
     * @param {number} cellIndex2 - The index of the second cell.
     */
    function swapCells(cellIndex1, cellIndex2) {
        const temp = GAME_STATE[cellIndex1];
        GAME_STATE[cellIndex1] = GAME_STATE[cellIndex2];
        GAME_STATE[cellIndex2] = temp;
    }
    
    /**
     * Find the index of the empty cell in the game state.
     * @returns {number} The index of the empty cell.
     */
    function findEmptyCell() {
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            if (GAME_STATE[cellIndex] === null) {
                return cellIndex;
            }
        }
        return null;
    }

    /**
     * Create the board's DOM elements and add them to the board.
     */
    function createBoardElements() {
        // Create the cells, their initial css classes, and add them to the board
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            cellElement.dataset.index = cellIndex;
            cellElement.dataset.target = 'blank';
            cellElement.dataset.current = 'blank';

            if (TARGET_STATE[cellIndex]) {
                cellElement.dataset.target = TARGET_STATE[cellIndex];
            }
            if (GAME_STATE[cellIndex]) {
                cellElement.textContent = GAME_STATE[cellIndex].toUpperCase().charAt(0);
                cellElement.dataset.current = GAME_STATE[cellIndex];
            }
            
            cellElement.onmousedown = (e) => { handleCellClick(e.target.dataset.index); };
            cellElement.ontouchstart = (e) => { handleCellClick(e.target.dataset.index); };
            boardEl.appendChild(cellElement);
        }
    }

    /**
     * Handles a cell click event.
     * @param {number} clickedCellIndex - The index of the clicked cell.
     */
    function handleCellClick(clickedCellIndex) {
        const emptyCellIndex = findEmptyCell();
        
        // Check if the clicked cell is adjacent to the empty cell
        // If it is 1, they are adjacent horizontally
        // If it is 3, they are adjacent vertically
        if ((Math.abs(clickedCellIndex - emptyCellIndex) === 1) || Math.abs(clickedCellIndex - emptyCellIndex) === 3) {
            
            // Check if move is valid (no vertical moves in middle column)
            if (clickedCellIndex % 3 === 1 && emptyCellIndex % 3 === 1 && clickedCellIndex !== emptyCellIndex) {
                // Show invalid move feedback
                const cellElement = document.querySelector(`.cell[data-index="${clickedCellIndex}"]`);
                cellElement.classList.add('invalid-move');                
                setTimeout(() => {
                    cellElement.classList.remove('invalid-move');
                }, 400);
                
                return;
            }
            
            swapCells(clickedCellIndex, emptyCellIndex);
            moveCounter++;
            updateBoardGraphics();
            if (isGameWon()) {
                messageEl.textContent = `Congratulations! You won in ${moveCounter} moves!`;
            }
        }
    }
    
    function updateBoardGraphics() {
        const cellElements = document.querySelectorAll('.cell').values().toArray().sort((a, b) => a.dataset.index - b.dataset.index);
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            const cellElement = cellElements[cellIndex];
                
            if (GAME_STATE[cellIndex]) {
                cellElement.textContent = GAME_STATE[cellIndex].toUpperCase().charAt(0);
                cellElement.dataset.current = GAME_STATE[cellIndex];
            } else {
                cellElement.textContent = '';
                cellElement.dataset.current = 'blank';
            }
        }
        moveCounterEl.textContent = moveCounter;
    }
    
    function isGameWon() {
        for (let cellIndex = 0; cellIndex < SIZE; cellIndex++) {
            if (GAME_STATE[cellIndex] !== TARGET_STATE[cellIndex]) {
                return false;
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
