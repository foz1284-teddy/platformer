const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cameraX = 0;



// Player
const player = {
  x: 50,
  y: 350,
  width: 30,
  height: 30,
  color: 'blue',
  speed: 2,
  velocityY: 0,
  jumpForce: -15,
  gravity: 0.4,
  grounded: true
};

const levels = [
  {
    portal: { x: 1600, y: 350 },
    spikes: [
      { x: 400, y: 360, width: 20, height: 20 },
      { x: 800, y: 360, width: 20, height: 20 },
      { x: 1200, y: 360, width: 20, height: 20 }
    ]
  }
];

let currentLevel = 0;
let keys = {};
let gameWon = false;
let gameLost = false;

function resetPlayer() {
  player.x = 50;
  player.y = 350;
  player.velocityY = 0;
  player.grounded = true;
}

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if ((gameWon || gameLost) && e.key === 'Enter') {
    if (gameWon) {
      currentLevel++;
      if (currentLevel >= levels.length) {
        currentLevel = 0; // Loop back to first level
      }
    }
    resetPlayer();
    gameWon = false;
    gameLost = false;
    requestAnimationFrame(gameLoop); // <-- this is the fix
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cameraX = player.x - canvas.width / 2;
  if (cameraX < 0) cameraX = 0;
  
  if (!gameWon && !gameLost) {
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

    if (player.x < 0) player.x = 0;
  }

  // Get current level info
  const portal = levels[currentLevel].portal;
  const spikes = levels[currentLevel].spikes;

// Draw ground
ctx.fillStyle = '#654321';
ctx.fillRect(-cameraX, 380, 2000, 20); // Wider than screen

// Draw player
ctx.fillStyle = player.color;
ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);

// Draw portal
ctx.fillStyle = 'purple';
ctx.fillRect(portal.x - cameraX, portal.y, 30, 30);

// Draw spikes
ctx.fillStyle = 'red';
spikes.forEach(spike => {
  ctx.beginPath();
  ctx.moveTo(spike.x - cameraX, spike.y + spike.height);
  ctx.lineTo(spike.x - cameraX + spike.width / 2, spike.y);
  ctx.lineTo(spike.x - cameraX + spike.width, spike.y + spike.height);
  ctx.closePath();
  ctx.fill();
});


  // Check collisions with spikes
  spikes.forEach(spike => {
    if (player.x < spike.x + spike.width &&
        player.x + player.width > spike.x &&
        player.y < spike.y + spike.height &&
        player.y + player.height > spike.y) {
      gameLost = true;
    }
  });

  // Check win condition
  if (player.x + player.width >= portal.x &&
      player.x <= portal.x + 30 &&
      player.y + player.height >= portal.y &&
      player.y <= portal.y + 30) {
    gameWon = true;
  }

  if (gameWon) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('Level Complete! Press Enter.', 150, 200);
  } else if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('You Lost! Press Enter to Retry.', 120, 200);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
