const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');

    const snakeSize = 20;
    const gridSize = 20;

    let snake = [
      { x: 40, y: 40 },
      { x: 40, y: 60 },
      { x: 40, y: 80 }
    ];

    let dx = gridSize;
    let dy = 0;

    let food;
    let foodImage = new Image();
    foodImage.src = 'apple.jpg'; // Replace 'apple.png' with the path to your image

    let obstacles = [];
    let speedIncreaseFactor = 1;

    let score = 0;
    let highScore = 0;

    let gameInterval;

    // Touch control variables
    let touchStartX, touchStartY;

    function drawSnake() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawObstacles(); // Draw obstacles first
      snake.forEach(drawSnakePart);
      drawScore();
    }

    function drawSnakePart(snakePart) {
      ctx.fillStyle = '#8B4513'; // Brown color
      ctx.fillRect(snakePart.x, snakePart.y, snakeSize, snakeSize);
    }

    function moveSnake() {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      snake.unshift(head);

      const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
      if (!hasEatenFood) {
        snake.pop();
      } else {
        placeFood();
        increaseScore();
      }

      if (speedIncreaseFactor > 1 && snake.length % 5 === 0) {
        increaseSpeed();
      }
    }

    function placeFood() {
      food = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
      };
    }

    function drawFood() {
      // Draw the food image with a larger size
      ctx.drawImage(foodImage, food.x, food.y, snakeSize * 1, snakeSize * 1);
    }

    function increaseSpeed() {
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 100 / speedIncreaseFactor);
    }

    function increaseScore() {
      score += 10;
      updateScore();
    }

    function updateScore() {
      if (score > highScore) {
        highScore = score;
        document.getElementById('high-score').textContent = 'High Score: ' + highScore;
      }
      drawScore();
    }

    function drawScore() {
      ctx.fillStyle = '#FFFFFF'; // White color
      ctx.font = '14px Arial';
      ctx.fillText('Score: ' + score, 10, 20);
    }

    function isCollision(obj1, obj2) {
      return obj2.some(part => (
        obj1.x < part.x + snakeSize &&
        obj1.x + snakeSize > part.x &&
        obj1.y < part.y + snakeSize &&
        obj1.y + snakeSize > part.y
      ));
    }

    function checkCollision() {
      const collidedWithWall =
        snake[0].x < 0 ||
        snake[0].x >= canvas.width ||
        snake[0].y < 0 ||
        snake[0].y >= canvas.height;

      const collidedWithSelf = snake.slice(1).some(part => part.x === snake[0].x && part.y === snake[0].y);

      const collidedWithObstacle = isCollision(snake[0], obstacles);

      return collidedWithWall || collidedWithSelf || collidedWithObstacle;
    }

    function gameLoop() {
      if (checkCollision()) {
        showGameOverModal();
        return;
      }

      moveSnake();
      drawSnake();
      drawFood();
    }

    function drawObstacles() {
      ctx.fillStyle = '#808080'; // Grey color
      obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, snakeSize * 1, snakeSize * 1); // Larger obstacles
      });
    }

    function startGame(level) {
      clearInterval(gameInterval);
      score = score;
      updateScore();

      switch (level) {
        case 1:
          speedIncreaseFactor = 1;
          obstacles = [];
          break;
        case 2:
          speedIncreaseFactor = 1;
          generateObstacles();
          break;
        case 3:
          speedIncreaseFactor = 2;
          obstacles = [];
          break;
        case 4:
          speedIncreaseFactor = 2;
          generateObstacles();
          break;
        default:
          break;
      }

      placeFood();
      gameInterval = setInterval(gameLoop, 100 / speedIncreaseFactor);
    }

    function generateObstacles() {
      obstacles = [];
      for (let i = 0; i < 5; i++) {
        let obstacle;
        do {
          obstacle = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
            y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
          };
        } while (isCollision(obstacle, snake) || isCollision(obstacle, obstacles));

        obstacles.push(obstacle);
      }
    }

    function pauseGame() {
      clearInterval(gameInterval);
    }

    function resetGame() {
      score = 0;
      hideGameOverModal();
      clearInterval(gameInterval);
      snake = [
        { x: 40, y: 40 },
        { x: 40, y: 60 },
        { x: 40, y: 80 }
      ];
      dx = gridSize;
      dy = 0;
      placeFood();
      drawSnake();
      drawFood();
    }

    function showGameOverModal() {
      document.getElementById('finalScore').textContent = score;
      document.getElementById('myModal').style.display = 'block';
    }

    function hideGameOverModal() {
      document.getElementById('myModal').style.display = 'none';
    }

    document.addEventListener('keydown', changeDirection);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);

    function handleTouchStart(event) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }

    function handleTouchMove(event) {
      if (!touchStartX || !touchStartY) {
        return;
      }

      const touchEndX = event.touches[0].clientX;
      const touchEndY = event.touches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      // Determine the direction based on the swipe
      if (Math.abs(dx) > Math.abs(dy)) {
        // Swipe is more horizontal
        if (dx > 0) {
          // Swipe right
          changeDirection({ key: 'ArrowRight' });
        } else {
          // Swipe left
          changeDirection({ key: 'ArrowLeft' });
        }
      } else {
        // Swipe is more vertical
        if (dy > 0) {
          // Swipe down
          changeDirection({ key: 'ArrowDown' });
        } else {
          // Swipe up
          changeDirection({ key: 'ArrowUp' });
        }
      }

      // Reset touch start coordinates
      touchStartX = null;
      touchStartY = null;
    }

    function changeDirection(event) {
      const keyPressed = event.key;
      switch (keyPressed) {
        case 'ArrowUp':
          if (dy !== gridSize) {
            dx = 0;
            dy = -gridSize;
          }
          break;
        case 'ArrowDown':
          if (dy !== -gridSize) {
            dx = 0;
            dy = gridSize;
          }
          break;
        case 'ArrowLeft':
          if (dx !== gridSize) {
            dx = -gridSize;
            dy = 0;
          }
          break;
        case 'ArrowRight':
          if (dx !== gridSize) {
            dx = gridSize;
            dy = 0;
          }
          break;
      }
    }

    placeFood();