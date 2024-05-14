const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 31;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;
const snakeColor = "#008000";

let gameSpeed = 100;
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


// Function to handle touch events
function handleTouchStart(event) {
  const touchStartY = event.touches[0].clientY; // Get the initial touch position
  document.addEventListener('touchend', function handleTouchEnd(event) {
    const touchEndY = event.changedTouches[0].clientY; // Get the final touch position
    const deltaY = touchEndY - touchStartY;
    // If swipe distance is large enough and in upward direction, simulate up arrow key press
    if (deltaY < -50) {
      handleKeyPress({ keyCode: 38 }); // Simulate pressing the up arrow key
    }
    document.removeEventListener('touchend', handleTouchEnd); // Remove the touchend listener
  }, { once: true }); // Use { once: true } to ensure the touchend event listener is removed after firing once
}

// Add touch event listener to the document
document.addEventListener('touchstart', handleTouchStart);



// Function to handle touch events for swipe controls
function handleSwipeControls() {
  let touchStartX = 0;
  let touchStartY = 0;

  // Add touch start event listener to the document
  document.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  });
   
  // Add touch end event listener to the document
  document.addEventListener('touchend', function(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine the direction of the swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Right swipe
        handleKeyPress({ keyCode: 39 }); // Simulate pressing the right arrow key
      } else {
        // Left swipe
        handleKeyPress({ keyCode: 37 }); // Simulate pressing the left arrow key
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Down swipe
        handleKeyPress({ keyCode: 40 }); // Simulate pressing the down arrow key
      } else {
        // Up swipe
        handleKeyPress({ keyCode: 38 }); // Simulate pressing the up arrow key
      }
    }
  });
}

// Call the function to handle swipe controls
handleSwipeControls();














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
  // Set collision to true to enter the while loop
  let collision = true;
  // Keep generating new coordinates until a unique pair is found
  while (collision) {
    // Reset foodX and foodY arrays
    foodX = [];
    foodY = [];
    // Generate coordinates for the food cell
    let x, y;
    do {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
    } while (isCollisionWithSnake(x, y)); // Check if the generated coordinates collide with the snake
    // Add the new coordinates to the foodX and foodY arrays
    foodX.push(x);
    foodY.push(y);
    // Set collision to false to exit the while loop
    collision = false;
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
      if (fruitsEaten === 1) { 
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

function isCollisionWithSnake(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (x === snake[i].x && y === snake[i].y) {
      return true; // Collision detected
    }
  }
  return false; // No collision detected
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




//this funcinso job is to handling keybeard input events and upading the snakes directions 
function handleKeyPress(event) {
  console.log(event.keyCode);
  const keyCode = event.keyCode;
//checks if gameover flag is true and if keypress for uparrow is true if both are tru then it calls the restartgame function and continues
  if (keyCode === 38 && gameOver) {
    restartGame();
    return;
  }
//next it checks if the leftRightArrowsOnlyEnabled falg is set to true if it is the function handles the left and right arrow keys press  and updats the dx and dy values to change the snakes dirction
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
  } else { //if letRightarrowkeysenabled is set to false then it dose these switch statemens to move the snake around via all arrow keys 
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


//this is the gameoverhandle this will dispaly the game over text what to do to continue playing
function gameOverHandler() {
  //it first sets the gameOver vairbale to true
  gameOver = true;
  //then it gets the ovelay id from he html and  and sets the style.dispaly o = fleg the value for displying the property makse the target elmets a flex container allowing its child elements to be laid out using the css flexbox system
  document.getElementById("overlay").style.display = "flex";
}


//the restartgame function refreshs the game/page
function restartGame() {
  window.location.reload();
}


//this is the main part of what runs the game
function gameLoop() {
// it first calls the movesnake() which handles he movmevnt of the snake and checks for collsion
// if the moveSnake() returns false incating the game is over the function dose
   if (!moveSnake()) {
    //calls he drawgrid() funciton
    drawGrid();
    //then calls the drawFood() function
    drawFood();
    //and the drawsnake function
    drawSnake();
    //if the game is over the function  sets a timeout to call it self again after the gamespeed interval  this creatse the game loop where the game state is updatined and the value canvas is redrawn at a regular interval
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


//this function starts the entire game starts all the functions to get things chugging along
function init() {
  //gets settings frome the localstorange
  const savedSettings = JSON.parse(localStorage.getItem("snakeGameSettings"));
  //if there are saved settings it will set all the varibales that have been saved in the localstorange will be updated
  if (savedSettings) {
    gameSpeed = savedSettings.gameSpeed;
    wallCollisionEnabled = savedSettings.wallCollisionEnabled;
    leftRightArrowsOnlyEnabled = savedSettings.leftRightArrowsOnlyEnabled;
    wallCollisionCheckbox.checked = wallCollisionEnabled;
    leftRightArrowsOnlyCheckbox.checked = leftRightArrowsOnlyEnabled;
  
    speedSlider.value = (500 - gameSpeed) / 100;
    updateSlider();
  }


//then it calls the drawgird function 
  drawGrid();
  //then it sets the snake to the the postion and adds another bodycell 
  snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
  ];
  //then calls all these functions
  generateFood();
  drawFood();
  drawSnake();
  document.addEventListener("keydown", handleKeyPress);
  //and runs this setTimout method to give time to set up everthing
  setTimeout(gameLoop, gameSpeed);
}



//this function is to update the slider so when the game refreahes the slider stays in the same place
function updateSlider() {
  const percentage = ((speedSlider.value - speedSlider.min) / (speedSlider.max - speedSlider.min)) * 100;
  speedSlider.style.background = `linear-gradient(to right, #008000 0%, #008000 ${percentage}%, #fff ${percentage}%, #fff 100%)`;
}


//calls the init() function to start everything
init();