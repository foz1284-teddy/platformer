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

// Scoring system
const score = {
  points: 0,
  highScore: localStorage.getItem('highScore') || 0,
  jumpCount: 0,
  distance: 0,
  lastX: 50, // Starting X position
  combo: 0,
  maxCombo: 0
};

// Score multipliers and points
const SCORE_VALUES = {
  JUMP: 10,
  DISTANCE: 1, // Points per pixel moved
  COMBO_MULTIPLIER: 1.5,
  LEVEL_COMPLETE: 1000,
  SPIKE_HIT: -100
};

// Update score display
function drawScore() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${Math.floor(score.points)}`, 20, 30);
  ctx.fillText(`High Score: ${Math.floor(score.highScore)}`, 20, 60);
  ctx.fillText(`Combo: ${score.combo}x`, 20, 90);
}

// Update score
function updateScore(type, value = 1) {
  switch(type) {
    case 'jump':
      score.jumpCount++;
      score.combo++;
      score.points += SCORE_VALUES.JUMP * (1 + (score.combo * 0.1));
      break;
    case 'distance':
      score.distance += value;
      score.points += SCORE_VALUES.DISTANCE * value;
      break;
    case 'levelComplete':
      score.points += SCORE_VALUES.LEVEL_COMPLETE * (1 + (score.combo * 0.1));
      if (score.points > score.highScore) {
        score.highScore = score.points;
        localStorage.setItem('highScore', score.highScore);
      }
      break;
    case 'spikeHit':
      score.points += SCORE_VALUES.SPIKE_HIT;
      score.combo = 0;
      break;
  }
  
  // Update max combo
  if (score.combo > score.maxCombo) {
    score.maxCombo = score.combo;
  }
}

// Reset score for new level
function resetScore() {
  score.points = 0;
  score.jumpCount = 0;
  score.distance = 0;
  score.lastX = 50;
  score.combo = 0;
}

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
    resetScore();
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
      // Update distance score
      const distance = player.x - score.lastX;
      if (distance > 0) {
        updateScore('distance', distance);
        score.lastX = player.x;
      }
    }
    if (keys['ArrowLeft']) {
      player.x -= player.speed;
      player.facingRight = false;
    }
    if (keys['ArrowUp'] && player.grounded) {
      player.velocityY = player.jumpForce;
      player.grounded = false;
      updateScore('jump');
      synth.playSequence(gameMelodies.jump, 240);
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
      updateScore('spikeHit');
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
      updateScore('levelComplete');
      synth.playSequence(gameMelodies.win, 120);
    }
  }

  // Draw score
  drawScore();

  if (gameWon) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('Level Complete! Press Enter.', 150, 200);
    ctx.font = '24px sans-serif';
    ctx.fillText(`Final Score: ${Math.floor(score.points)}`, 150, 240);
    ctx.fillText(`Max Combo: ${score.maxCombo}x`, 150, 280);
  } else if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('You Lost! Press Enter to Retry.', 120, 200);
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${Math.floor(score.points)}`, 150, 240);
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Start game with music
function startGame() {
  playBackgroundMusic();
  gameLoop();
}
