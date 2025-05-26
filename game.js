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

// High score system
const highScores = {
  scores: JSON.parse(localStorage.getItem('highScores')) || [],
  maxEntries: 10,
  
  addScore(score, level) {
    const date = new Date().toLocaleDateString();
    this.scores.push({ score, level, date });
    this.scores.sort((a, b) => b.score - a.score);
    if (this.scores.length > this.maxEntries) {
      this.scores = this.scores.slice(0, this.maxEntries);
    }
    localStorage.setItem('highScores', JSON.stringify(this.scores));
  },
  
  getTopScores() {
    return this.scores.slice(0, this.maxEntries);
  }
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

// Draw high score table
function drawHighScoreTable() {
  const scores = highScores.getTopScores();
  const startX = canvas.width / 2 - 200;
  const startY = 100;
  const rowHeight = 30;
  
  // Draw table background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(startX - 10, startY - 40, 420, (scores.length + 1) * rowHeight + 50);
  
  // Draw table header
  ctx.fillStyle = 'black';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('High Scores', canvas.width / 2, startY);
  
  // Draw column headers
  ctx.font = 'bold 18px Arial';
  ctx.fillText('Rank', startX + 30, startY + 30);
  ctx.fillText('Score', startX + 120, startY + 30);
  ctx.fillText('Level', startX + 220, startY + 30);
  ctx.fillText('Date', startX + 320, startY + 30);
  
  // Draw scores
  ctx.font = '16px Arial';
  scores.forEach((entry, index) => {
    const y = startY + 60 + (index * rowHeight);
    ctx.textAlign = 'center';
    ctx.fillText(`${index + 1}`, startX + 30, y);
    ctx.fillText(`${Math.floor(entry.score)}`, startX + 120, y);
    ctx.fillText(`Level ${entry.level + 1}`, startX + 220, y);
    ctx.fillText(entry.date, startX + 320, y);
  });
}

// Add restart button handling
function setupRestartButton() {
  const restartButton = document.getElementById('restartButton');
  
  restartButton.addEventListener('click', () => {
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
    restartButton.style.display = 'none';
    playBackgroundMusic();
    requestAnimationFrame(gameLoop);
  });
}

// Update the game loop to show/hide restart button
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
    
    // Add score to high scores
    highScores.addScore(score.points, currentLevel);
    
    // Show high score table
    drawHighScoreTable();
    
    // Show restart button
    document.getElementById('restartButton').style.display = 'block';
    document.getElementById('restartButton').textContent = 'Next Level';
  } else if (gameLost) {
    ctx.fillStyle = 'black';
    ctx.font = '36px sans-serif';
    ctx.fillText('You Lost! Press Enter to Retry.', 120, 200);
    ctx.font = '24px sans-serif';
    ctx.fillText(`Score: ${Math.floor(score.points)}`, 150, 240);
    
    // Show high score table
    drawHighScoreTable();
    
    // Show restart button
    document.getElementById('restartButton').style.display = 'block';
    document.getElementById('restartButton').textContent = 'Try Again';
  } else {
    requestAnimationFrame(gameLoop);
  }
}

// Add touch controls
function setupTouchControls() {
  const leftButton = document.getElementById('leftButton');
  const rightButton = document.getElementById('rightButton');
  const jumpButton = document.getElementById('jumpButton');

  // Left button controls
  leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = true;
  });
  leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowLeft'] = false;
  });

  // Right button controls
  rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = true;
  });
  rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowRight'] = false;
  });

  // Jump button controls
  jumpButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['ArrowUp'] = true;
  });
  jumpButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['ArrowUp'] = false;
  });

  // Prevent default touch behavior on buttons
  [leftButton, rightButton, jumpButton].forEach(button => {
    button.addEventListener('touchmove', (e) => {
      e.preventDefault();
    });
  });
}

// Call setupTouchControls when the game starts
function startGame() {
  setupTouchControls();
  setupRestartButton();
  playBackgroundMusic();
  gameLoop();
}

// Add a function to show high scores during gameplay
function toggleHighScores() {
  const showScores = !document.getElementById('highScoresOverlay');
  if (showScores) {
    const overlay = document.createElement('div');
    overlay.id = 'highScoresOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    
    const table = document.createElement('div');
    table.style.backgroundColor = 'white';
    table.style.padding = '20px';
    table.style.borderRadius = '10px';
    table.style.maxWidth = '80%';
    table.style.maxHeight = '80%';
    table.style.overflow = 'auto';
    
    const scores = highScores.getTopScores();
    let html = '<h2 style="text-align: center;">High Scores</h2>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<tr><th>Rank</th><th>Score</th><th>Level</th><th>Date</th></tr>';
    
    scores.forEach((entry, index) => {
      html += `<tr>
        <td style="padding: 8px; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; text-align: center;">${Math.floor(entry.score)}</td>
        <td style="padding: 8px; text-align: center;">Level ${entry.level + 1}</td>
        <td style="padding: 8px; text-align: center;">${entry.date}</td>
      </tr>`;
    });
    
    html += '</table>';
    html += '<p style="text-align: center; margin-top: 20px;">Press H to close</p>';
    table.innerHTML = html;
    overlay.appendChild(table);
    document.body.appendChild(overlay);
  } else {
    const overlay = document.getElementById('highScoresOverlay');
    if (overlay) {
      overlay.remove();
    }
  }
}
