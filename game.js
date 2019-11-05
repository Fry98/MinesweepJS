// DECALRATIONS
const images = [];
const canv = document.getElementById('playfield');
const ctx = canv.getContext('2d');
const TileState = {
  COVERED: 0,
  MARKED: 1,
  UNCOVERED: 2,
  EXPLODED: 3
};

let gameField = [];
let width;
let height;
let bombs;
let found;
let gameOver;
let firstRound;

// IMAGE LOADER
{
  let loaded = 0;

  for (let i = 0; i < 14; i++) {
    const newImg = new Image();
    newImg.src = `UI/${i}.png`;
    images.push(newImg);
    newImg.onload = () => {
      if (++loaded === 14) imageLoadCallback();
    };
  }
}

function imageLoadCallback() {

  // GAME BOOTSTRAP
  initGame(9, 9, 10);

  // BUTTON LISTENERS
  document.getElementById('bgr').onclick = () => initGame(9, 9, 10);
  document.getElementById('itr').onclick = () => initGame(16, 16, 40);
  document.getElementById('exp').onclick = () => initGame(30, 16, 99);

  // CANVAS LISTENERS
  canv.addEventListener('click', e => {
    if (gameOver) return;

    const mousePos = getMouseCoords(e);
    if (firstRound) {
      firstRound = false;
      while (gameField[mousePos.x][mousePos.y].bomb || gameField[mousePos.x][mousePos.y].count > 0) {
        setupField();
      }
    }

    if (gameField[mousePos.x][mousePos.y].bomb) {
      gameField[mousePos.x][mousePos.y].state = TileState.EXPLODED;
      drawCanvas(true);
      gameOver = true;
      return;
    }

    sweep(mousePos.x, mousePos.y);
    drawCanvas();
  });

  canv.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (gameOver) return;

    const mousePos = getMouseCoords(e);
    if (gameField[mousePos.x][mousePos.y].state === TileState.COVERED) {
      gameField[mousePos.x][mousePos.y].state = TileState.MARKED;
      if (gameField[mousePos.x][mousePos.y].bomb) found++;
    } else if (gameField[mousePos.x][mousePos.y].state === TileState.MARKED) {
      gameField[mousePos.x][mousePos.y].state = TileState.COVERED;
      if (gameField[mousePos.x][mousePos.y].bomb) found--;
    }

    firstRound = false;
    drawCanvas();

    if (found === bombs) endGame();
  });

  // NEW GAME INITIALIZATION
  function initGame(x, y, bombCount) {

    // SETUP CANVAS AND GLOBAL VARIABLES
    canv.width = x * 30;
    canv.height = y * 30;
    width = x;
    height = y;
    bombs = bombCount;
    found = 0;
    gameOver = false;
    firstRound = true;

    setupField();
    drawCanvas();
  }

  function setupField() {

    // SETUP EMPTY GAME FIELD
    gameField = [];
    for (let i = 0; i < width; i++) {
      gameField.push([]);
      for (let j = 0; j < height; j++) {
        gameField[i].push({
          count: 0,
          state: TileState.COVERED,
          bomb: false
        });
      }
    }

    // PLACE BOMBS
    let placed = 0;
    while (placed < bombs) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (!gameField[x][y].bomb) {
        gameField[x][y].bomb = true;
        increaseCount(x, y);
        placed++;
      }
    }
  }

  // DRAW TILES INTO CANVAS
  function drawCanvas(showBombs = false) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        switch (gameField[x][y].state) {
          case TileState.COVERED:
            if (showBombs && gameField[x][y].bomb) {
              ctx.drawImage(images[13], x * 30, y * 30, 30, 30);
              break;
            }
            ctx.drawImage(images[9], x * 30, y * 30, 30, 30);
            break;
          case TileState.MARKED:
            if (showBombs && !gameField[x][y].bomb) {
              ctx.drawImage(images[12], x * 30, y * 30, 30, 30);
              break;
            }
            ctx.drawImage(images[11], x * 30, y * 30, 30, 30);
            break;
          case TileState.UNCOVERED:
            if (!gameField[x][y].bomb) {
              ctx.drawImage(images[gameField[x][y].count], x * 30, y * 30, 30, 30);
            } else {
              ctx.drawImage(images[13], x * 30, y * 30, 30, 30);
            }
            break;
          case TileState.EXPLODED:
            ctx.drawImage(images[10], x * 30, y * 30, 30, 30);
            break;
        }
      }
    }
  }

  // UNCOVER SURROUNDING TILES
  function sweep(x, y) {
    if (
      x > -1 && x < width &&
      y > -1 && y < height &&
      gameField[x][y].state !== TileState.UNCOVERED
    ) {
      gameField[x][y].state = TileState.UNCOVERED;
      if (gameField[x][y].count > 0) return;
      sweep(x + 1, y);
      sweep(x - 1, y);
      sweep(x, y + 1);
      sweep(x, y - 1);
      sweep(x + 1, y + 1);
      sweep(x + 1, y - 1);
      sweep(x - 1, y + 1);
      sweep(x - 1, y - 1);
    }
  }

  // INCREASE BOMB COUNT IN SURROUNDING TILES
  function increaseCount(x, y) {
    tryIncrease(x + 1, y);
    tryIncrease(x - 1, y);
    tryIncrease(x, y + 1);
    tryIncrease(x, y - 1);
    tryIncrease(x + 1, y + 1);
    tryIncrease(x + 1, y - 1);
    tryIncrease(x - 1, y + 1);
    tryIncrease(x - 1, y - 1);

    function tryIncrease(x, y) {
      if (x > -1 && x < width && y > -1 && y < height) {
        gameField[x][y].count++;
      }
    }
  }

  // DRAW END SCREEN
  function endGame() {
    gameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.font = 'bold 45px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.fillText('YOU WIN!', canv.width / 2, canv.height / 2);
  }

  // GET MOUSE COORDINATES ON GAME FIELD
  function getMouseCoords(e) {
    const rect = canv.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / 30),
      y: Math.floor((e.clientY - rect.top) / 30)
    };
  }
}
