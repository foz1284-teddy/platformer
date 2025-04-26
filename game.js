const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
  x: 50,
  y: 350,
  width: 30,
  height: 30,
  color: 'blue',
  speed: 5
};

// Portal
const portal = {
  x: 700,
  y: 350,
  width: 30,
  height: 30,
  color: 'purple'
};

let gameWon = false;

// Listen for keyboard input
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    player.x += player.speed;
  }
});

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ground
  ctx.fillStyle = '#654321';
  ctx.fillRect(0, 380, canvas.width, 20);

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw portal
  ctx.fillStyle = portal.color;
  ctx.fillRect(portal.x, portal.y, portal.width, portal.height);

  // Check win condition
  if (player.x + player.width >= portal.x) {
    gameWon = true;
  }

  if (gameWon) {
    ctx.fillStyle = 'black';
    ctx.font = '48px sans-serif';
    ctx.fillText('YOU WIN!', 300, 200);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Start the game
gameLoop();
