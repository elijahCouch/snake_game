const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;
const snakeColor = "#008000";

let gameSpeed = 200;
let gameRunning = true;

const settingsPanel = document.querySelector(".settings-panel");
const speedSlider = document.getElementById("speedSlider");
speedSlider.addEventListener("input", () => {
  gameSpeed = 500 - parseInt(speedSlider.value) * 100;
  if (gameSpeed < 100) {
    gameSpeed = 100;
  }
  saveSettings();
});

let wallCollisionEnabled = false;

const wallCollisionCheckbox = document.getElementById("wallCollision");
wallCollisionCheckbox.addEventListener("change", () => {
  wallCollisionEnabled = wallCollisionCheckbox.checked;
  saveSettings();
});

let snake = [{ x: 5, y: 5 }];
let dx = 1;
let dy = 0;
let foodX;
let foodY;

let score = 0;
let gameOver = false;

let leftRightArrowsOnlyEnabled = false;
const leftRightArrowsOnlyCheckbox = document.getElementById("leftRightOnly");
leftRightArrowsOnlyCheckbox.addEventListener("change", () => {
  leftRightArrowsOnlyEnabled = leftRightArrowsOnlyCheckbox.checked;
  saveSettings();
});

function saveSettings() {
  const settings = {
    gameSpeed: gameSpeed,
    wallCollisionEnabled: wallCollisionEnabled,
    leftRightArrowsOnlyEnabled: leftRightArrowsOnlyEnabled,
  };
  localStorage.setItem("snakeGameSettings", JSON.stringify(settings));
}



//overview of drawGrid function it sets a grid that the snake and food wil be drawn on 
function drawGrid() {
  //this line clears the canvas so we can draw a nice new pretty grid
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //then we use a nested loop to iterate through the rows and columens of the grid and for eath cell
  // it sets the ctx.strokestile to #ddd color light rgay and then calls the ctx.strokerect() to draw the rectanguler grid line.
  //the grid lines are drawn using the gridSize variable to determine the size of each cell
  //the gridSize is multiplied by the row and columens indices to he position the grid lines corretly on the canvas this is importent to have a nice clean grid to show off
  //the grid dimensions is the number of rows and culmens is caltetde based on the canavs dimesion and the grid size
  //the row var is set to the canvas.hegiht / gridsize and the cols varible is set to  canavas.width <span class="typewriter-part">/ this makse sures the the grid is sized properly to issure a good tight fit in the canvas so we can show off are skills
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      ctx.strokeStyle = "#ddd";
      ctx.strokeRect(j * gridSize, i * gridSize, gridSize, gridSize);
    }
  }
}





// overview the draw snake funciton is called whenver the game state changes so when the snake movez or grows it make sures the snake is porpely disyaped on the canvas
function drawSnake() {
  //the function itertatse through the snake array witch contains the cordantes of each segment of the snake so each grid cell
  //for each segment it setsthe fill style based on wether the segment is the head of the snake so  the first index 0 so index === 0 or a part of the snake body so not the head so index !== 0 
  //the head is drawn in the prettyist bright green color and the body is drawn in the a draker green to indacte to the user that the head is a dffirent color then the body
  //the function then useth ctx.fillrect() method to draw a scquare for each cell of thsnake using the segments cordnatitse and the grid size varibel to determin the size and postion of the square
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#00ff00" : "#008000";
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize,
      gridSize
    );
    //if the cell is the head of the snake ie index === 0 the function then add s some additinal visuel pleasing elmens the butifule red eyes this is the main big chunk of crap in the function
    // it sets the fill style to red depending on the dirction of the snake is moving dx and dy varibale it draws two small red squars to indacte snake eyes
    //this helps little children know the snake is reall
    if (index === 0) {
      ctx.fillStyle = "#ff0000";
      if (dx === 1) {
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.8,
          segment.y * gridSize + gridSize * 0.25,
          2,
          2
        );
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.8,
          segment.y * gridSize + gridSize * 0.75,
          2,
          2
        );
      } else if (dx === -1) {
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.2,
          segment.y * gridSize + gridSize * 0.25,
          2,
          2
        );
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.2,
          segment.y * gridSize + gridSize * 0.75,
          2,
          2
        );
      } else if (dy === 1) {
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.25,
          segment.y * gridSize + gridSize * 0.8,
          2,
          2
        );
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.75,
          segment.y * gridSize + gridSize * 0.8,
          2,
          2
        );
      } else if (dy === -1) {
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.25,
          segment.y * gridSize + gridSize * 0.2,
          2,
          2
        );
        ctx.fillRect(
          segment.x * gridSize + gridSize * 0.75,
          segment.y * gridSize + gridSize * 0.2,
          2,
          2
        );
      }
    }
  });
}







//this bloke is responbale for rendering the food items on the beutifully drawn canvas 
function drawFood() {
  //the funciton sets the fill style to red using ctx.fillStyle = "#ff0000";
  ctx.fillStyle = "#ff0000";
  //it then usse the fillrect() method to draw a square for each food item using the foodX and foodY varibales to determin the postion of the square
  //the gridSize varibale is used to determin the size of the square
  ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
}



//this varibable is to keep track of how many fruits or apple or red cells the snake has eaten to track if all the red cells or apple or fruit are gone then we regrenrate them so the snake can keep growing wow!
let fruitsEaten = 0; 



//this ugly bloke is used for genrating the postions of the food cells on the butiflyy drawn canavs and to make sure they dont spawn on the snake.
function generateFood() {
  //his bloke starts by setting the collison to true so we can run are while loop
  let collision = true;
  //it then runs he while loop that continesu until the vaild food postion is found so we dont put a fruit on the snake
  while (collision) {
    //lets dig into how we do this. inside this looop the funciton uses two empty arrays foodx and foody to store the  x an`y coronatse of the food cells affciontly
    foodX = [];
    foodY = [];
    //he funciton then uses a for loop to genrate the cornadtes of he two food cells for each item it checks if the gernated corinatse arready exist in the food x and foody arrays if so it gernates a new cooordinates until a uniq pair is found
    for (let i = 0; i < 2; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * cols);
        y = Math.floor(Math.random() * rows);
      } while (foodX.includes(x) && foodY.includes(y));
      //it adds the new coordinates to the foodx and foody arrays
      foodX.push(x);
      foodY.push(y);
    }
    //after gettig the new coordinates for the two food cell the function sets the collsion valibale to false so it doisnt keep running
    collision = false;
    //then it runs a for loop to check if the new food postion collides with the snake, if ta collison is detected the function sets the collsion varibale
    // to true and breaks out of the inner loop if no collsion is detect the function exits the while loop and returns leaving the foodx and foody arrays with the vaild food coordinates
    for (let i = 0; i < snake.length; i++) {
      if ((foodX[0] === snake[i].x && foodY[0] === snake[i].y) || (foodX[1] === snake[i].x && foodY[1] === snake[i].y)) {
        collision = true;
        break;
      }
    }
  }
}


//this lad is the main function in this game, it handles movement of the snake the collsion detection and the growth of the snake when it eats the red cells
function moveSnake() {
  // it first creates a new object head the repersens the new postion of the snakes head the new postion is calulated by adding dx and the dy values wich respents the dirctions the snake is moving to the currect x an dy corr3natse of the snakse head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  //it then calls the handlewallocllsion function to check if the new head postion would result in a snake colding with the wall if collsion is dett the function returns false indcating game is over
  if (!handleWallCollision(head)) {
    return false;
  }

//then  checks if the new head postion is on top of the red cell  if ocllsion with the red cell is detected  the new head postion is addet to the begging of the snake array which grows the snake
  let ateFood = false;
  for (let i = 0; i < 2; i++) {
    if (head.x === foodX[i] && head.y === foodY[i]) {
      snake.unshift(head);
      // the coordinates of the eaten food item are removed from the foodx and foody arrays
      foodX.splice(i, 1);
      foodY.splice(i, 1);
      // the fruitsEaten varibale is incremented by 1 to keep track of how many red cells the snake has eaten to determin if it needs to regerante it regregrates the cell if the varibale is === 2
      fruitsEaten++;
      if (fruitsEaten === 2) { 
        generateFood();
        //and then resets the varibale to 0
        fruitsEaten = 0; 
      }
      //then we add plue 1 to the score
      score++;
      //we make sure the score div is updates to show the user he has gain a point
      document.getElementById("score").textContent = score;
      // the atefood flag is set to true to tell that the snake has eat a cell
      ateFood = true;
      break; 
    }
  }
//the first conditon checks if the atefood flag is false which means the snake head did not collid with any food items
  if (!ateFood) {
    //inside this if statment we have a for loop that iterat[ through the snake array starting from the second element index 1 this is becuse the first element of the snake array is the head elment which weve aready checked for collsion
    for (let i = 1; i < snake.length; i++) {
      //the loop checks is the dead postion the x and y coordnates matches any of the existing snake body segments excluding the head if a collsion is detect
      if (head.x === snake[i].x && head.y === snake[i].y) {
        //he snake array is reset to a singe snake body cell and resets at the center of the grid 
        snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        //the dx and dy values are reset to 1 and 0 to m!e he snake move right
        dx = 1;
        dy = 0;
        //then we call the gameover function to incate the game is over
        gameOverHandler();
        //then we return false to indicate the game is over
        return false;
      }
    }
    //if no collsion with the snakes body is detect the function adds the new head postion te tho beggining of the snake array moning the snake forward
    snake.unshift(head);
    //then removes the last element of the snake array which is the tail making the snake move forward by removeing the the last element of the array so the tail gives the elsion of the snake moving so the combnation adding the head and taking away the tail will give the elusion of it moving
    snake.pop();
  }

  return true;
}




//overview this bloke is incharge of checkig if the new postion of the snake head would result in a collion with the walls of the game grid 
  //the lad takes a head object as a parameter which represents the new postion of he snakes head
function handleWallCollision(head) {
//it checks if wallcollsionenabled is true which determens if the snake dies when hiting the wall
  if (wallCollisionEnabled) {
    //it checks if he head postion is out side of the game grid if head.x is less then 0  grreater or equal to the number of columens cols head.y is less then 0 or greater then or equal to he number of rows
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      //if so the it call the gameoverhandler function and returns false to  indacte the game is over
      gameOverHandler();
      return false;
    }
  } else {
     //if walcolssionenabeld is false  the lad simply cecks if he new head postion is outside of the game grid and returns false if it is without calling the gameoverhandler() function
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      return false;//this results in false so the snake will just stop and wait for the next keypress
    }
  }
  //if no wall collsion is deteced he function returns true allawing the game to continue
  return true;
}




//this is to display the current postion of he food cells
function drawFood() {
  //this lad sets the fillstyle of the cnavas context to "#ff0000" which color for red 
  ctx.fillStyle = "#ff0000";
  //the function then loops hrough the foodx and foody arrays to draw the food cells witch store the store the x and y cooordinatse of the two food cells on the grid
  for (let i = 0; i < 2; i++) {
    
    //for each food item the function calls the ctxfillrect() mothod to draw a square on the canavas  the prameters pased to fillrect() are foodx[i] * gridsize the x coordnatse of the food item    multiplied by the gridSize
    //to covert it to pixel coordinates

    //the gridSize prampieter is the width and height of the food item square
    ctx.fillRect(foodX[i] * gridSize, foodY[i] * gridSize, gridSize, gridSize);
  }
}





function handleKeyPress(event) {
  console.log(event.keyCode);
  const keyCode = event.keyCode;

  if (keyCode === 38 && gameOver) {
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
  document.getElementById("overlay").style.display = "flex";
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
  const savedSettings = JSON.parse(localStorage.getItem("snakeGameSettings"));
  if (savedSettings) {
    gameSpeed = savedSettings.gameSpeed;
    wallCollisionEnabled = savedSettings.wallCollisionEnabled;
    leftRightArrowsOnlyEnabled = savedSettings.leftRightArrowsOnlyEnabled;
    wallCollisionCheckbox.checked = wallCollisionEnabled;
    leftRightArrowsOnlyCheckbox.checked = leftRightArrowsOnlyEnabled;
  
    speedSlider.value = (500 - gameSpeed) / 100;
    updateSlider();
  }



  drawGrid();
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
  ];
  generateFood();
  drawFood();
  drawSnake();
  document.addEventListener("keydown", handleKeyPress);
  setTimeout(gameLoop, gameSpeed);
}




function updateSlider() {
  const percentage = ((speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min)) * 100;
  speedSlider.style.background = `linear-gradient(to right, #008000 0%, #008000 ${percentage}%, #fff ${percentage}%, #fff 100%)`;
}



init();