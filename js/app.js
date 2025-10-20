'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const GAMER_PURPLE_IMG = '<img src="img/gamer-purple.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos
var gBallInterval
var gGlueInterval
var gCollectedBalls
var gBallsOnBoard
var gIsStuckOnGlue = false
var gIsGameOn = false


function onInitGame() {
    gIsGameOn = true
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gBallInterval = setInterval(addBall, 3000)
    gGlueInterval = setInterval(addGlue, 5000)
    hideElement('.victory')
    hideElement('.restart')
    gCollectedBalls = 0
    renderBallsCount()

}

function buildBoard() {
    // Create the Matrix 10 * 12 
    const rowsCount = 10
    const colsCount = 12
    const board = []
    // Put FLOOR everywhere and WALL at edges 
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colsCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 ||
                i === rowsCount - 1 ||
                j === 0 ||
                j === colsCount - 1
            ) {
                board[i][j].type = WALL
            }
        }
    }

    board[0][5].type = board[9][5].type = FLOOR
    board[5][0].type = board[5][11].type = FLOOR

    // Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    board[2][4].gameElement = BALL
    board[6][7].gameElement = BALL
    gBallsOnBoard = 2

    // console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j] // {type,gameElement}
            var cellClass = `cell-${i}-${j} `

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {

    if (gIsStuckOnGlue) return
    if (!gIsGameOn) return


    //* Version 2
    // if (i < 0) i = gBoard.length - 1
    // else if (i >= gBoard.length) i = 0
    // else if (j < 0) j = gBoard[0].length - 1
    // else if (j >= gBoard[0].length) j = 0

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    if (targetCell.gameElement === GLUE) gluePlayer()

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // console.log('iAbsDiff:', iAbsDiff)
    // console.log('jAbsDiff:', jAbsDiff)

    // const isValidStep = iAbsDiff + jAbsDiff === 1
    const isValidStep = (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)
    if (isValidStep ||
        iAbsDiff === gBoard.length - 1 ||
        jAbsDiff === gBoard[0].length - 1
    ) {
        if (targetCell.gameElement === BALL) {
            gCollectedBalls++
            gBallsOnBoard--
            renderBallsCount()
            playSound('audio/picking.wav')
            if (checkVictory()) {
                gameOver()
            }
        }

        //* Move the gamer
        //* Moving from current position:
        //* Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        //* Dom:
        renderCell(gGamerPos, '')

        //* Moving to selected position:
        //* Model:
        gGamerPos = { i, j }
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER

        //* Dom:
        const gamerImg = gIsStuckOnGlue ? GAMER_PURPLE_IMG : GAMER_IMG
        renderCell(gGamerPos, gamerImg)
        updateNegsCounter()
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = `.cell-${location.i}-${location.j}`
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}


function gameOver() {
    clearInterval(gBallInterval)
    clearInterval(gGlueInterval)
    showElement('.victory')
    showElement('.restart')
    gIsGameOn = false
}

function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            if (gGamerPos.j === 0) moveTo(i, gBoard[0].length - 1)
            else moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (gGamerPos.j === gBoard[0].length - 1) moveTo(i, 0)
            else moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (gGamerPos.i === 0) moveTo(gBoard.length - 1, j)
            else moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (gGamerPos.i === gBoard.length - 1) moveTo(0, j)
            else moveTo(i + 1, j)
            break
    }
}

//* Version 2
// function onHandleKey2(event) {
//     const i = gGamerPos.i
//     const j = gGamerPos.j

//     switch (event.key) {
//         case 'ArrowLeft':
//             moveTo(i, j - 1)
//             break
//         case 'ArrowRight':
//             moveTo(i, j + 1)
//             break
//         case 'ArrowUp':
//             moveTo(i - 1, j)
//             break
//         case 'ArrowDown':
//             moveTo(i + 1, j)
//             break
//     }
// }


// Returns the class name for a specific cell
function getClassName(location) { // {i,j}
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

function addBall() {
    const randPos = findEmptyPos()
    if (!randPos) return

    //* MODEL
    gBoard[randPos.i][randPos.j].gameElement = BALL
    //* DOM
    renderCell(randPos, BALL_IMG)

    updateNegsCounter()
    gBallsOnBoard++

}

function addGlue() {
    const randPos = findEmptyPos()
    if (!randPos) return

    const cell = gBoard[randPos.i][randPos.j]
    //*MODEL
    cell.gameElement = GLUE
    //*DOM
    renderCell(randPos, GLUE_IMG)

    setTimeout(() => {
        if (cell.gameElement === GLUE) {
            cell.gameElement = null
            renderCell(randPos, '')
        }
    }, 3000)
}

function renderBallsCount() {
    var elBallsCount = document.querySelector('.balls-count span')
    elBallsCount.innerText = gCollectedBalls
}

function gluePlayer() {
    playSound('audio/Sticky.mp3')
    gIsStuckOnGlue = true
    setTimeout(() => {
        gIsStuckOnGlue = false
        renderCell(gGamerPos, GAMER_IMG)
    }, 3000)
}

function updateNegsCounter() {
    const rowIdx = gGamerPos.i
    const colIdx = gGamerPos.j

    var negsBallsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            if (gBoard[i][j].gameElement === BALL) {
                negsBallsCount++
            }
        }
    }


    const elCounter = document.querySelector('.negs-counter span')
    elCounter.innerText = negsBallsCount

}


function checkVictory() {
    return gBallsOnBoard === 0
}


function playSound(sound) {
    var sound = new Audio(sound)
    // sound.play()
}


function findEmptyPos() {
    const emptyPositions = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (!cell.gameElement && cell.type === FLOOR) {
                const pos = { i, j }
                emptyPositions.push(pos)
            }
        }
    }

    if (emptyPositions.length === 0) return null
    const randIdx = getRandomInt(0, emptyPositions.length)
    const emptyPos = emptyPositions[randIdx]
    return emptyPos
}
