const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
  x: 50,
  y: 350,
  width: 30,
  height: 30,
  color: 'blue',
  speed: 2,
  velocityY: 0,
  jumpForce: -13, // stronger jump
  gravity: 0.4,   // slightly stronger gravity
  grounded: true
};

// Portal
const portal = {
  x: 750,
  y: 350,
  width: 30,
  height: 30,
  color: 'purple'
};

// Spikes
const spikes = [
  { x: 400, y: 360, width: 20, height: 20 },
  { x: 600, y: 360, width: 20, height: 20 }
];

let keys = {};
let gameWon = false;
let gameLost = false;

// Listen for keyboard input
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Movement
  if (keys['ArrowRight']) {
    player.x += player.speed;
  }
  if (keys['ArrowLeft']) {
    player.x -= player.speed;
  }
  if (keys['ArrowUp'] && player.grounded) {
    player.velocityY = player.jumpForce;
    player.grounded = false;
  }

  // Apply gravity
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  // Ground collision
  if (player.y + player.height >= 380) {
    player.y = 380 - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Draw ground
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, 380, canvas.width, 20);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw portal
  ctx.fillStyle = portal.color;
  ctx.fillRect(portal.x, portal.y, portal.width, portal.height);

  // Draw spikes
  ctx.fillStyle = 'red';
  spikes.forEach(spike => {
    ctx.beginPath();
    ctx.moveTo(spike.x, spike.y + spike.height);
    ctx.lineTo(spike.x + spike.width / 2, spike.y);
    ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
    ctx.closePath();
    ctx.fill();
  });

  // Check collision with spikes
  spikes.forEach(spike => {
    if (player.x < spike.x + spike.width &&
        player.x + player.width > spike.x &&
        player.y < spike.y + spike.height &&
        player.y + player.height > spike.y) {
      gameLost = true;
    }
  });

  // Check win condition
  if (player.x + player.width >= portal.x) {
    gameWon = true;
  }

  if (gameWon) {
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('YOU WIN!', 300, 200);
  } else if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('YOU LOSE!', 300, 200);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Start the game
gameLoop();
