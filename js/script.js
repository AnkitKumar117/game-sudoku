window.addEventListener('load', () => {
    initActions()    
})

function newGame(_boardSize, _level) {    
    boardSize = _boardSize;
    boxSize = parseInt(Math.sqrt(boardSize))
    level = _level; 
    board = new Board(boardSize);
    isBoardValidate = board.createBoard(boardSize);
    console.log('isBoardValidate', isBoardValidate)
    solvedBoard = copyBoard(board.board)
    digger = new Digger(level, board.board, boardSize)
    questionBoard = copyBoard(board.board)
    view = new View()
    view.createBoardHTML(boardSize)
    view.printBoard(questionBoard)
    initActions()
}
function clearUserInput(){
    board.board = copyBoard(questionBoard)
    view.printBoard(questionBoard)
}
class Board {
    board;
    boardSize;
    boxSize;
    boardValues;

    constructor(_boardSize) {
        this.boardSize = _boardSize;
        this.boxSize = parseInt(Math.sqrt(_boardSize))
        this.board = Array.from(Array(this.boardSize), () => new Array(this.boardSize).fill(0));
        this.boardValues = Array.from(Array(this.boardSize), () => new Array(this.boardSize).fill(0));   
    }
    getBoard(){
        let newBoard = [...this.board]
        return [...newBoard];
    }
    createBoard() {  
        this.board[0] = this.randomArray(this.boardSize)        
        for (let i = 2; i <= this.boardSize; i++) {
            let shiftSize = (i - 1) % this.boxSize == 0 ? this.boxSize + 1 : this.boxSize;
            this.board[i-1] = this.shiftSequence(this.board[i-2],shiftSize)            
        }             
        return this.combinations() 
    }

    validate(){
        let validation = new Validate(this.board, this.boardSize);
        return validation.runTests()
    }
    random(max, min = 0) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    randomArray(length, starting = 1) {
        let sequence = Array.from({
            length: length
        }, (val, idx) => idx + starting)
        let temp;
        for (let i = 0; i < sequence.length; i++) {
            let randomNumber = this.random(length - 1)
            temp = sequence[i]
            sequence[i] = sequence[randomNumber]
            sequence[randomNumber] = temp
        }
        return sequence
    }
    shiftSequence(sequence, pos) {
        let newSeq = [...sequence]
        let part1 = newSeq.splice(0, pos)
        newSeq.push(...part1)
        return newSeq
    }
    combinations(){
        let combination = new Combinations(this.board, this.boardSize, this.boxSize)
        combination.runCombinations()
        return this.validate();
    }
}
class Digger {
    level
    holesCount;
    board;
    board_transpose;
    boardSize;
    LevelSelector;
    levels = [
        [
            [4, 6],
            [8, 9],
            [10, 11]
        ],
        [
            [32, 45],
            [46, 49],
            [54, 59]
        ]
    ];
    rowColumn_MinCount = [
        [
            [2],
            [1],
            [1]
        ],
        [
            [4, 8],
            [3, 6],
            [1, 4]
        ]
    ];

    constructor(_level, _board, _boardSize) {
        this.level = _level
        this.board = _board;
        this.boardSize = _boardSize;
        this.LevelSelector = _boardSize == 9 ? 1 : 0;
        this.holesCount = this.random(this.levels[this.LevelSelector][_level][1], this.levels[this.LevelSelector][_level][0])        
        this.digChooser(this.holesCount)
    }

    digChooser(howMany){
        let partition1 = random(howMany - 1) + 1;
        partition1 += ( parseInt(partition1%2) )
        let partition2 = howMany - partition1;        
        this.symmetricalDig(partition1)
        this.randomDig(partition2)
    }

    random(max, min = 0) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    randomDig(howMany){
        let copyOfBoard = copyBoard(this.board)
        let copyOfHowMany = howMany;

        while (howMany > 0) {
            let availabaleArray = this.availableCells();            
            //if no cells available for digging, copy board and holesCount and start again
            if(availabaleArray.length < 1){                
                howMany = copyOfHowMany
                this.board = copyOfBoard
                copyOfBoard = copyBoard(this.board)                                
            }else{
                let randomCell = availabaleArray[this.random(availabaleArray.length - 1)]            
                this.board[randomCell[0]][randomCell[1]] = 0;
                howMany--;
            }            
        }        
    }
    symmetricalDig(howMany) {
        let copyOfBoard = copyBoard(this.board)
        let copyOfHowMany = howMany;

        while(howMany > 0){
            let availabaleArray = this.availableCells();
            
            //if no items avaialble for diggin, start over
            if(availabaleArray.length < 1){
                howMany = copyOfHowMany
                this.board = copyBoard(copyOfBoard)
                copyOfBoard = copyBoard(this.board)
            }else{
                let randomCell = availabaleArray[random( parseInt(availabaleArray.length/2 - 1) )]            
                let row = randomCell[0]
                let col = randomCell[1]
                let row_t = (this.boardSize - 1) - row
                let col_t = (this.boardSize - 1) - col
        
                this.board[row][col] = 0;
                this.board[row_t][col_t] = 0;
        
                howMany -= 2;
            }

        }
    }

    availableCells(){
        let availableRows = [];
        let availableColumns = [];
        let availCells = []
        let min = this.rowColumn_MinCount[this.LevelSelector][this.level][0];    
        this.board.forEach((x, idx) => {
          let rowValuesSum =  x.filter(y => y > 0)
          if(rowValuesSum.length > min ) availableRows.push(idx)
        })

        for(let col = 0; col < this.boardSize; col++){
            let colValuesSum = 0
            for(let row=0; row< this.boardSize; row++){
                colValuesSum += (this.board[row][col] > 0)
            }
            if(colValuesSum > min) availableColumns.push(col)
        }

        for(let row = 0 ;row < availableRows.length; row++){
            for(let col =0; col < availableColumns.length; col ++){
                let x = availableRows[row];
                let y = availableColumns[col]

                if(this.board[x][y] > 0){
                    availCells.push([x,y]);
                }
            }
        }
        return availCells
    }
}
