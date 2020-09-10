class Solver {
    watch = true;
    speed = 200;
    requestStop = false;    
    board;
    originalBoard;
    boardSize;
    boxSize;
    boardRows;
    boardColumns;
    boardBoxes;
    questionsCount;
    solvedCount=0;
    isBoardSolved = false;
    emptiesObject = {};
    singlesObject = {};
    backTrackObject = {};

    constructor(_board) {
        this.board = _board;
        this.originalBoard = copyBoard(_board);
        this.boardSize = _board.length;
        this.boxSize = parseInt(Math.sqrt(this.boardSize))
        this.init3arrays()
        this.questionsCount = this.findQuestionsCount();
        this.solvedCount = 0;        
    }
    startSolving(){
        this.initEmptiesObject()
        this.singlesFinder()
        if(!this.isBoardSolved) this.backTracking()
    }
    initEmptiesObject() {
        let emptyObjectCounter = 0;
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (this.board[row][col] == 0) {
                    let boxNumber = getBoxNumber(row, col, this.boxSize);
                    this.emptiesObject[`${emptyObjectCounter}`] = {
                        row: row,
                        col: col,
                        box: boxNumber,
                        currentValue: 0,
                        possibleValues: [],
                        possibleIdx: null,
                        isSingle: false,
                        solved: false
                    }
                    emptyObjectCounter++;
                }
            }
        }
    }
    singlesFinder() {
        let valuesFilledCounter;

        do {
            valuesFilledCounter = 0;

            for (let idx in this.emptiesObject) {
                let obj = this.emptiesObject[idx]
                if (!obj.solved) {
                    let isSingleFilled = this.findSinglesFromObject(obj);
                    if (isSingleFilled > 0) {
                        this.singlesObject[valuesFilledCounter] = obj;
                        valuesFilledCounter++;
                    }
                }
            }
            if (valuesFilledCounter > 0) {
                this.solvedCount += valuesFilledCounter;
                this.writeToBoard(this.singlesObject)
                view.printBoard(this.board)                
            }
        } while (valuesFilledCounter > 0);
        if (this.solvedCount == this.questionsCount) {
            this.isBoardSolved = true;
            let isSolutionValid = this.boardValidation()
            alert('Solution revealed')
        }
    }
    findSinglesFromObject(obj) {
        let valueFilled = 0;
        let { row, col, box } = obj;
        let isSingle = this.checkIfSingle(row, col, box);
        if (isSingle.length == 1) {
            valueFilled = isSingle[0];

            obj.isSingle = true;
            obj.solved = true;
            obj.currentValue = isSingle[0];
        }
        obj.possibleValues = [...isSingle];
        obj.possibleIdx = 0;

        return valueFilled;
    }

    checkIfSingle(row, col, box) {
        let possible = Array.from({ length: boardSize }, (val, idx) => idx + 1)
        let rowValues = [...new Set(this.boardRows[row])]
        let colValues = [...new Set(this.boardColumns[col])]
        let boxValues = [...new Set(this.boardBoxes[box])]
        let existigValues = [...new Set(rowValues.concat(colValues).concat(boxValues))]
        removeInArrayValue(existigValues, 0);

        for (let item of existigValues) removeInArrayValue(possible, item);

        return possible;
    }
    async backTracking(){        
        let bTquestions = this.createBackTrackingObject()
        alert('Solving using backtraking!!')
        let beforeBackTrackBoard = copyBoard(this.board);

        let i = 0;
        let iterations = 0;
        while(i < bTquestions){            
            let obj = this.backTrackObject[i]                        
            let {row, col, box, possibleValues, possibleIdx} = obj;            

            let isFilled = false;
            while(possibleIdx < possibleValues.length){
                let value = possibleValues[possibleIdx]
                let isValueValid = this.checkIfValidValue(row, col, box, value)
                possibleIdx++;
                this.backTrackObject[i].possibleIdx = possibleIdx;
                if(isValueValid){
                    this.backTrackObject[i].currentValue = value   
                    isFilled = true       
                    break;
                }
            }
            if(!isFilled){
                if(i == 0 ){
                    console.log('backTracking: solution cannot be found');
                    return;
                }else{
                    this.backTrackObject[i].possibleIdx = 0;
                    this.backTrackObject[i].currentValue = 0;
                    i -= 2;
                }
            }
            this.writeToBoard(this.backTrackObject)
            view.printBoard(this.board)
            if(this.requestStop) return;
            if(this.watch){
                let reduction = parseInt(iterations/100)*10
                reduction = reduction >= this.speed ? 0 : reduction;
                await sleep(this.speed - reduction )   
            }


            i++; iterations++;
        }
        if(this.boardValidation()){
            
            alert('Solution revealed!!!')
        }      
    }
    checkIfValidValue(row,col,box,value){
        let isValid = true;
        let rowValues = [...new Set(this.boardRows[row])]
        let colValues = [...new Set(this.boardColumns[col])]
        let boxValues = [...new Set(this.boardBoxes[box])]
        if(rowValues.includes(value) || colValues.includes(value) || boxValues.includes(value)) isValid = false;        

        return isValid;
    }

    createBackTrackingObject(){
        let counter = 0;
        for(let idx in this.emptiesObject){
            let obj = this.emptiesObject[idx];
            if(!obj.solved){
                this.backTrackObject[counter] = obj;
                counter++;
            }
        }

        return counter;
    }
    writeToBoard(_obj) {
        let objLen = Object.keys(_obj).length;
        for (let i = 0; i < objLen; i++) {
            let obj = _obj[i];
            this.board[obj.row][obj.col] = obj.currentValue;
        }
        this.init3arrays()
    }
    init3arrays() {
        this.boardRows = this.board;
        this.boardColumns = generateColumnArray(this.board)
        this.boardBoxes = generateBoxArray(this.board, this.boardSize)
    }
    findQuestionsCount() {
        return parseInt(Math.pow(this.boardSize, 2)) - this.board.reduce((a, b) => a + (b.filter(x => x > 0).length), 0)
    }
    boardValidation(){
        let resultValidator = new Validate(this.board,this.boardSize);
        return resultValidator.runTests()
    }
}
