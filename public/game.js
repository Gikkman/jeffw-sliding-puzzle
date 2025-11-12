document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const resetBtn = document.getElementById('reset-btn');
    const messageEl = document.getElementById('message');
    
    // Game state
    let gameState = [];
    const size = 3;
    const colors = ['red', 'blue', 'yellow', 'green'];
    
    // Initialize the game
    function initGame() {
        // Clear the board
        board.innerHTML = '';
        messageEl.textContent = '';
        
        // Create initial game state
        gameState = createInitialState();
        
        // Create the board
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Set target position border
                if (targetPositions[row][col]) {
                    cell.dataset.target = targetPositions[row][col];
                }
                
                if (gameState[row][col]) {
                    cell.textContent = gameState[row][col].toUpperCase().charAt(0);
                    cell.dataset.color = gameState[row][col];
                } else {
                    cell.classList.add('empty');
                }
                
                cell.addEventListener('click', () => handleCellClick(row, col));
                board.appendChild(cell);
            }
        }
        
        // Randomize the board
        randomizeBoard(100);
        ensureMiddleEmpty();
        updateBoard();
    }
    
    // Define the target positions for the win state
    const targetPositions = [
        ['blue', 'red', 'yellow'],
        ['green', null, 'green'],
        ['blue', 'red', 'yellow']
    ];

    // Create initial game state with winning positions and empty middle
    function createInitialState() {
        // Create a deep copy of the target positions
        return shuffle(targetPositions);
    }

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
    
    // Randomize the board by making random valid moves
    function randomizeBoard(moves) {
        const directions = [
            { row: -1, col: 0 },  // up
            { row: 1, col: 0 },   // down
            { row: 0, col: -1 },  // left
            { row: 0, col: 1 }    // right
        ];
        
        let emptyPos = { row: 1, col: 1 }; // Start with middle as empty
        
        for (let i = 0; i < moves; i++) {
            const validMoves = [];
            
            // Find all valid moves that don't involve the middle column vertically
            for (const dir of directions) {
                const newRow = emptyPos.row + dir.row;
                const newCol = emptyPos.col + dir.col;
                
                // Check if move is valid and not moving into the middle from top/bottom
                if (isValidMove(emptyPos.row, emptyPos.col, newRow, newCol)) {
                    // Only allow moves that don't involve vertical movement in the middle column
                    if (!(newCol === 1 && emptyPos.col === 1 && newRow !== emptyPos.row)) {
                        validMoves.push({ row: newRow, col: newCol });
                    }
                }
            }
            
            // Make a random valid move
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                swapCells(emptyPos.row, emptyPos.col, randomMove.row, randomMove.col);
                emptyPos = { row: randomMove.row, col: randomMove.col };
            }
        }
    }
    
    function ensureMiddleEmpty() {
        // Ensure the middle is empty
        if (gameState[1][1] !== null) {
            // Find the empty cell and swap it with the middle
            const emptyPos = findEmptyCell();
            swapCells(1, 1, emptyPos.row, emptyPos.col);
        }
    }

    // Handle cell click
    function handleCellClick(row, col) {
        const emptyCell = findEmptyCell();
        
        // Check if the clicked cell is adjacent to the empty cell
        if ((Math.abs(row - emptyCell.row) === 1 && col === emptyCell.col) ||
            (Math.abs(col - emptyCell.col) === 1 && row === emptyCell.row)) {
            
            // Check if move is valid (no vertical moves in middle column)
            if (col === 1 && emptyCell.col === 1 && row !== emptyCell.row) {
                return; // Invalid vertical move in middle column
            }
            
            // Swap the cells and check for win
            swapCells(row, col, emptyCell.row, emptyCell.col);
            updateBoard(true); // Pass true to check win condition after player move
        }
    }
    
    // Swap two cells in the game state with animation
    function swapCells(row1, col1, row2, col2, checkWin = false) {
        // Get the cells from the DOM
        const cells = Array.from(document.querySelectorAll('.cell'));
        const index1 = row1 * size + col1;
        const index2 = row2 * size + col2;
        const cell1 = cells[index1];
        const cell2 = cells[index2];
        
        // Add animation class
        cell1.style.transform = 'scale(0.95)';
        cell2.style.transform = 'scale(0.95)';
        
        // Update the game state
        const temp = gameState[row1][col1];
        gameState[row1][col1] = gameState[row2][col2];
        gameState[row2][col2] = temp;
        
        // Update the visual board (don't check win here)
        updateBoard(checkWin);
        
        // Reset animation
        setTimeout(() => {
            if (cell1) cell1.style.transform = '';
            if (cell2) cell2.style.transform = '';
        }, 300);
    }
    
    // Find the empty cell
    function findEmptyCell() {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (gameState[row][col] === null) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    // Check if a move is valid
    function isValidMove(fromRow, fromCol, toRow, toCol) {
        // Check if out of bounds
        if (toRow < 0 || toRow >= size || toCol < 0 || toCol >= size) {
            return false;
        }
        
        // Check if it's a horizontal or vertical move (not diagonal)
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }
        
        // Check if moving vertically in the middle column
        if (fromCol === 1 && toCol === 1 && fromRow !== toRow) {
            return false;
        }
        
        return true;
    }
    
    // Update the visual board based on game state with animations
    function updateBoard(checkWinCondition = false) {
        const cells = document.querySelectorAll('.cell');
        let index = 0;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = cells[index];
                
                if (gameState[row][col]) {
                    cell.textContent = gameState[row][col].toUpperCase().charAt(0);
                    cell.dataset.color = gameState[row][col];
                    cell.classList.remove('empty');
                } else {
                    cell.textContent = '';
                    cell.removeAttribute('data-color');
                    cell.classList.add('empty');
                }
                
                index++;
            }
        }
        
        // Only check for win if explicitly requested (after player moves)
        if (checkWinCondition && checkWin()) {
            messageEl.textContent = 'Congratulations! You won!';
            messageEl.style.color = '#4CAF50';
        }
    }
    
    // Check if the player has won
    function checkWin() {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (gameState[row][col] !== targetPositions[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Event listeners
    resetBtn.addEventListener('click', initGame);
    
    // Start the game
    initGame();
});
