const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let cameraX = 0;

// Audio system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundMusic = new Audio('audio/background.mp3');
let backgroundMusicInterval = null;
let audioInitialized = false;

// Add loading verification
backgroundMusic.addEventListener('loadeddata', () => {
  console.log('Background music loaded successfully');
});

backgroundMusic.addEventListener('error', (e) => {
  console.error('Error loading background music:', e);
});

// Audio controls
function initializeAudio() {
  console.log('Initializing audio...');
  if (!audioInitialized) {
    try {
      // Resume audio context
      audioContext.resume();
      
      // Set volume and ensure it's not muted
      backgroundMusic.volume = 0.2; // Reduced from 1.0 to 0.2 for quieter background
      backgroundMusic.muted = false;
      backgroundMusic.loop = true;
      
      // Log current audio state
      console.log('Audio state:', {
        volume: backgroundMusic.volume,
        muted: backgroundMusic.muted,
        paused: backgroundMusic.paused,
        readyState: backgroundMusic.readyState
      });
      
      audioInitialized = true;
      console.log('Audio initialized successfully');
      playBackgroundMusic();
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }
}

function toggleMute() {
  console.log('Toggling mute, audio initialized:', audioInitialized);
  if (!audioInitialized) {
    initializeAudio();
  } else {
    backgroundMusic.muted = !backgroundMusic.muted;
    console.log('Audio muted:', backgroundMusic.muted);
  }
}

function playBackgroundMusic() {
  console.log('Attempting to play background music...');
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
  }
  
  // Force reload the audio
  backgroundMusic.load();
  
  backgroundMusic.play()
    .then(() => {
      console.log('Background music started successfully');
      // Log audio state after successful play
      console.log('Audio state after play:', {
        volume: backgroundMusic.volume,
        muted: backgroundMusic.muted,
        paused: backgroundMusic.paused,
        readyState: backgroundMusic.readyState
      });
    })
    .catch(error => console.error('Background music failed to play:', error));
}

function stopBackgroundMusic() {
  if (backgroundMusicInterval) {
    clearInterval(backgroundMusicInterval);
    backgroundMusicInterval = null;
  }
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

// Sprite loading
const sprites = {
  player: new Image(),
  spike: new Image(),
  portal: new Image(),
  ground: new Image(),
  coin: new Image(),
  gem: new Image(),
  key: new Image(),
  zombie: new Image(),
  platform: new Image(),
  bouncingPlatform: new Image()
};

let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;
let gameStarted = false;

function checkAllSpritesLoaded() {
  spritesLoaded++;
  if (spritesLoaded === totalSprites) {
    // Show play button and start game setup
    document.getElementById('playButton').style.display = 'block';
    startGame();
  }
}

// Load sprites
sprites.player.onload = checkAllSpritesLoaded;
sprites.spike.onload = checkAllSpritesLoaded;
sprites.portal.onload = checkAllSpritesLoaded;
sprites.ground.onload = checkAllSpritesLoaded;
sprites.coin.onload = checkAllSpritesLoaded;
sprites.gem.onload = checkAllSpritesLoaded;
sprites.key.onload = checkAllSpritesLoaded;
sprites.zombie.onload = checkAllSpritesLoaded;
sprites.platform.onload = checkAllSpritesLoaded;
sprites.bouncingPlatform.onload = checkAllSpritesLoaded;

sprites.player.src = 'sprites/player.svg';
sprites.spike.src = 'sprites/spike.svg';
sprites.portal.src = 'sprites/portal.svg';
sprites.ground.src = 'sprites/ground.svg';
sprites.coin.src = 'sprites/coin.svg';
sprites.gem.src = 'sprites/gem.svg';
sprites.key.src = 'sprites/key.svg';
sprites.zombie.src = 'sprites/zombie.svg';
sprites.platform.src = 'sprites/platform.svg';
sprites.bouncingPlatform.src = 'sprites/bouncing_platform.svg';

// Add hazard types
const HAZARD_TYPES = {
  WATER: {
    color: '#4a90e2',
    damage: 10,
    name: 'water',
    effect: 'sink'
  },
  LAVA: {
    color: '#e74c3c',
    damage: 20,
    name: 'lava',
    effect: 'burn'
  }
};

// Add collectible types
const COLLECTIBLE_TYPES = {
  COIN: {
    points: 100,
    sprite: 'coin',
    name: 'coin'
  },
  GEM: {
    points: 500,
    sprite: 'gem',
    name: 'gem'
  },
  KEY: {
    points: 1000,
    sprite: 'key',
    name: 'key',
    unlocksSecret: true
  }
};

// Update levels to include hazards, collectibles, zombies, and platforms
const levels = [
  {
    portal: { x: 1600, y: 350 },
    spikes: [
      { x: 400, y: 360, width: 20, height: 20, name:"spike1" },
      { x: 800, y: 360, width: 20, height: 20, name:"spike2" },
      { x: 1200, y: 360, width: 20, height: 20, name:"spike3" }
    ],
    hazards: [
      { x: 600, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 1000, y: 379, width: 100, height: 20, type: 'LAVA' }
    ],
    zombies: [
      { x: 300, y: 350, width: 30, height: 30, speed: 1, direction: 1, startX: 300, endX: 500 }
    ],
    platforms: [
      { x: 200, y: 320, width: 100, height: 20 },
      { x: 500, y: 280, width: 80, height: 20 },
      { x: 800, y: 240, width: 100, height: 20 },
      { x: 1100, y: 300, width: 80, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 350, y: 250, width: 100, height: 20, bounceForce: -12 },
      { x: 950, y: 200, width: 80, height: 20, bounceForce: -15 }
    ],
    collectibles: [
      { x: 300, y: 280, type: 'COIN' },
      { x: 500, y: 240, type: 'COIN' },
      { x: 700, y: 200, type: 'GEM' },
      { x: 900, y: 260, type: 'KEY' }
    ],
    secretAreas: [
      {
        x: 1200,
        y: 200,
        width: 100,
        height: 100,
        requiresKey: true,
        collectibles: [
          { x: 1250, y: 250, type: 'GEM' },
          { x: 1300, y: 250, type: 'GEM' }
        ]
      }
    ]
  },
  {
    portal: { x: 1970, y: 350 },
    spikes: [
      { x: 500, y: 340, width: 20, height: 40 },
      { x: 900, y: 340, width: 20, height: 40 },
      { x: 1300, y: 340, width: 20, height: 40 },
      { x: 1700, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 700, y: 379, width: 150, height: 20, type: 'WATER' },
      { x: 1100, y: 379, width: 150, height: 20, type: 'LAVA' },
      { x: 1500, y: 379, width: 150, height: 20, type: 'WATER' }
    ],
    zombies: [
      { x: 400, y: 350, width: 30, height: 30, speed: 1.2, direction: 1, startX: 400, endX: 600 },
      { x: 1000, y: 350, width: 30, height: 30, speed: 1.2, direction: 1, startX: 1000, endX: 1200 }
    ],
    platforms: [
      { x: 300, y: 300, width: 120, height: 20 },
      { x: 600, y: 260, width: 100, height: 20 },
      { x: 850, y: 320, width: 80, height: 20 },
      { x: 1200, y: 280, width: 100, height: 20 },
      { x: 1500, y: 240, width: 120, height: 20 },
      { x: 1750, y: 300, width: 80, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 450, y: 200, width: 100, height: 20, bounceForce: -14 },
      { x: 1050, y: 180, width: 80, height: 20, bounceForce: -16 },
      { x: 1650, y: 160, width: 100, height: 20, bounceForce: -18 }
    ],
    collectibles: [
      { x: 400, y: 260, type: 'COIN' },
      { x: 450, y: 260, type: 'COIN' },
      { x: 500, y: 260, type: 'COIN' },
      { x: 800, y: 220, type: 'GEM' },
      { x: 1200, y: 240, type: 'KEY' },
      { x: 1600, y: 200, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 1400,
        y: 150,
        width: 150,
        height: 150,
        requiresKey: true,
        collectibles: [
          { x: 1450, y: 200, type: 'GEM' },
          { x: 1500, y: 200, type: 'GEM' },
          { x: 1475, y: 250, type: 'COIN' }
        ]
      }
    ]
  },
  {
    portal: { x: 2200, y: 350 },
    spikes: [
      { x: 400, y: 340, width: 20, height: 40 },
      { x: 600, y: 340, width: 20, height: 40 },
      { x: 800, y: 340, width: 20, height: 40 },
      { x: 1000, y: 340, width: 20, height: 40 },
      { x: 1200, y: 340, width: 20, height: 40 },
      { x: 1400, y: 340, width: 20, height: 40 },
      { x: 1600, y: 340, width: 20, height: 40 },
      { x: 1800, y: 340, width: 20, height: 40 },
      { x: 2000, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 500, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 700, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 900, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1100, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 1300, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1500, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 1700, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1900, y: 379, width: 80, height: 20, type: 'WATER' }
    ],
    zombies: [
      { x: 300, y: 350, width: 30, height: 30, speed: 1.5, direction: 1, startX: 300, endX: 500 },
      { x: 700, y: 350, width: 30, height: 30, speed: 1.5, direction: 1, startX: 700, endX: 900 },
      { x: 1100, y: 350, width: 30, height: 30, speed: 1.5, direction: 1, startX: 1100, endX: 1300 },
      { x: 1500, y: 350, width: 30, height: 30, speed: 1.5, direction: 1, startX: 1500, endX: 1700 }
    ],
    platforms: [
      { x: 250, y: 280, width: 100, height: 20 },
      { x: 450, y: 240, width: 80, height: 20 },
      { x: 650, y: 320, width: 60, height: 20 },
      { x: 850, y: 280, width: 100, height: 20 },
      { x: 1050, y: 240, width: 80, height: 20 },
      { x: 1250, y: 320, width: 60, height: 20 },
      { x: 1450, y: 280, width: 100, height: 20 },
      { x: 1650, y: 240, width: 80, height: 20 },
      { x: 1850, y: 320, width: 100, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 350, y: 180, width: 100, height: 20, bounceForce: -16 },
      { x: 750, y: 160, width: 80, height: 20, bounceForce: -18 },
      { x: 1150, y: 140, width: 100, height: 20, bounceForce: -20 },
      { x: 1550, y: 120, width: 80, height: 20, bounceForce: -22 }
    ],
    collectibles: [
      { x: 350, y: 240, type: 'COIN' },
      { x: 650, y: 200, type: 'COIN' },
      { x: 950, y: 240, type: 'COIN' },
      { x: 1250, y: 200, type: 'GEM' },
      { x: 1550, y: 240, type: 'KEY' },
      { x: 1850, y: 280, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 1000,
        y: 100,
        width: 200,
        height: 200,
        requiresKey: true,
        collectibles: [
          { x: 1050, y: 150, type: 'GEM' },
          { x: 1100, y: 150, type: 'GEM' },
          { x: 1150, y: 150, type: 'GEM' },
          { x: 1075, y: 200, type: 'COIN' },
          { x: 1125, y: 200, type: 'COIN' }
        ]
      }
    ]
  },
  {
    portal: { x: 2500, y: 350 },
    spikes: [
      { x: 300, y: 340, width: 20, height: 40 },
      { x: 500, y: 340, width: 20, height: 40 },
      { x: 700, y: 340, width: 20, height: 40 },
      { x: 900, y: 340, width: 20, height: 40 },
      { x: 1100, y: 340, width: 20, height: 40 },
      { x: 1300, y: 340, width: 20, height: 40 },
      { x: 1500, y: 340, width: 20, height: 40 },
      { x: 1700, y: 340, width: 20, height: 40 },
      { x: 1900, y: 340, width: 20, height: 40 },
      { x: 2100, y: 340, width: 20, height: 40 },
      { x: 2300, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 400, y: 379, width: 60, height: 20, type: 'LAVA' },
      { x: 600, y: 379, width: 60, height: 20, type: 'WATER' },
      { x: 800, y: 379, width: 60, height: 20, type: 'LAVA' },
      { x: 1000, y: 379, width: 60, height: 20, type: 'WATER' },
      { x: 1200, y: 379, width: 60, height: 20, type: 'LAVA' },
      { x: 1400, y: 379, width: 60, height: 20, type: 'WATER' },
      { x: 1600, y: 379, width: 60, height: 20, type: 'LAVA' },
      { x: 1800, y: 379, width: 60, height: 20, type: 'WATER' },
      { x: 2000, y: 379, width: 60, height: 20, type: 'LAVA' },
      { x: 2200, y: 379, width: 60, height: 20, type: 'WATER' }
    ],
    zombies: [
      { x: 200, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 200, endX: 400 },
      { x: 600, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 600, endX: 800 },
      { x: 1000, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 1000, endX: 1200 },
      { x: 1400, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 1400, endX: 1600 },
      { x: 1800, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 1800, endX: 2000 },
      { x: 2200, y: 350, width: 30, height: 30, speed: 2, direction: 1, startX: 2200, endX: 2400 }
    ],
    platforms: [
      { x: 150, y: 280, width: 120, height: 20 },
      { x: 350, y: 240, width: 100, height: 20 },
      { x: 550, y: 320, width: 80, height: 20 },
      { x: 750, y: 280, width: 120, height: 20 },
      { x: 950, y: 240, width: 100, height: 20 },
      { x: 1150, y: 320, width: 80, height: 20 },
      { x: 1350, y: 280, width: 120, height: 20 },
      { x: 1550, y: 240, width: 100, height: 20 },
      { x: 1750, y: 320, width: 80, height: 20 },
      { x: 1950, y: 280, width: 120, height: 20 },
      { x: 2150, y: 240, width: 100, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 250, y: 160, width: 100, height: 20, bounceForce: -18 },
      { x: 650, y: 140, width: 80, height: 20, bounceForce: -20 },
      { x: 1050, y: 120, width: 100, height: 20, bounceForce: -22 },
      { x: 1450, y: 100, width: 80, height: 20, bounceForce: -24 },
      { x: 1850, y: 80, width: 100, height: 20, bounceForce: -26 }
    ],
    collectibles: [
      { x: 250, y: 240, type: 'COIN' },
      { x: 550, y: 200, type: 'COIN' },
      { x: 850, y: 240, type: 'COIN' },
      { x: 1150, y: 280, type: 'GEM' },
      { x: 1450, y: 200, type: 'KEY' },
      { x: 1750, y: 280, type: 'GEM' },
      { x: 2050, y: 200, type: 'COIN' },
      { x: 2350, y: 200, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 1200,
        y: 50,
        width: 250,
        height: 250,
        requiresKey: true,
        collectibles: [
          { x: 1250, y: 100, type: 'GEM' },
          { x: 1300, y: 100, type: 'GEM' },
          { x: 1350, y: 100, type: 'GEM' },
          { x: 1275, y: 150, type: 'COIN' },
          { x: 1325, y: 150, type: 'COIN' },
          { x: 1375, y: 150, type: 'COIN' }
        ]
      },
      {
        x: 2000,
        y: 100,
        width: 200,
        height: 200,
        requiresKey: true,
        collectibles: [
          { x: 2050, y: 150, type: 'GEM' },
          { x: 2100, y: 150, type: 'GEM' },
          { x: 2150, y: 150, type: 'GEM' }
        ]
      }
    ]
  },
  {
    portal: { x: 3000, y: 350 },
    spikes: [
      { x: 400, y: 340, width: 20, height: 40 },
      { x: 600, y: 340, width: 20, height: 40 },
      { x: 800, y: 340, width: 20, height: 40 },
      { x: 1000, y: 340, width: 20, height: 40 },
      { x: 1200, y: 340, width: 20, height: 40 },
      { x: 1400, y: 340, width: 20, height: 40 },
      { x: 1600, y: 340, width: 20, height: 40 },
      { x: 1800, y: 340, width: 20, height: 40 },
      { x: 2000, y: 340, width: 20, height: 40 },
      { x: 2200, y: 340, width: 20, height: 40 },
      { x: 2400, y: 340, width: 20, height: 40 },
      { x: 2600, y: 340, width: 20, height: 40 },
      { x: 2800, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 500, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 700, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 900, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1100, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 1300, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1500, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 1700, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 1900, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 2100, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 2300, y: 379, width: 80, height: 20, type: 'WATER' },
      { x: 2500, y: 379, width: 80, height: 20, type: 'LAVA' },
      { x: 2700, y: 379, width: 80, height: 20, type: 'WATER' }
    ],
    zombies: [
      { x: 300, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 300, endX: 500 },
      { x: 600, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 600, endX: 800 },
      { x: 900, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 900, endX: 1100 },
      { x: 1200, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 1200, endX: 1400 },
      { x: 1500, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 1500, endX: 1700 },
      { x: 1800, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 1800, endX: 2000 },
      { x: 2100, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 2100, endX: 2300 },
      { x: 2400, y: 350, width: 30, height: 30, speed: 2.2, direction: 1, startX: 2400, endX: 2600 }
    ],
    platforms: [
      { x: 200, y: 300, width: 100, height: 20 },
      { x: 450, y: 260, width: 80, height: 20 },
      { x: 700, y: 320, width: 60, height: 20 },
      { x: 950, y: 280, width: 100, height: 20 },
      { x: 1200, y: 240, width: 80, height: 20 },
      { x: 1450, y: 320, width: 60, height: 20 },
      { x: 1700, y: 280, width: 100, height: 20 },
      { x: 1950, y: 240, width: 80, height: 20 },
      { x: 2200, y: 320, width: 60, height: 20 },
      { x: 2450, y: 280, width: 100, height: 20 },
      { x: 2700, y: 240, width: 80, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 350, y: 180, width: 100, height: 20, bounceForce: -20 },
      { x: 750, y: 160, width: 80, height: 20, bounceForce: -22 },
      { x: 1150, y: 140, width: 100, height: 20, bounceForce: -24 },
      { x: 1550, y: 120, width: 80, height: 20, bounceForce: -26 },
      { x: 1950, y: 100, width: 100, height: 20, bounceForce: -28 },
      { x: 2350, y: 80, width: 80, height: 20, bounceForce: -30 }
    ],
    collectibles: [
      { x: 300, y: 260, type: 'COIN' },
      { x: 500, y: 220, type: 'COIN' },
      { x: 700, y: 280, type: 'COIN' },
      { x: 900, y: 240, type: 'GEM' },
      { x: 1200, y: 200, type: 'COIN' },
      { x: 1500, y: 240, type: 'GEM' },
      { x: 1800, y: 200, type: 'KEY' },
      { x: 2100, y: 240, type: 'GEM' },
      { x: 2400, y: 200, type: 'COIN' },
      { x: 2700, y: 200, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 1600,
        y: 50,
        width: 300,
        height: 300,
        requiresKey: true,
        collectibles: [
          { x: 1700, y: 100, type: 'GEM' },
          { x: 1750, y: 100, type: 'GEM' },
          { x: 1800, y: 100, type: 'GEM' },
          { x: 1850, y: 100, type: 'GEM' },
          { x: 1725, y: 150, type: 'COIN' },
          { x: 1775, y: 150, type: 'COIN' },
          { x: 1825, y: 150, type: 'COIN' }
        ]
      }
    ]
  },
  {
    portal: { x: 3500, y: 350 },
    spikes: [
      { x: 300, y: 340, width: 20, height: 40 },
      { x: 500, y: 340, width: 20, height: 40 },
      { x: 700, y: 340, width: 20, height: 40 },
      { x: 900, y: 340, width: 20, height: 40 },
      { x: 1100, y: 340, width: 20, height: 40 },
      { x: 1300, y: 340, width: 20, height: 40 },
      { x: 1500, y: 340, width: 20, height: 40 },
      { x: 1700, y: 340, width: 20, height: 40 },
      { x: 1900, y: 340, width: 20, height: 40 },
      { x: 2100, y: 340, width: 20, height: 40 },
      { x: 2300, y: 340, width: 20, height: 40 },
      { x: 2500, y: 340, width: 20, height: 40 },
      { x: 2700, y: 340, width: 20, height: 40 },
      { x: 2900, y: 340, width: 20, height: 40 },
      { x: 3100, y: 340, width: 20, height: 40 },
      { x: 3300, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 400, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 600, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 800, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 1000, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 1200, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 1400, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 1600, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 1800, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 2000, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 2200, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 2400, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 2600, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 2800, y: 379, width: 100, height: 20, type: 'LAVA' },
      { x: 3000, y: 379, width: 100, height: 20, type: 'WATER' },
      { x: 3200, y: 379, width: 100, height: 20, type: 'LAVA' }
    ],
    zombies: [
      { x: 250, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 250, endX: 450 },
      { x: 550, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 550, endX: 750 },
      { x: 850, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 850, endX: 1050 },
      { x: 1150, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 1150, endX: 1350 },
      { x: 1450, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 1450, endX: 1650 },
      { x: 1750, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 1750, endX: 1950 },
      { x: 2050, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 2050, endX: 2250 },
      { x: 2350, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 2350, endX: 2550 },
      { x: 2650, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 2650, endX: 2850 },
      { x: 2950, y: 350, width: 30, height: 30, speed: 2.5, direction: 1, startX: 2950, endX: 3150 }
    ],
    platforms: [
      { x: 150, y: 300, width: 120, height: 20 },
      { x: 400, y: 260, width: 100, height: 20 },
      { x: 700, y: 320, width: 80, height: 20 },
      { x: 1000, y: 280, width: 120, height: 20 },
      { x: 1300, y: 240, width: 100, height: 20 },
      { x: 1600, y: 320, width: 80, height: 20 },
      { x: 1900, y: 280, width: 120, height: 20 },
      { x: 2200, y: 240, width: 100, height: 20 },
      { x: 2500, y: 320, width: 80, height: 20 },
      { x: 2800, y: 280, width: 120, height: 20 },
      { x: 3100, y: 240, width: 100, height: 20 },
      { x: 3400, y: 300, width: 80, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 300, y: 180, width: 100, height: 20, bounceForce: -22 },
      { x: 750, y: 160, width: 80, height: 20, bounceForce: -24 },
      { x: 1200, y: 140, width: 100, height: 20, bounceForce: -26 },
      { x: 1650, y: 120, width: 80, height: 20, bounceForce: -28 },
      { x: 2100, y: 100, width: 100, height: 20, bounceForce: -30 },
      { x: 2550, y: 80, width: 80, height: 20, bounceForce: -32 },
      { x: 3000, y: 60, width: 100, height: 20, bounceForce: -34 }
    ],
    collectibles: [
      { x: 300, y: 260, type: 'COIN' },
      { x: 500, y: 220, type: 'COIN' },
      { x: 700, y: 280, type: 'COIN' },
      { x: 900, y: 240, type: 'GEM' },
      { x: 1200, y: 200, type: 'COIN' },
      { x: 1500, y: 240, type: 'GEM' },
      { x: 1800, y: 200, type: 'COIN' },
      { x: 2100, y: 240, type: 'GEM' },
      { x: 2400, y: 200, type: 'KEY' },
      { x: 2700, y: 240, type: 'GEM' },
      { x: 3000, y: 200, type: 'COIN' },
      { x: 3300, y: 200, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 2000,
        y: 50,
        width: 350,
        height: 350,
        requiresKey: true,
        collectibles: [
          { x: 2100, y: 100, type: 'GEM' },
          { x: 2150, y: 100, type: 'GEM' },
          { x: 2200, y: 100, type: 'GEM' },
          { x: 2250, y: 100, type: 'GEM' },
          { x: 2125, y: 150, type: 'COIN' },
          { x: 2175, y: 150, type: 'COIN' },
          { x: 2225, y: 150, type: 'COIN' },
          { x: 2275, y: 150, type: 'COIN' }
        ]
      }
    ]
  },
  {
    portal: { x: 4000, y: 350 },
    spikes: [
      { x: 400, y: 340, width: 20, height: 40 },
      { x: 600, y: 340, width: 20, height: 40 },
      { x: 800, y: 340, width: 20, height: 40 },
      { x: 1000, y: 340, width: 20, height: 40 },
      { x: 1200, y: 340, width: 20, height: 40 },
      { x: 1400, y: 340, width: 20, height: 40 },
      { x: 1600, y: 340, width: 20, height: 40 },
      { x: 1800, y: 340, width: 20, height: 40 },
      { x: 2000, y: 340, width: 20, height: 40 },
      { x: 2200, y: 340, width: 20, height: 40 },
      { x: 2400, y: 340, width: 20, height: 40 },
      { x: 2600, y: 340, width: 20, height: 40 },
      { x: 2800, y: 340, width: 20, height: 40 },
      { x: 3000, y: 340, width: 20, height: 40 },
      { x: 3200, y: 340, width: 20, height: 40 },
      { x: 3400, y: 340, width: 20, height: 40 },
      { x: 3600, y: 340, width: 20, height: 40 },
      { x: 3800, y: 340, width: 20, height: 40 }
    ],
    hazards: [
      { x: 500, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 700, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 900, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 1100, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 1300, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 1500, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 1700, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 1900, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 2100, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 2300, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 2500, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 2700, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 2900, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 3100, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 3300, y: 379, width: 120, height: 20, type: 'LAVA' },
      { x: 3500, y: 379, width: 120, height: 20, type: 'WATER' },
      { x: 3700, y: 379, width: 120, height: 20, type: 'LAVA' }
    ],
    zombies: [
      { x: 300, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 300, endX: 500 },
      { x: 600, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 600, endX: 800 },
      { x: 900, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 900, endX: 1100 },
      { x: 1200, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 1200, endX: 1400 },
      { x: 1500, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 1500, endX: 1700 },
      { x: 1800, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 1800, endX: 2000 },
      { x: 2100, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 2100, endX: 2300 },
      { x: 2400, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 2400, endX: 2600 },
      { x: 2700, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 2700, endX: 2900 },
      { x: 3000, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 3000, endX: 3200 },
      { x: 3300, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 3300, endX: 3500 },
      { x: 3600, y: 350, width: 30, height: 30, speed: 2.8, direction: 1, startX: 3600, endX: 3800 }
    ],
    platforms: [
      { x: 200, y: 300, width: 120, height: 20 },
      { x: 450, y: 260, width: 100, height: 20 },
      { x: 750, y: 320, width: 80, height: 20 },
      { x: 1050, y: 280, width: 120, height: 20 },
      { x: 1350, y: 240, width: 100, height: 20 },
      { x: 1650, y: 320, width: 80, height: 20 },
      { x: 1950, y: 280, width: 120, height: 20 },
      { x: 2250, y: 240, width: 100, height: 20 },
      { x: 2550, y: 320, width: 80, height: 20 },
      { x: 2850, y: 280, width: 120, height: 20 },
      { x: 3150, y: 240, width: 100, height: 20 },
      { x: 3450, y: 320, width: 80, height: 20 },
      { x: 3750, y: 300, width: 100, height: 20 }
    ],
    bouncingPlatforms: [
      { x: 350, y: 180, width: 100, height: 20, bounceForce: -24 },
      { x: 800, y: 160, width: 80, height: 20, bounceForce: -26 },
      { x: 1250, y: 140, width: 100, height: 20, bounceForce: -28 },
      { x: 1700, y: 120, width: 80, height: 20, bounceForce: -30 },
      { x: 2150, y: 100, width: 100, height: 20, bounceForce: -32 },
      { x: 2600, y: 80, width: 80, height: 20, bounceForce: -34 },
      { x: 3050, y: 60, width: 100, height: 20, bounceForce: -36 },
      { x: 3500, y: 40, width: 80, height: 20, bounceForce: -38 }
    ],
    collectibles: [
      { x: 300, y: 260, type: 'COIN' },
      { x: 500, y: 220, type: 'COIN' },
      { x: 700, y: 280, type: 'COIN' },
      { x: 900, y: 240, type: 'GEM' },
      { x: 1200, y: 200, type: 'COIN' },
      { x: 1500, y: 240, type: 'GEM' },
      { x: 1800, y: 200, type: 'COIN' },
      { x: 2100, y: 240, type: 'GEM' },
      { x: 2400, y: 200, type: 'COIN' },
      { x: 2700, y: 240, type: 'GEM' },
      { x: 3000, y: 200, type: 'KEY' },
      { x: 3300, y: 240, type: 'GEM' },
      { x: 3600, y: 200, type: 'COIN' },
      { x: 3900, y: 200, type: 'GEM' }
    ],
    secretAreas: [
      {
        x: 2500,
        y: 50,
        width: 400,
        height: 400,
        requiresKey: true,
        collectibles: [
          { x: 2600, y: 100, type: 'GEM' },
          { x: 2650, y: 100, type: 'GEM' },
          { x: 2700, y: 100, type: 'GEM' },
          { x: 2750, y: 100, type: 'GEM' },
          { x: 2800, y: 100, type: 'GEM' },
          { x: 2625, y: 150, type: 'COIN' },
          { x: 2675, y: 150, type: 'COIN' },
          { x: 2725, y: 150, type: 'COIN' },
          { x: 2775, y: 150, type: 'COIN' },
          { x: 2825, y: 150, type: 'COIN' }
        ]
      }
    ]
  }
];

let currentLevel = 0;
let keys = {};
let gameWon = false;
let gameLost = false;

// Currency system (persists across levels)
const currency = {
  coins: parseInt(localStorage.getItem('coins')) || 0,
  gems: parseInt(localStorage.getItem('gems')) || 0,
  // Temporary currency collected during current level attempt
  tempCoins: 0,
  tempGems: 0,
  
  addCoins(amount) {
    // Add to temporary currency (not saved until level complete)
    this.tempCoins += amount;
  },
  
  addGems(amount) {
    // Add to temporary currency (not saved until level complete)
    this.tempGems += amount;
  },
  
  // Save temporary currency to permanent currency (called on level complete)
  saveTemporary() {
    this.coins += this.tempCoins;
    this.gems += this.tempGems;
    this.tempCoins = 0;
    this.tempGems = 0;
    this.save();
  },
  
  // Reset temporary currency (called on level failure)
  resetTemporary() {
    this.tempCoins = 0;
    this.tempGems = 0;
  },
  
  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.save();
      return true;
    }
    return false;
  },
  
  spendGems(amount) {
    if (this.gems >= amount) {
      this.gems -= amount;
      this.save();
      return true;
    }
    return false;
  },
  
  save() {
    localStorage.setItem('coins', this.coins);
    localStorage.setItem('gems', this.gems);
  },
  
  // Get total coins/gems including temporary
  getTotalCoins() {
    return this.coins + this.tempCoins;
  },
  
  getTotalGems() {
    return this.gems + this.tempGems;
  }
};

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
  JUMP: 5,
  DISTANCE: 0.1, // Points per pixel moved (reduced frequency)
  COMBO_MULTIPLIER: 1.2,
  LEVEL_COMPLETE: 500,
  SPIKE_HIT: -50,
  COIN: 50,
  GEM: 200,
  KEY: 500
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
  ctx.fillText(`Coins: ${currency.getTotalCoins()}`, 20, 120);
  ctx.fillText(`Gems: ${currency.getTotalGems()}`, 20, 150);
  if (player.hasKey) {
    ctx.fillText('Key: Yes', 20, 180);
  }
}

// Update score
function updateScore(type, value = 1) {
  switch(type) {
    case 'jump':
      score.jumpCount++;
      // Jumping gives points but doesn't increase combo
      score.points += SCORE_VALUES.JUMP;
      break;
    case 'distance':
      score.distance += value;
      score.points += SCORE_VALUES.DISTANCE * value;
      // Don't increase combo for distance - combo should only come from collectibles
      break;
    case 'levelComplete':
      score.points += SCORE_VALUES.LEVEL_COMPLETE * (1 + (score.combo * 0.05));
      if (score.points > score.highScore) {
        score.highScore = score.points;
        localStorage.setItem('highScore', score.highScore);
      }
      break;
    case 'spikeHit':
      score.points = Math.max(0, score.points + SCORE_VALUES.SPIKE_HIT);
      score.combo = 0;
      break;
    case 'collectible':
      score.points += value;
      score.combo++;
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

// Character skins system
const characterSkins = {
  default: {
    name: 'Default',
    unlocked: true,
    sprite: 'player'
  },
  red: {
    name: 'Red Hero',
    unlocked: false,
    sprite: 'player_red'
  },
  green: {
    name: 'Green Hero',
    unlocked: false,
    sprite: 'player_green'
  },
  gold: {
    name: 'Gold Hero',
    unlocked: false,
    sprite: 'player_gold'
  },
  purple: {
    name: 'Purple Hero',
    unlocked: false,
    sprite: 'player_purple'
  }
};

// Load unlocked skins from localStorage
function loadUnlockedSkins() {
  const saved = JSON.parse(localStorage.getItem('unlockedSkins')) || {};
  Object.keys(characterSkins).forEach(skinId => {
    if (saved[skinId] !== undefined) {
      characterSkins[skinId].unlocked = saved[skinId];
    }
  });
}

// Save unlocked skins to localStorage
function saveUnlockedSkins() {
  const toSave = {};
  Object.keys(characterSkins).forEach(skinId => {
    toSave[skinId] = characterSkins[skinId].unlocked;
  });
  localStorage.setItem('unlockedSkins', JSON.stringify(toSave));
}

// Get current player skin
function getCurrentSkin() {
  const skinId = localStorage.getItem('currentSkin') || 'default';
  return characterSkins[skinId] || characterSkins.default;
}

// Update player object to include health
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
  facingRight: true,
  health: 100,
  invulnerable: false,
  hasKey: false,
  collectedItems: [],
  skinId: 'default'
};

// Add collection sound
const collectSound = new Audio('audio/collect.wav');
collectSound.volume = 0.7;

// Add zombie sound
const zombieSound = new Audio('audio/zombie.wav');
zombieSound.volume = 0.7;

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
    } else {
      // Reset temporary currency if restarting after failure
      currency.resetTemporary();
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
  // Pause game loop if shop is open
  if (shopOpen) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cameraX = player.x - canvas.width / 2;
  if (cameraX < 0) cameraX = 0;
  
  if (!gameWon && !gameLost) {
    // Movement
    if (keys['ArrowRight']) {
      player.x += player.speed;
      player.facingRight = true;
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

    // Combo only comes from collectibles - no decay system needed
    if (keys['ArrowUp'] && player.grounded) {
      player.velocityY = player.jumpForce;
      player.grounded = false;
      // Jumping no longer gives points to prevent score farming
      const jumpSound = new Audio('audio/jump.wav');
      jumpSound.volume = 0.7;
      jumpSound.play().catch(error => console.error('Jump sound failed to play:', error));
    }

    // Get current level info
    const currentLevelData = levels[currentLevel];
    const portal = currentLevelData.portal;
    const spikes = currentLevelData.spikes;
    const hazards = currentLevelData.hazards;
    const collectibles = currentLevelData.collectibles;
    const secretAreas = currentLevelData.secretAreas;
    const zombies = currentLevelData.zombies;
    const platforms = currentLevelData.platforms;
    const bouncingPlatforms = currentLevelData.bouncingPlatforms;
    
    // Debug: log platform data
    if (platforms && platforms.length > 0) {
      console.log('Platforms found:', platforms.length, platforms);
    }
    if (bouncingPlatforms && bouncingPlatforms.length > 0) {
      console.log('Bouncing platforms found:', bouncingPlatforms.length, bouncingPlatforms);
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

    // Platform collision
    platforms.forEach(platform => {
      if (player.x < platform.x + platform.width &&
          player.x + player.width > platform.x &&
          player.y < platform.y + platform.height &&
          player.y + player.height > platform.y) {
        
        // Check if player is falling and hitting platform from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
          // Player is falling and hitting platform from above
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.grounded = true;
        }
        // Check if player is jumping up and hitting platform from below
        else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
          // Player is jumping up and hitting platform from below
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
      }
    });

    // Bouncing platform collision
    bouncingPlatforms.forEach(platform => {
      if (player.x < platform.x + platform.width &&
          player.x + player.width > platform.x &&
          player.y < platform.y + platform.height &&
          player.y + player.height > platform.y) {
        
        // Check if player is falling and hitting bouncing platform from above
        if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
          // Player is falling and hitting bouncing platform from above
          player.y = platform.y - player.height;
          player.velocityY = platform.bounceForce; // Apply bounce force
          player.grounded = false; // Player is now bouncing, not grounded
          
          // Play bounce sound
          const bounceSound = new Audio('audio/jump.wav');
          bounceSound.volume = 0.8;
          bounceSound.play().catch(error => console.error('Bounce sound failed to play:', error));
        }
        // Check if player is jumping up and hitting bouncing platform from below
        else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
          // Player is jumping up and hitting bouncing platform from below
          player.y = platform.y + platform.height;
          player.velocityY = 0;
        }
      }
    });

    if (player.x < 0) player.x = 0;

    // Check spike collisions
    spikes.forEach(spike => {
      if (player.x < spike.x + spike.width &&
          player.x + player.width > spike.x &&
          player.y < spike.y + spike.height &&
          player.y + player.height > spike.y) {
        // Player hit a spike
        gameLost = true;
        stopBackgroundMusic();
        // Reset temporary currency on level failure
        currency.resetTemporary();
        const loseSound = new Audio('audio/lose.wav');
        loseSound.volume = 0.7;
        loseSound.play().catch(error => console.error('Lose sound failed to play:', error));
        updateScore('spikeHit');
      }
    });

    // Draw ground
    ctx.drawImage(sprites.ground, -cameraX, 380, 3000, 20);

    // Draw secret areas
    secretAreas.forEach(area => {
      if (!area.unlocked && player.hasKey) {
        area.unlocked = true;
      }
      
      if (area.unlocked) {
        // Draw secret area background
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.fillRect(area.x - cameraX, area.y, area.width, area.height);
        
        // Draw secret area collectibles
        area.collectibles.forEach(collectible => {
          if (!collectible.collected) {
            const sprite = sprites[COLLECTIBLE_TYPES[collectible.type].sprite];
            ctx.drawImage(sprite, collectible.x - cameraX, collectible.y, 20, 20);
            
            // Check collection
            if (player.x < collectible.x + 20 &&
                player.x + player.width > collectible.x &&
                player.y < collectible.y + 20 &&
                player.y + player.height > collectible.y) {
              handleCollectible(collectible);
            }
          }
        });
      }
    });

    // Draw collectibles
    collectibles.forEach(collectible => {
      if (!collectible.collected) {
        const sprite = sprites[COLLECTIBLE_TYPES[collectible.type].sprite];
        ctx.drawImage(sprite, collectible.x - cameraX, collectible.y, 20, 20);
        
        // Check collection
        if (player.x < collectible.x + 20 &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + 20 &&
            player.y + player.height > collectible.y) {
          handleCollectible(collectible);
        }
      }
    });

    // Draw zombies
    zombies.forEach(zombie => {
      // Move zombie
      zombie.x += zombie.speed * zombie.direction;
      
      // Change direction at boundaries
      if (zombie.x <= zombie.startX || zombie.x >= zombie.endX) {
        zombie.direction *= -1;
      }
      
      // Draw zombie
      ctx.drawImage(sprites.zombie, zombie.x - cameraX, zombie.y, zombie.width, zombie.height);
      
      // Check collision with player
      if (player.x < zombie.x + zombie.width &&
          player.x + player.width > zombie.x &&
          player.y < zombie.y + zombie.height &&
          player.y + player.height > zombie.y) {
        if (!player.invulnerable) {
          player.health -= 20;
          player.invulnerable = true;
          zombieSound.play().catch(error => console.error('Zombie sound failed to play:', error));
          setTimeout(() => player.invulnerable = false, 1000);
        }
      }
    });

    // Draw and handle hazards
    if (currentLevelData && currentLevelData.hazards) {
      currentLevelData.hazards.forEach(hazard => {
        // Draw hazard
        if (hazard.type === 'WATER') {
          ctx.fillStyle = '#4a90e2';
        } else if (hazard.type === 'LAVA') {
          ctx.fillStyle = '#e74c3c';
        }
    ctx.fillRect(hazard.x - cameraX, hazard.y, hazard.width, hazard.height);
    
        // Check collision
        if (player.x < hazard.x + hazard.width &&
            player.x + player.width > hazard.x &&
            player.y < hazard.y + hazard.height &&
            player.y + player.height > hazard.y) {
          
          if (!player.invulnerable) {
            if (hazard.type === 'WATER') {
              player.velocityY += player.gravity * 0.5;
              player.health -= 10;
            } else if (hazard.type === 'LAVA') {
              player.velocityY = -10;
              player.health -= 20;
            }
            
            player.invulnerable = true;
            setTimeout(() => player.invulnerable = false, 1000);
            
            // Visual feedback
            ctx.fillStyle = hazard.type === 'WATER' ? 'rgba(0, 0, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  });
    }

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

  // Draw health bar
  const healthBarWidth = 50;
  const healthBarHeight = 5;
  const healthPercentage = player.health / 100;
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(player.x - cameraX, player.y - 10, healthBarWidth, healthBarHeight);
  ctx.fillStyle = '#2ecc71';
  ctx.fillRect(player.x - cameraX, player.y - 10, healthBarWidth * healthPercentage, healthBarHeight);

  // Draw portal
  ctx.drawImage(sprites.portal, portal.x - cameraX, portal.y, 30, 30);

  // Draw platforms
  if (platforms && platforms.length > 0) {
    platforms.forEach(platform => {
      if (sprites.platform.complete) {
        ctx.drawImage(sprites.platform, platform.x - cameraX, platform.y, platform.width, platform.height);
      } else {
        // Fallback: draw a brown rectangle if sprite isn't loaded
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
      }
    });
  }

  // Draw bouncing platforms
  if (bouncingPlatforms && bouncingPlatforms.length > 0) {
    bouncingPlatforms.forEach(platform => {
      if (sprites.bouncingPlatform.complete) {
        ctx.drawImage(sprites.bouncingPlatform, platform.x - cameraX, platform.y, platform.width, platform.height);
      } else {
        // Fallback: draw a green rectangle if sprite isn't loaded
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
      }
    });
  }

  // Draw spikes
  spikes.forEach(spike => {
    ctx.drawImage(sprites.spike, spike.x - cameraX, spike.y, spike.width, spike.height);
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
      // Save temporary currency to permanent currency on level completion
      currency.saveTemporary();
      const winSound = new Audio('audio/win.wav');
      winSound.volume = 0.7; // Increased from 0.3 to 0.7 for louder win sound
      winSound.play().catch(error => console.error('Win sound failed to play:', error));
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

// Add keyboard controls
function setupKeyboardControls() {
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Handle Enter key for restarting after win/loss
    if (e.key === 'Enter') {
      if (gameWon || gameLost) {
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
          if (gameWon) {
            currentLevel++;
            if (currentLevel >= levels.length) {
              currentLevel = 0; // Loop back to first level
            }
          } else {
            // Reset temporary currency if restarting after failure
            currency.resetTemporary();
          }
          resetPlayer();
          resetScore();
          gameWon = false;
          gameLost = false;
          restartButton.style.display = 'none';
          playBackgroundMusic();
          requestAnimationFrame(gameLoop);
        }
      }
    }
  });
  
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });
}

// Add play button handling
function setupPlayButton() {
  const playButton = document.getElementById('playButton');
  
  playButton.addEventListener('click', () => {
    if (!gameStarted) {
      gameStarted = true;
      playButton.style.display = 'none';
      initializeAudio();
      gameLoop();
    }
  });
}

// Setup shop button
function setupShopButton() {
  const shopButton = document.getElementById('shopButton');
  if (shopButton) {
    shopButton.addEventListener('click', () => {
      if (!gameWon && !gameLost) {
        toggleShop();
      }
    });
  }
}

// Call setupTouchControls and setupKeyboardControls when the game starts
function startGame() {
  setupTouchControls();
  setupKeyboardControls();
  setupRestartButton();
  setupPlayButton();
  setupShopButton();
  // Initialize skins system
  loadUnlockedSkins();
  player.skinId = localStorage.getItem('currentSkin') || 'default';
  // Show shop button when game starts
  const shopButton = document.getElementById('shopButton');
  if (shopButton) {
    shopButton.style.display = 'block';
  }
  // Draw initial game state
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#88cc88';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw ground
  ctx.drawImage(sprites.ground, 0, 380, 3000, 20);
  // Draw player
  ctx.drawImage(sprites.player, 50, 350, 30, 30);
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

// Update reset player function
function resetPlayer() {
  player.x = 50;
  player.y = 350;
  player.velocityY = 0;
  player.grounded = true;
  player.health = 100;
  player.invulnerable = false;
  player.hasKey = false;
  player.collectedItems = [];
}

// Add click event listener for audio initialization
document.addEventListener('click', () => {
  console.log('Click detected, initializing audio...');
  if (!audioInitialized) {
    initializeAudio();
  }
});

// Add keyboard event listener for audio initialization and muting
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
  if (!audioInitialized) {
    initializeAudio();
  }
  // Add M key for muting
  if (e.key.toLowerCase() === 'm') {
    toggleMute();
  }
  // Add S key for shop (only if not in win/loss state)
  if (e.key.toLowerCase() === 's' && !gameWon && !gameLost) {
    toggleShop();
  }
});

// Shop system with chests
const shop = {
  chests: [
    {
      id: 'common',
      name: 'Common Chest',
      costCoins: 50,
      costGems: 0,
      rewards: {
        coins: [5, 15],
        gems: [0, 2],
        skins: []
      }
    },
    {
      id: 'rare',
      name: 'Rare Chest',
      costCoins: 0,
      costGems: 5,
      rewards: {
        coins: [10, 30],
        gems: [1, 5],
        skins: ['red', 'green']
      }
    },
    {
      id: 'epic',
      name: 'Epic Chest',
      costCoins: 200,
      costGems: 10,
      rewards: {
        coins: [50, 100],
        gems: [5, 15],
        skins: ['gold', 'purple']
      }
    }
  ],
  
  openChest(chestId) {
    const chest = this.chests.find(c => c.id === chestId);
    if (!chest) return null;
    
    // Check if player can afford
    if (chest.costCoins > 0 && !currency.spendCoins(chest.costCoins)) {
      return { success: false, message: 'Not enough coins!' };
    }
    if (chest.costGems > 0 && !currency.spendGems(chest.costGems)) {
      return { success: false, message: 'Not enough gems!' };
    }
    
    // Generate rewards
    const rewards = {
      coins: Math.floor(Math.random() * (chest.rewards.coins[1] - chest.rewards.coins[0] + 1)) + chest.rewards.coins[0],
      gems: Math.floor(Math.random() * (chest.rewards.gems[1] - chest.rewards.gems[0] + 1)) + chest.rewards.gems[0],
      skin: null
    };
    
    // Chance for skin reward
    if (chest.rewards.skins.length > 0 && Math.random() < 0.3) {
      const availableSkins = chest.rewards.skins.filter(skinId => !characterSkins[skinId].unlocked);
      if (availableSkins.length > 0) {
        const randomSkin = availableSkins[Math.floor(Math.random() * availableSkins.length)];
        characterSkins[randomSkin].unlocked = true;
        rewards.skin = randomSkin;
        saveUnlockedSkins();
      }
    }
    
    // Add rewards
    currency.addCoins(rewards.coins);
    currency.addGems(rewards.gems);
    
    return { success: true, rewards };
  }
};

// Shop UI
let shopOpen = false;

function toggleShop() {
  shopOpen = !shopOpen;
  const shopOverlay = document.getElementById('shopOverlay');
  if (shopOverlay) {
    if (shopOpen) {
      // Remove old overlay and create fresh one to refresh currency display
      shopOverlay.remove();
      createShopUI();
    } else {
      shopOverlay.style.display = 'none';
    }
  } else if (shopOpen) {
    createShopUI();
  }
}

function createShopUI() {
  const overlay = document.createElement('div');
  overlay.id = 'shopOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    flex-direction: column;
  `;
  // Allow closing shop by tapping outside the shop container (for tablets)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      toggleShop();
    }
  });
  overlay.addEventListener('touchend', (e) => {
    if (e.target === overlay) {
      e.preventDefault();
      toggleShop();
    }
  });
  
  const shopContainer = document.createElement('div');
  shopContainer.style.cssText = `
    background-color: white;
    padding: 30px;
    border-radius: 15px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    position: relative;
  `;
  
  // Close button in top-right corner (for tablets)
  const closeXButton = document.createElement('button');
  closeXButton.innerHTML = '✕';
  closeXButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    z-index: 2001;
    line-height: 40px;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  `;
  closeXButton.addEventListener('click', () => toggleShop());
  closeXButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleShop();
  });
  
  const title = document.createElement('h2');
  title.textContent = 'Shop';
  title.style.cssText = 'text-align: center; margin-bottom: 20px; font-size: 32px;';
  
  const currencyDisplay = document.createElement('div');
  currencyDisplay.style.cssText = 'text-align: center; margin-bottom: 20px; font-size: 20px;';
  currencyDisplay.innerHTML = `💰 Coins: ${currency.coins} | 💎 Gems: ${currency.gems}`;
  
  // Show temporary currency if any
  if (currency.tempCoins > 0 || currency.tempGems > 0) {
    const tempDisplay = document.createElement('div');
    tempDisplay.style.cssText = 'text-align: center; margin-bottom: 10px; font-size: 14px; color: #ff9800; font-style: italic;';
    tempDisplay.innerHTML = `(Pending: +${currency.tempCoins} coins, +${currency.tempGems} gems - Complete level to keep!)`;
    shopContainer.appendChild(title);
    shopContainer.appendChild(currencyDisplay);
    shopContainer.appendChild(tempDisplay);
  } else {
    shopContainer.appendChild(title);
    shopContainer.appendChild(currencyDisplay);
  }
  
  // Skin selector section
  const skinSection = document.createElement('div');
  skinSection.style.cssText = 'margin-bottom: 30px; padding: 15px; background-color: #e8f5e9; border-radius: 10px;';
  const skinTitle = document.createElement('h3');
  skinTitle.textContent = 'Character Skins';
  skinTitle.style.cssText = 'margin: 0 0 15px 0;';
  skinSection.appendChild(skinTitle);
  
  Object.keys(characterSkins).forEach(skinId => {
    const skin = characterSkins[skinId];
    const skinDiv = document.createElement('div');
    skinDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin: 5px 0;
      background-color: ${skin.unlocked ? '#c8e6c9' : '#ffcdd2'};
      border-radius: 5px;
      border: 2px solid ${player.skinId === skinId ? '#4CAF50' : '#ccc'};
    `;
    
    const skinName = document.createElement('span');
    skinName.textContent = `${skin.name} ${skin.unlocked ? '✓' : '(Locked)'}`;
    skinName.style.cssText = 'font-weight: bold;';
    
    const selectButton = document.createElement('button');
    if (skin.unlocked) {
      selectButton.textContent = player.skinId === skinId ? 'Selected' : 'Select';
      selectButton.disabled = player.skinId === skinId;
      selectButton.style.cssText = `
        padding: 5px 15px;
        background-color: ${player.skinId === skinId ? '#81c784' : '#4CAF50'};
        color: white;
        border: none;
        border-radius: 5px;
        cursor: ${player.skinId === skinId ? 'default' : 'pointer'};
      `;
      selectButton.addEventListener('click', () => {
        if (!selectButton.disabled) {
          player.skinId = skinId;
          localStorage.setItem('currentSkin', skinId);
          toggleShop();
          toggleShop(); // Reopen to refresh
        }
      });
    } else {
      selectButton.textContent = 'Locked';
      selectButton.disabled = true;
      selectButton.style.cssText = `
        padding: 5px 15px;
        background-color: #ccc;
        color: #666;
        border: none;
        border-radius: 5px;
        cursor: not-allowed;
      `;
    }
    
    skinDiv.appendChild(skinName);
    skinDiv.appendChild(selectButton);
    skinSection.appendChild(skinDiv);
  });
  
  shopContainer.appendChild(skinSection);
  
  // Chest section title
  const chestTitle = document.createElement('h3');
  chestTitle.textContent = 'Chests';
  chestTitle.style.cssText = 'margin: 20px 0 10px 0;';
  shopContainer.appendChild(chestTitle);
  
  // Create chest buttons
  shop.chests.forEach(chest => {
    const chestDiv = document.createElement('div');
    chestDiv.style.cssText = `
      border: 2px solid #333;
      border-radius: 10px;
      padding: 15px;
      margin: 10px 0;
      background-color: #f5f5f5;
    `;
    
    const chestName = document.createElement('h3');
    chestName.textContent = chest.name;
    chestName.style.cssText = 'margin: 0 0 10px 0;';
    
    const chestCost = document.createElement('p');
    let costText = '';
    if (chest.costCoins > 0) costText += `💰 ${chest.costCoins} coins`;
    if (chest.costGems > 0) {
      if (costText) costText += ' + ';
      costText += `💎 ${chest.costGems} gems`;
    }
    chestCost.textContent = `Cost: ${costText}`;
    chestCost.style.cssText = 'margin: 5px 0;';
    
    const chestRewards = document.createElement('p');
    chestRewards.textContent = `Rewards: Coins (${chest.rewards.coins[0]}-${chest.rewards.coins[1]}), Gems (${chest.rewards.gems[0]}-${chest.rewards.gems[1]}), ${chest.rewards.skins.length > 0 ? 'Possible Skin!' : 'No skins'}`;
    chestRewards.style.cssText = 'margin: 5px 0; font-size: 14px; color: #666;';
    
    const buyButton = document.createElement('button');
    buyButton.textContent = 'Open Chest';
    buyButton.style.cssText = `
      width: 100%;
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 10px;
    `;
    
    buyButton.addEventListener('click', () => {
      const result = shop.openChest(chest.id);
      if (result.success) {
        let message = `You got: ${result.rewards.coins} coins, ${result.rewards.gems} gems`;
        if (result.rewards.skin) {
          message += `, and unlocked the ${characterSkins[result.rewards.skin].name} skin!`;
        }
        alert(message);
        currencyDisplay.innerHTML = `💰 Coins: ${currency.coins} | 💎 Gems: ${currency.gems}`;
        // Update temporary currency display if it exists
        const tempDisplay = shopContainer.querySelector('div[style*="color: #ff9800"]');
        if (tempDisplay) {
          if (currency.tempCoins > 0 || currency.tempGems > 0) {
            tempDisplay.innerHTML = `(Pending: +${currency.tempCoins} coins, +${currency.tempGems} gems - Complete level to keep!)`;
          } else {
            tempDisplay.remove();
          }
        }
      } else {
        alert(result.message);
      }
    });
    
    chestDiv.appendChild(chestName);
    chestDiv.appendChild(chestCost);
    chestDiv.appendChild(chestRewards);
    chestDiv.appendChild(buyButton);
    shopContainer.appendChild(chestDiv);
  });
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close Shop (Press S)';
  closeButton.style.cssText = `
    width: 100%;
    padding: 10px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    margin-top: 20px;
  `;
  closeButton.addEventListener('click', () => toggleShop());
  closeButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleShop();
  });
  shopContainer.appendChild(closeButton);
  
  // Add close X button to shop container (must be after other elements for proper positioning)
  shopContainer.appendChild(closeXButton);
  
  overlay.appendChild(shopContainer);
  document.body.appendChild(overlay);
}

// Add collection mechanics
function handleCollectible(collectible) {
  const collectibleType = COLLECTIBLE_TYPES[collectible.type];
  if (!collectible.collected) {
    collectible.collected = true;
    updateScore('collectible', SCORE_VALUES[collectible.type]);
    collectSound.play().catch(error => console.error('Collect sound failed to play:', error));
    
    // Add currency
    if (collectible.type === 'COIN') {
      currency.addCoins(1);
    } else if (collectible.type === 'GEM') {
      currency.addGems(1);
    }
    
    if (collectibleType.unlocksSecret) {
      player.hasKey = true;
    }
    
    player.collectedItems.push(collectible.type);
  }
}
