let setLimits;
let boardSize = 4;
let level = 2; // 0 = Easy, 1 = Medium, 2 = Hard
let board, boxSize, isBoardValidate, solvedBoard, digger, questionBoard;
let view, dotMenuButton,solverMenu,dotMenuDiv;
let solver, solverStartButton,speedRangeButton, solverStopButton ,solverWatchButton;
function getSetLimits(size) {
    setLimits = []
    let boxSize = parseInt(Math.sqrt(size))
    let arr = []
    for (let i = 0; i < size; i++) {
        arr.push(i)
        if ((i + 1) % boxSize == 0 && i != 0) {
            setLimits.push(arr);
            arr = []
        }
    }
    return setLimits;
}



function random(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function generateBoxArray(board, boardSize) {
    let boxSize = parseInt(Math.sqrt(boardSize))
    let boxes = Array.from(Array(boardSize), () => new Array());
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            let row = parseInt(i / boxSize)
            let col = parseInt(j / boxSize)
            let box = col + row * boxSize;
            boxes[box].push(board[i][j])
        }
    }
    return boxes
}
function getBoxNumber(row, col, boxSize) {
    let x = parseInt(row / boxSize)
    let y = parseInt(col / boxSize)
    return (y + x * boxSize);
}
function generateColumnArray(board) {
    let boardSize = board.length;
    let colArray = Array.from(Array(boardSize), () => new Array());

    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize; row++) {
            colArray[col][row] = board[row][col]
        }
    }
    return colArray;
}
function removeInArrayValue(arr, val){
    let idx = arr.indexOf(val);
    if(idx >= 0){
        arr.splice(idx,1)
        return true;
    } else{
        return false;
    }
}
function transposeBoard(board, boardSize, which) {
    let board_inv = Array.from(Array(boardSize), () => new Array(boardSize).fill(0));
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (which == 'values') {
                board_inv[j][i] = board[i][j]
            } else if (which == 'positions') {
                board_inv[j][i] = [i, j]
            }
        }
    }

    return board_inv
}
function copyBoard(board) {
    let cboard = Array.from(Array(board.length), () => new Array(board.length).fill(0))
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            cboard[i][j] = board[i][j]
        }
    }
    return cboard;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class Validate {
    board;
    boardSize;
    sumTarget;
    boxArray_fromBoard;

    constructor(_board, _boardSize) {
        this.board = _board;
        this.boardSize = _boardSize;
        this.sumTarget = parseInt(this.boardSize * (this.boardSize + 1) / 2)
    }

    runTests() {        
        return this.columnSums__validation() && this.rowSums_validation() && this.box_validation()
    }

    columnSums__validation() {
        let isValid = true;
        for (let i = 0; i < this.board.length; i++) {
            let sum = 0;
            for (let j = 0; j < this.board.length; j++) {
                sum += this.board[j][i]
            }
            if (sum != this.sumTarget) {
                isValid = false;
                return isValid;
            }
        }

        return isValid;
    }

    rowSums_validation() {
        let isValid = true
        this.board.forEach(x => {
            if (x.reduce((a, b) => a + b, 0) != this.sumTarget) {
                isValid = false
            }
        });
        return isValid
    }
    box_validation() {
        this.boxArray_fromBoard = generateBoxArray(this.board, this.boardSize)
        let isValid = true
        this.boxArray_fromBoard.forEach(x => {
            isValid = this.unique(x)
        });

        return isValid;
    }

    unique(array) {
        
        let x = array;
        x.sort()
        x = [...new Set(x)]
        let sum = x.reduce((a, b) => a + b, 0);
        if (sum != this.sumTarget || x.length != this.boardSize) {
            return false
        }
        return true;
    }
}
