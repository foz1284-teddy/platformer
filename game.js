const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cameraX = 0;

// Audio system
const synth = new MidiSynth();
let backgroundMusicInterval = null;
synth.setVolume(0);

// Audio controls
function toggleMute() {
  synth.setVolume(synth.gainNode.gain.value > 0 ? 0 : 0.3);
}

function playBackgroundMusic() {
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
  }
  
  const playMelody = () => {
    synth.playSequence(gameMelodies.background, 1800); // Faster tempo for more upbeat feel
  };
  
  playMelody();
  backgroundMusicInterval = setInterval(playMelody, 6000); // Repeat every 6 seconds to match the new melody length
}

function stopBackgroundMusic() {
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
    backgroundMusicInterval = null;
  }
  synth.stopAll();
}

// Sprite loading
const sprites = {
  player: new Image(),
  spike: new Image(),
  portal: new Image(),
  ground: new Image()
};

let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;

function checkAllSpritesLoaded() {
  spritesLoaded++;
  if (spritesLoaded === totalSprites) {
    startGame();
  }
}

// Load sprites
sprites.player.onload = checkAllSpritesLoaded;
sprites.spike.onload = checkAllSpritesLoaded;
sprites.portal.onload = checkAllSpritesLoaded;
sprites.ground.onload = checkAllSpritesLoaded;

sprites.player.src = 'sprites/player.svg';
sprites.spike.src = 'sprites/spike.svg';
sprites.portal.src = 'sprites/portal.svg';
sprites.ground.src = 'sprites/ground.svg';

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
  grounded: true,
  facingRight: true
};

const levels = [
  {
    portal: { x: 1600, y: 350 },
    spikes: [
      { x: 400, y: 360, width: 20, height: 20, name:"spike1" },
      { x: 800, y: 360, width: 20, height: 20, name:"spike2" },
      { x: 1200, y: 360, width: 20, height: 20, name:"spike3" }
    ]
  },
  {
    portal: { x: 1970, y: 350 },
    spikes: [
      { x: 500, y: 340, width: 20, height: 40 },
      { x: 900, y: 340, width: 20, height: 40 },
      { x: 1300, y: 340, width: 20, height: 40 },
      { x: 1700, y: 340, width: 20, height: 40 }
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
  if (e.key === 'm' || e.key === 'M') {
    toggleMute();
  }
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
    playBackgroundMusic();
    requestAnimationFrame(gameLoop);
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
      player.facingRight = true;
    }
    if (keys['ArrowLeft']) {
      player.x -= player.speed;
      player.facingRight = false;
    }
    if (keys['ArrowUp'] && player.grounded) {
      player.velocityY = player.jumpForce;
      player.grounded = false;
      //synth.playSequence(gameMelodies.jump, 240);
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
  ctx.drawImage(sprites.ground, -cameraX, 380, 2000, 20);

  // Draw player
  ctx.save();
  if (!player.facingRight) {
    ctx.translate(player.x - cameraX + player.width, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprites.player, 0, 0, player.width, player.height);
  } else {
    ctx.drawImage(sprites.player, player.x - cameraX, player.y, player.width, player.height);
  }
  ctx.restore();

  // Draw portal
  ctx.drawImage(sprites.portal, portal.x - cameraX, portal.y, 30, 30);

  // Draw spikes
  spikes.forEach(spike => {
    ctx.drawImage(sprites.spike, spike.x - cameraX, spike.y, spike.width, spike.height);
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
    if (!gameWon) {
      gameWon = true;
      stopBackgroundMusic();
      //synth.playSequence(gameMelodies.win, 120);
    }
  }

  if (gameWon) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('Level Complete! Press Enter.', 150, 200);
  } else if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('You Lost! Press Enter to Retry.', 120, 200);
    //synth.playSequence(gameMelodies.lose, 120);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Start game with music
function startGame() {
  playBackgroundMusic();
  gameLoop();
}
