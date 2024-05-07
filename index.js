const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

const snakeColor = '#008000';
let gameSpeed = 400;
let gameRunning = true;

const settingsPanel = document.querySelector('.settings-panel');
const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', () => {
    gameSpeed = 500 - parseInt(speedSlider.value) * 100;
    if (gameSpeed < 100) {
        gameSpeed = 100;
    }
});

let wallCollisionEnabled = false; 

const wallCollisionCheckbox = document.getElementById('wallCollision');
wallCollisionCheckbox.addEventListener('change', () => {
    wallCollisionEnabled = wallCollisionCheckbox.checked;
});

let snake = [{ x: 5, y: 5 }];
let dx = 1;
let dy = 0;
let foodX;
let foodY;

let score = 0;
let gameOver = false;

let leftRightArrowsOnlyEnabled = false;
const leftRightArrowsOnlyCheckbox = document.getElementById('leftRightOnly');
leftRightArrowsOnlyCheckbox.addEventListener('change', () => {
    leftRightArrowsOnlyEnabled = leftRightArrowsOnlyCheckbox.checked;
});

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(j * gridSize, i * gridSize, gridSize, gridSize);
        }
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ff00' : '#008000';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        if (index === 0) {
            ctx.fillStyle = '#ff0000';
            if (dx === 1) {
                ctx.fillRect(segment.x * gridSize + gridSize * 0.8, segment.y * gridSize + gridSize * 0.25, 2, 2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.8, segment.y * gridSize + gridSize * 0.75, 2, 2);
            } else if (dx === -1) {
                ctx.fillRect(segment.x * gridSize + gridSize * 0.2, segment.y * gridSize + gridSize * 0.25, 2, 2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.2, segment.y * gridSize + gridSize * 0.75, 2, 2);
            } else if (dy === 1) {
                ctx.fillRect(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.8, 2, 2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.8, 2, 2);
            } else if (dy === -1) {
                ctx.fillRect(segment.x * gridSize + gridSize * 0.25, segment.y * gridSize + gridSize * 0.2, 2, 2);
                ctx.fillRect(segment.x * gridSize + gridSize * 0.75, segment.y * gridSize + gridSize * 0.2, 2, 2);
            }
        }
    });
}

function drawFood() {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (!handleWallCollision(head)) {
        return false;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
            dx = 1;
            dy = 0;
            gameOverHandler();
            return false;
        }
    }

    if (head.x === foodX && head.y === foodY) {
        snake.unshift(head);
        generateFood();
        score++;
        document.getElementById('score').textContent = score;
    } else {
        snake.unshift(head);
        snake.pop();
    }

    return true;
}

function handleWallCollision(head) {
    if (wallCollisionEnabled) {
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            gameOverHandler();
            return false;
        }
    } else {
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            return false;
        }
    }

    return true;
}

function generateFood() {
    let collision = true;
    while (collision) {
        foodX = Math.floor(Math.random() * cols);
        foodY = Math.floor(Math.random() * rows);
        collision = false;
        for (let i = 0; i < snake.length; i++) {
            if (foodX === snake[i].x && foodY === snake[i].y) {
                collision = true;
                break;
            }
        }
    }
}

function handleKeyPress(event) {
    console.log(event.keyCode); 
    const keyCode = event.keyCode;

    if (keyCode === 32 && gameOver) { 
        restartGame();
        return;
    }

    if (leftRightArrowsOnlyEnabled) {
        switch (keyCode) {
            case 37:
                if (dx === -1) {
                    dx = 0;
                    dy = 1;
                } else if (dy === 1) {
                    dx = 1;
                    dy = 0;
                } else if (dx === 1) {
                    dx = 0;
                    dy = -1;
                } else {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 39:
                if (dx === -1) {
                    dx = 0;
                    dy = -1;
                } else if (dy === 1) {
                    dx = -1;
                    dy = 0;
                } else if (dx === 1) {
                    dx = 0;
                    dy = 1;
                } else {
                    dx = 1;
                    dy = 0;
                }
                break;
            default:
                event.preventDefault();
                break;
        }
    } else {
        switch (keyCode) {
            case 37:
                if (dx !== 1) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 38:
                if (dy !== 1) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 39:
                if (dx !== -1) {
                    dx = 1;
                    dy = 0;
                }
                break;
            case 40:
                if (dy !== -1) {
                    dx = 0;
                    dy = 1;
                }
                break;
            default:
                event.preventDefault();
                break;
        }
    }
}

function gameOverHandler() {
    gameOver = true;
    document.getElementById('overlay').style.display = 'flex';
}

function restartGame() {

    window.location.reload();
}

function gameLoop() {
    if (!moveSnake()) {
        drawGrid();
        drawFood();
        drawSnake();
        if (!gameOver) {
            setTimeout(gameLoop, gameSpeed);
        }
        return;
    }
    drawGrid();
    drawFood();
    drawSnake();
    if (!gameOver) {
        setTimeout(gameLoop, gameSpeed);
    }
}

function init() {
    drawGrid();
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 }
    ];
    generateFood();
    drawFood();
    drawSnake();
    document.addEventListener('keydown', handleKeyPress);
    setTimeout(gameLoop, gameSpeed);
}

init();
