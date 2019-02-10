const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const fps = 60;
const MIN_SPEED = 0;
const MAX_SPEED = 10;
const MAX_OBSTACLES = 75;

const OBSTACLE_IMAGES = {
  'tree': new Image(),
  'rock': new Image()
};
OBSTACLE_IMAGES['tree'].src = 'tree.png';
OBSTACLE_IMAGES['rock'].src = 'rock.png';

const DEBUG = false;
 
let snowboarder = null;
let fpsInterval = null;
let then = null;
let obstacles = [];

let currentSpeed = 3;
let score = 0;

document.addEventListener('keydown', e => {
  switch(e.keyCode) {
    case 87:
      if (!snowboarder.dead) {
        snowboarder.speedUp();
      }
      break;
    case 65:
      if (!snowboarder.dead) {
        snowboarder.goLeft();
      }
      break;
    case 83:
      if (!snowboarder.dead) {
        snowboarder.slowDown();
      }
      break;
    case 68:
      if (!snowboarder.dead) {
        snowboarder.goRight();
      }
      break;
    default:
      break;
  }
});

class Obstacle {
  constructor(x, y) {
    const type = Math.round(Math.random());
    this.x = x;
    this.y = y ? y : -100;
    this.width = type ? 25 : 100;
    this.height = type ? 100 : 50;
    this.type = type ? 'tree':'rock'
  }

  draw() {
    context.fillStyle = 'black';
    context.drawImage(OBSTACLE_IMAGES[this.type], this.x - this.width / 2, this.y - this.height  / 2, this.width, this.height);
  }

  collide(target) {
    if (DEBUG) {
      context.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      context.strokeRect(target.x - target.width / 2, target.y - target.height / 2, target.width, target.height);
    }

    return !(
      ((this.y + this.height / 2) < (target.y)) ||
      (this.y - this.height / 2 > (target.y + target.height / 2)) ||
      ((this.x + this.width / 2) < target.x) ||
      (this.x - this.width / 2 > (target.x + target.width / 2))
    );
  }

  frame() {
    this.y += currentSpeed;
  }
}

class Snowboarder {
  constructor() {
    this.x = WIDTH / 2;
    this.y = HEIGHT - 300;
    this.width = 20;
    this.height = 100;
    this.image = new Image();
    this.image.src = 'snowboarder.png';
    this.dead = false;
  }

  draw() {
    context.drawImage(this.image, this.x - 50 / 2, this.y - this.height  / 2, 50, this.height);
  }

  goLeft() {
    this.x -= 10;
  }

  goRight() {
    this.x += 10;
  }

  slowDown() {
    if (currentSpeed > MIN_SPEED) {
      currentSpeed--;
      this.y += 25;
    }
  }

  kill() {
    this.dead = true;
    this.image = new Image();
    this.image.src = 'snowboarder_dead.png';
    currentSpeed = 0;
  }

  speedUp() {
    if (currentSpeed < MAX_SPEED) {
      currentSpeed++;
      this.y -= 25;
    }
  }
}

function clearScreen() {
  context.fillStyle = '#FFF';
  context.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawScore() {
  context.font = '30px Arial';
  context.fillStyle = '#6DD5FA';
  context.fillText(`Score: ${Math.round(score)}`, 50, 50);
}

function drawInstructions() {
  context.font = '20px Arial';
  context.fillStyle = 'black';
  context.fillText('W -> GO FASTER', WIDTH - 275, 50);
  context.fillText('S -> GO SLOWER', WIDTH - 275, 75);
  context.fillText('A -> GO LEFT', WIDTH - 275, 100);
  context.fillText('D -> GO RIGHT', WIDTH - 275, 125);
}

function drawObstacles() {
  obstacles.forEach((obs, i) => {
    if (obs.y >= HEIGHT + 200) {
      obstacles.splice(i, 1);
    } else {
      if (!snowboarder.dead) {
        obs.frame();
        if (obs.collide(snowboarder)) {
          snowboarder.kill();
        }
      }
      obs.draw();
    }
  });
}

function calculateScore() {
  score = score + currentSpeed * 0.1;
}

function draw() {
  clearScreen();
  drawObstacles();
  snowboarder.draw();
  drawScore();
  drawInstructions();
}

function generateObstacles() {
  if (obstacles.length < MAX_OBSTACLES) {
    if (Math.round(Math.random())) {
      obstacles.push(new Obstacle(Math.round(Math.random() * WIDTH), null));
    }
  }
}

function frame() {
  calculateScore();
  generateObstacles();
  draw();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);
  let now = Date.now();
  let elapsed = now - then;

  if (elapsed > fpsInterval && snowboarder) {
    then = now - (elapsed % fpsInterval);
    frame();
  }
}

function main() {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  fpsInterval = 1000 / fps;
  then = Date.now();

  snowboarder = new Snowboarder();
  for(let i=0; i<=25; i++) {
    obstacles.push(new Obstacle(
      Math.round(Math.random() * WIDTH),
      Math.round(Math.random() * window.innerHeight / 2)
    ));
  }
  gameLoop();
}

main();